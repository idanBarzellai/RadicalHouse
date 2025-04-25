import { db } from "./firebase";
import { ref, get, set, update } from "firebase/database";
import { personas, events } from "./data";

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // מספר בן 4 ספרות
}

export async function createRoom(playerName) {
    const roomCode = generateRoomCode();
    const spyIndex = 0;
    const event = events[Math.floor(Math.random() * events.length)];

    const shuffledPersonas = [...personas].sort(() => 0.5 - Math.random());

    const players = [
        {
            id: 1,
            name: playerName,
            isSpy: spyIndex === 0,
            persona: spyIndex === 0 ? null : shuffledPersonas[0]
        }
    ];

    const roomData = {
        event,
        stage: "lobby",
        players,
        turnStarterId: 1 // נתחיל משחקן 1 רנדומלי בשלב הבא
    };

    await set(ref(db, `rooms/${roomCode}`), roomData);

    return { roomCode, playerId: 1 };
}
export async function joinRoom(roomCode, playerName) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error("החדר לא קיים");
    }

    const room = snapshot.val();
    const playerId = room.players.length + 1;

    const isSpy = room.players.some(p => p.isSpy) ? false : true; // רק שחקן אחד יהיה מרגל
    const persona = isSpy ? null : personas[Math.floor(Math.random() * personas.length)];

    const newPlayer = {
        id: playerId,
        name: playerName,
        isSpy,
        persona
    };

    const updatedPlayers = [...room.players, newPlayer];

    await update(roomRef, { players: updatedPlayers });

    return { playerId };
}