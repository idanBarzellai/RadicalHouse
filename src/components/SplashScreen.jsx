import { useState } from "react";
import { createRoom, joinRoom } from "../roomService";
import LogoHeader from "./LogoHeader";
import "./styles/SplashScreen.css"
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
            <LogoHeader />

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
                התחל משחק חדש
            </button>

            {/* כפתור הצטרפות */}
            <button className="button-rounded"
                onClick={handleJoinRoom}
            >
                הצטרף לקבוצה
            </button>
        </div>
    );
}
