import { ref, get, set } from "firebase/database";
import { db } from "../firebase";

const ROOM_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes

export async function cleanupRooms() {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) return;

    const rooms = snapshot.val();
    const now = Date.now();

    for (const [roomCode, room] of Object.entries(rooms)) {
        const shouldDelete =
            // Room is too old
            (now - room.createdAt > ROOM_EXPIRY_TIME) ||
            // Room is empty
            (!room.players || room.players.length === 0) ||
            // Room has been inactive for too long
            (room.lastActivity && now - room.lastActivity > INACTIVE_TIME);

        if (shouldDelete) {
            await set(ref(db, `rooms/${roomCode}`), null);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupRooms, 60 * 60 * 1000); 