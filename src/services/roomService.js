import { db } from "./firebase";
import { ref, get, set, update } from "firebase/database";
import { personas, events } from "../data/data";
import { checkRateLimit } from "../utils/rateLimit";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation(operation, retries = MAX_RETRIES) {
    try {
        return await operation();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return retryOperation(operation, retries - 1);
        }
        throw error;
    }
}

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function updateRoomActivity(roomCode) {
    return update(ref(db, `rooms/${roomCode}`), {
        lastActivity: Date.now()
    });
}

export async function createRoom(playerName) {
    if (!playerName?.trim()) {
        throw new Error("INVALID_PLAYER_NAME");
    }

    if (!checkRateLimit(`create_${playerName}`)) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    return retryOperation(async () => {
        const roomCode = generateRoomCode();
        const shuffledPersonas = [...personas].sort(() => 0.5 - Math.random());
        const spyIndex = Math.floor(Math.random() * shuffledPersonas.length);

        const firstId = 1;
        const firstIsSpy = spyIndex === (firstId - 1);
        const firstPersona = firstIsSpy ? null : shuffledPersonas[firstId - 1];

        const players = [
            {
                id: firstId,
                name: playerName,
                isSpy: firstIsSpy,
                persona: firstPersona
            }
        ];

        const roomData = {
            shuffledPersonas,
            spyIndex,
            event: events[Math.floor(Math.random() * events.length)],
            stage: "lobby",
            players,
            turnStarterId: null,
            startTimestamp: null,
            endTimestamp: null,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        await set(ref(db, `rooms/${roomCode}`), roomData);
        return { roomCode, playerId: firstId };
    });
}

export async function joinRoom(roomCode, playerName) {
    if (!playerName?.trim()) {
        throw new Error("INVALID_PLAYER_NAME");
    }

    if (!roomCode?.match(/^\d{4}$/)) {
        throw new Error("INVALID_ROOM_CODE");
    }

    if (!checkRateLimit(`join_${playerName}`)) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    return retryOperation(async () => {
        const roomRef = ref(db, `rooms/${roomCode}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
            throw new Error("ROOM_NOT_FOUND");
        }

        const room = snapshot.val();

        // Check if room is too old (24 hours)
        if (Date.now() - room.createdAt > 24 * 60 * 60 * 1000) {
            throw new Error("ROOM_EXPIRED");
        }

        if (["game", "vote", "spyGuess"].includes(room.stage)) {
            throw new Error("GAME_IN_PROGRESS");
        }

        const raw = room.players || [];
        const arr = Array.isArray(raw) ? raw : Object.values(raw);
        const currentPlayers = arr.filter(p => p != null);

        if (currentPlayers.length >= personas.length) {
            throw new Error("ROOM_FULL");
        }

        const playerId = currentPlayers.length + 1;
        const { shuffledPersonas, spyIndex } = room;

        const isSpy = spyIndex === (playerId - 1);
        const persona = isSpy ? null : (shuffledPersonas[playerId - 1] ?? null);

        const newPlayer = {
            id: playerId,
            name: playerName,
            isSpy,
            persona
        };

        await update(roomRef, {
            players: [...currentPlayers, newPlayer],
            lastActivity: Date.now()
        });

        return { roomCode, playerId };
    });
}

export async function leaveRoom(roomCode, playerId) {
    if (!roomCode?.match(/^\d{4}$/)) {
        throw new Error("INVALID_ROOM_CODE");
    }

    return retryOperation(async () => {
        const playersRef = ref(db, `rooms/${roomCode}/players`);
        const snapPlayers = await get(playersRef);

        if (!snapPlayers.exists()) {
            throw new Error("ROOM_NOT_FOUND");
        }

        const current = snapPlayers.val() || [];
        const updatedPlayers = current.filter(p => p.id !== playerId);

        const roomRef = ref(db, `rooms/${roomCode}`);
        const snapRoom = await get(roomRef);
        const room = snapRoom.val() || {};

        const { spyIndex, stage } = room;
        const spyId = spyIndex + 1;
        const activePhases = ["pre-game", "game", "vote", "spyGuess"];
        const newStage = (playerId === spyId && activePhases.includes(stage))
            ? "results"
            : stage;

        // If the master (player 1) is leaving, assign a new master
        if (playerId === 1 && updatedPlayers.length > 0) {
            // Find the player with the lowest ID to be the new master
            const newMaster = updatedPlayers.reduce((lowest, current) =>
                current.id < lowest.id ? current : lowest
            );

            // Reassign IDs to be sequential starting from 1
            const reassignedPlayers = updatedPlayers.map((p, index) => ({
                ...p,
                id: index + 1
            }));

            await set(playersRef, reassignedPlayers);
        } else {
            await set(playersRef, updatedPlayers);
        }

        if (newStage !== stage) {
            await update(roomRef, {
                stage: newStage,
                lastActivity: Date.now()
            });
        }

        // If room is empty, delete it
        if (updatedPlayers.length === 0) {
            await set(roomRef, null);
        }
    });
}