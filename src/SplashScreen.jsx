import { useState } from "react";
import { createRoom, joinRoom } from "./roomService";

// // סגנונות משותפים
// const inputStyle = {
//     border: "none",
//     borderBottom: "1px solid #aaa",
//     padding: "0.5rem",
//     width: "100%",
//     marginBottom: "2rem",
//     textAlign: "center",
//     fontSize: "1rem",
//     outline: "none"
// };

// const buttonBaseStyle = {
//     width: "100%",
//     padding: "0.75rem",
//     borderRadius: "20px",
//     fontSize: "1rem",
//     fontWeight: "bold",
//     cursor: "pointer",
//     marginBottom: "1rem",
//     backgroundColor: "#fff",
//     color: "#222",
//     border: "1px solid #ccc"
// };

export default function SplashScreen({ onJoin }) {
    const [playerName, setPlayerName] = useState("");
    const [roomCode] = useState("");

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

    return (
        <div className="page-container">
            {/* לוגו וכותרת */}
            <div className="logo-block">
                <div className="logo-circle" />
                <div className="logo-title">Radicalecture</div>
            </div>

            {/* טקסט פתיחה */}
            <div className="screen-heading">
                <p><strong>ברוכים הבאים לספיי־רדיקל!</strong></p>
                <p>
                    גלו דמויות מהקהילה, גלו את האירועים בבית רדיקל,<br />
                    ונסו לחשוף – מי ביניכם הוא המרגל שלא יודע היכן הוא נמצא?
                </p>
                <p className="screen-sub">האם תצליחו לגלות אותו?</p>
            </div>

            {/* שורת שם שחקן */}
            <input className="text-input"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="שם שחקן"
            />

            {/* כפתור יצירת חדר */}
            <button className="button-rounded"
                onClick={handleCreateRoom}
            >
                🎉 התחל משחק חדש
            </button>

            {/* כפתור הצטרפות */}
            <button className="button-rounded"
                onClick={handleJoinRoom}
            >
                🚪 הצטרף לקבוצה
            </button>
        </div>
    );
}
