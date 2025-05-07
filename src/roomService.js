import { db } from "./firebase";
import { ref, get, set, update } from "firebase/database";
import { personas, events } from "./data";

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function createRoom(playerName) {
    const roomCode = generateRoomCode();

    // ערבוב רשימת הפרסונות
    const shuffledPersonas = [...personas].sort(() => 0.5 - Math.random());

    // מיקום אקראי של המרגל ברשימה (id = spyIndex + 1)
    const spyIndex = Math.floor(Math.random() * shuffledPersonas.length);
    console.log("spy index " + spyIndex);

    // בונים את השחקן הראשון
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
        endTimestamp: null
    };

    await set(ref(db, `rooms/${roomCode}`), roomData);
    return { roomCode, playerId: firstId };
}

export async function joinRoom(roomCode, playerName) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error("ROOM_NOT_FOUND");
    }

    const room = snapshot.val();
    // 🚫 lock out mid-game
    if (["game", "vote", "spyGuess"].includes(room.stage)) {
        throw new Error("GAME_IN_PROGRESS");
    }

    // normalize players in DB → dense array
    const raw = room.players || [];
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    const currentPlayers = arr.filter(p => p != null);

    const count = currentPlayers.length;
    // 🚫 enforce max 6
    if (count >= 6) {
        throw new Error("ROOM_FULL");
    }

    const playerId = count + 1;
    const { shuffledPersonas, spyIndex } = room;

    // קביעת האם המרגל לפי ה־spyIndex שהוגדר ב־createRoom
    const isSpy = spyIndex === (playerId - 1);
    // לכל שחקן שאינו המרגל נותנים את הפרסונה המתאימה מתוך shuffledPersonas
    // assign persona or null (never undefined)
    const persona = isSpy
        ? null
        : (shuffledPersonas[playerId - 1] ?? null);

    const newPlayer = {
        id: playerId,
        name: playerName,
        isSpy,
        persona
    };

    await update(roomRef, {
        players: [...currentPlayers, newPlayer]
    });

    return { roomCode, playerId };
}

export async function leaveRoom(roomCode, playerId) {
    // first load just the players
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const snapPlayers = await get(playersRef);
    if (!snapPlayers.exists()) throw new Error("ROOM_NOT_FOUND");

    const current = snapPlayers.val() || [];
    const updatedPlayers = current.filter(p => p.id !== playerId);

    // now load room-level data to decide if we must bump to "results"
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapRoom = await get(roomRef);
    const room = snapRoom.val() || {};
    const { spyIndex, stage } = room;
    const spyId = spyIndex + 1;
    const activePhases = ["game", "vote", "spyGuess"];
    const newStage = (playerId === spyId && activePhases.includes(stage))
        ? "results"
        : stage;

    // overwrite the entire players array (removes any holes)
    await set(playersRef, updatedPlayers);

    // if stage changed, write it too
    if (newStage !== stage) {
        await update(roomRef, { stage: newStage });
    }
}