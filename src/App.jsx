import { useState, useEffect } from "react";
import { createRoom, joinRoom } from "./roomService";
import { get, update, ref as dbRef, onValue } from "firebase/database";
import { db } from "./firebase";
import Game from "./Game";

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  const startGameForAll = async () => {
    const refPath = dbRef(db, `rooms/${roomCode}`);
    const starterId = Math.floor(Math.random() * roomData.players.length) + 1;
    await update(refPath, { stage: "game", turnStarterId: starterId });
  };

  // מאזין לשינויים בחדר
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = dbRef(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      setRoomData(snapshot.val());
    });
    return () => unsubscribe();
  }, [roomCode]);

  const handleCreateRoom = async () => {
    const name = prompt("שם שחקן:");
    const { roomCode, playerId } = await createRoom(name);
    setRoomCode(roomCode);
    setPlayerId(playerId);
  };

  const handleJoinRoom = async () => {
    const code = prompt("קוד חדר:");
    if (!code) return;

    try {
      // בדיקה אם החדר קיים
      const roomRef = dbRef(db, `rooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        alert("החדר לא קיים");
        return;
      }

      const name = prompt("שם שחקן:");
      if (!name) return;

      const { playerId } = await joinRoom(code, name);
      setRoomCode(code);
      setPlayerId(playerId);
    } catch (err) {
      alert("שגיאה בהצטרפות לחדר");
      console.error(err);
    }
  };

  if (!roomCode || !roomData) {
    return (
      <div style={{ padding: "2rem", direction: "rtl" }}>
        <h1>RadicalHouse</h1>
        <button onClick={handleCreateRoom}>צור חדר</button>
        <button onClick={handleJoinRoom}>הצטרף לחדר</button>
      </div>
    );
  }

  const player = roomData.players.find(p => p.id === playerId);

  return (
    <div style={{ padding: "2rem", direction: "rtl", textAlign: "right" }}>
      <h2>קוד חדר: {roomCode}</h2>

      {roomData.stage === "lobby" ? (
        <>
          <h3>שחקנים בחדר:</h3>
          <ul>
            {roomData.players.map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
          {playerId === 1 && (
            <button onClick={startGameForAll}>
              התחל משחק
            </button>
          )}
        </>
      ) : (
        <>
          <Game player={player} event={roomData.event} />
          <hr />
          <h4>שחקנים בחדר:</h4>
          <ul>
            {roomData.players.map(p => (
              <li
                key={p.id}
                style={{
                  fontWeight: p.id === roomData.turnStarterId ? "bold" : "normal",
                  color: p.id === roomData.turnStarterId ? "darkgreen" : "black"
                }}
              >
                {p.name}
                {p.id === roomData.turnStarterId && " ← מתחיל"}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
