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
    const currentPlayers = room.players || [];
    const count = currentPlayers.length;

    if (count >= 6) {
        throw new Error("ROOM_FULL");
    }

    const playerId = count + 1;
    const { shuffledPersonas, spyIndex } = room;

    // קביעת האם המרגל לפי ה־spyIndex שהוגדר ב־createRoom
    const isSpy = spyIndex === (playerId - 1);
    // לכל שחקן שאינו המרגל נותנים את הפרסונה המתאימה מתוך shuffledPersonas
    const persona = isSpy ? null : shuffledPersonas[playerId - 1];

    const newPlayer = {
        id: playerId,
        name: playerName,
        isSpy,
        persona
    };

    const updatedPlayers = [...currentPlayers, newPlayer];
    await update(roomRef, { players: updatedPlayers });

    return { roomCode, playerId };
}
