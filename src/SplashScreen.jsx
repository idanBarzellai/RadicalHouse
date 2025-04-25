import { useState } from "react";
import PageContainer from "./PageContainer";
import { createRoom, joinRoom } from "./roomService";

export default function SplashScreen({ onJoin }) {
    const [playerName, setPlayerName] = useState("");
    const [roomCode, setRoomCode] = useState("");

    const handleCreateRoom = async () => {
        if (!playerName) return alert("נא להזין שם שחקן");
        const { roomCode, playerId } = await createRoom(playerName);
        onJoin({ roomCode, playerId });
    };

    const handleJoinRoom = async () => {
        if (!playerName || !roomCode) return alert("נא למלא שם וקוד חדר");
        try {
            const { playerId } = await joinRoom(roomCode, playerName);
            onJoin({ roomCode, playerId });
        } catch (err) {
            alert("החדר לא קיים");
            console.error(err);
        }
    };

    const inputStyle = {
        padding: "0.5rem",
        width: "100%",
        marginBottom: "1rem",
        borderRadius: "8px",
        border: "1px solid #ccc"
    };

    const buttonStyle = {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "8px",
        color: "#fff",
        border: "none",
        fontWeight: "bold",
        marginBottom: "1rem",
        cursor: "pointer"
    };

    return (
        <PageContainer>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>מופנם רדיקלי</h1>
            <p style={{ marginBottom: "1.5rem", fontSize: "1rem", color: "#444" }}>
                משחק חשדנות באווירה קהילתית-מופנמת 🎭🌒
            </p>

            <input
                type="text"
                placeholder="הכנס/י שם"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={inputStyle}
            />

            <button
                onClick={handleCreateRoom}
                style={{ ...buttonStyle, backgroundColor: "#222" }}
            >
                🎉 צור חדר חדש
            </button>

            <input
                type="text"
                placeholder="קוד חדר (4 ספרות)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={4}
                inputMode="numeric"
                style={inputStyle}
            />

            <button
                onClick={handleJoinRoom}
                style={{ ...buttonStyle, backgroundColor: "#444" }}
            >
                🚪 הצטרף לחדר קיים
            </button>
        </PageContainer>
    );
}
