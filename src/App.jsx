import { useState, useEffect } from "react";
import { createRoom, joinRoom } from "./roomService";
import { get, update, ref as dbRef, onValue } from "firebase/database";
import { db } from "./firebase";
import Game from "./Game";
import EventCarousel from "./eventCarousel"

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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#f2f2f2",
        direction: "rtl"
      }}>
        <div style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#111", fontSize: "1.75rem", marginBottom: "1rem" }}>
            RadicalHouse
          </h1>
          <p style={{ color: "#333", fontSize: "1rem", marginBottom: "2rem" }}>
            ברוכים הבאים למשחק חברתי באווירה קווירית 🎭
          </p>
          <button onClick={handleCreateRoom} style={{ marginBottom: "1rem" }}>
            צור חדר
          </button><br />
          <button onClick={handleJoinRoom}>הצטרף לחדר</button>
        </div>
        {/* </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem",
        direction: "rtl"
      }}>
        <div style={{
          maxWidth: "600px",
          width: "100%",
          margin: "0 auto",           // 💥 הכי חשוב! זה מה שמרכז את הקופסה
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "right"
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉 בית רדיקל</h1>
          <p style={{ fontSize: "1rem", marginBottom: "2rem" }}>
            הצטרפו למשחק או צרו חדר חדש
          </p>
          <p>היכנסו לחדר חדש או הצטרפו למשחק</p>
          <button onClick={handleCreateRoom}>צור חדר</button>
          <button onClick={handleJoinRoom}>הצטרף לחדר</button>
        </div> */}
      </div>
    );
  }

  const player = roomData.players.find(p => p.id === playerId);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "start",
      minHeight: "100vh",
      backgroundColor: "#f0f0f0",
      padding: "2rem",
      direction: "rtl"
    }}>
      <div style={{
        maxWidth: "90vw",
        width: "100%",
        padding: "1.5rem",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        direction: "rtl",
        color: "#111"
      }}>

        {roomData.stage === "lobby" ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "1.5rem",
            maxWidth: "600px",
            margin: "auto",
            padding: "2rem"
          }}>
            <h2 style={{ color: "#111", fontWeight: "bold" }}>
              חדר: {roomCode}
            </h2>
            <h3>שחקנים:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {roomData.players.map(p => (
                <li key={p.id} style={{ margin: "0.5rem 0" }}>{p.name}</li>
              ))}
            </ul>

            {playerId === 1 && (
              <button onClick={startGameForAll} style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                borderRadius: "8px",
                backgroundColor: "#222",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}>
                התחל משחק
              </button>
            )}

            {/* קרוסלת האירועים */}
            <EventCarousel />
          </div>
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
    </div>
  );
}
