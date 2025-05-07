import { useState } from "react";
import { createRoom, joinRoom } from "../roomService";
import LogoHeader from "../components/LogoHeader";
import "./styles/SplashScreen.css";

export default function SplashScreen({ onJoin }) {
    const [playerName, setPlayerName] = useState("");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState("");

    const handleCreateRoom = async () => {
        if (!playerName) return alert("נא להזין שם שחקן");
        const { roomCode, playerId } = await createRoom(playerName);
        onJoin({ roomCode, playerId });
    };

    const handleConfirmJoin = async () => {
        if (!playerName || !joinCode) return alert("נא למלא שם וקוד חדר");
        try {
            const { playerId } = await joinRoom(joinCode, playerName);
            onJoin({ roomCode: joinCode, playerId });
        } catch (err) {
            if (err.message === "ROOM_FULL") {
                alert("החדר מלא, לא ניתן להצטרף עוד.");
            } else if (err.message === "GAME_IN_PROGRESS") {
                alert("המשחק כבר התחיל, לא ניתן להצטרף.");
            }
            else {
                alert("שגיאה בכניסה לחדר.");
                console.error(err);
            }
        }
    };

    return (
        <>
            <div className="screen-heading">
                <p><strong>ברוכים הבאים לספיי־רדיקל!</strong></p>
                <p>
                    גלו דמויות מהקהילה, גלו את האירועים בבית רדיקל,<br />
                    ונסו לחשוף – מי ביניכם הוא המרגל שלא יודע היכן הוא נמצא?
                </p>
                <p className="screen-sub">האם תצליחו לגלות אותו?</p>
            </div>

            <input
                className="text-input"
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="שם שחקן"
            />

            <button className="button-rounded" onClick={handleCreateRoom}>
                התחל משחק חדש
            </button>
            <button
                className="button-rounded"
                onClick={() => setShowJoinModal(true)}
            >
                הצטרף לקבוצה
            </button>

            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <input
                            className="modal-input"
                            type="text"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            placeholder="הכנס קוד חדר (4 ספרות)"
                        />
                        <div className="modal-buttons">
                            <button
                                className="button-rounded"
                                onClick={handleConfirmJoin}
                            >
                                אישור
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
