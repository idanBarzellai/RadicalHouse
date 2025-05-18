import { useState } from "react";
import { createRoom, joinRoom } from "../services/roomService";
import LogoHeader from "../components/ui/LogoHeader";
import "./SplashScreen.css";

export default function SplashScreen({ onJoin }) {
    const [playerName, setPlayerName] = useState("");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [warning, setWarning] = useState("");

    const handleCreateRoom = async () => {
        if (!playerName?.trim()) {
            setWarning("נא להזין שם שחקן");
            return;
        }
        setWarning("");
        setIsCreating(true);
        try {
            const { roomCode, playerId } = await createRoom(playerName);
            onJoin({ roomCode, playerId });
        } catch (error) {
            setWarning("שגיאה ביצירת חדר. נסה שוב.");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleConfirmJoin = async () => {
        if (!playerName?.trim() || !joinCode?.trim()) {
            setWarning("נא למלא שם וקוד חדר");
            return;
        }
        setWarning("");
        setIsJoining(true);
        try {
            const { playerId } = await joinRoom(joinCode, playerName);
            onJoin({ roomCode: joinCode, playerId });
        } catch (err) {
            if (err.message === "ROOM_FULL") {
                setWarning("החדר מלא, לא ניתן להצטרף עוד.");
            } else if (err.message === "GAME_IN_PROGRESS") {
                setWarning("המשחק כבר התחיל, לא ניתן להצטרף.");
            } else if (err.message === "ROOM_NOT_FOUND") {
                setWarning("החדר לא נמצא. בדוק את הקוד ונסה שוב.");
            } else if (err.message === "ROOM_EXPIRED") {
                setWarning("החדר פג תוקף. נא ליצור חדר חדש.");
            } else {
                setWarning("שגיאה בכניסה לחדר. נסה שוב.");
                console.error(err);
            }
        } finally {
            setIsJoining(false);
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

            {warning && (
                <div className="warning-message" style={{
                    color: '#b80000',
                    backgroundColor: '#f0e6e6',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    {warning}
                </div>
            )}

            <input
                className="text-input"
                type="text"
                value={playerName}
                onChange={e => {
                    setPlayerName(e.target.value);
                    setWarning(""); // Clear warning when user types
                }}
                placeholder="שם שחקן"
            />

            <button
                className="button-rounded"
                onClick={handleCreateRoom}
                disabled={isCreating || isJoining}
                style={{ opacity: (isCreating || isJoining) ? 0.7 : 1 }}
            >
                {isCreating ? "יוצר חדר..." : "התחל משחק חדש"}
            </button>
            <button
                className="button-rounded"
                onClick={() => {
                    setShowJoinModal(true);
                    setWarning(""); // Clear warning when opening modal
                }}
                disabled={isCreating || isJoining}
                style={{ opacity: (isCreating || isJoining) ? 0.7 : 1 }}
            >
                הצטרף לקבוצה
            </button>

            {showJoinModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowJoinModal(false);
                    setWarning(""); // Clear warning when closing modal
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <input
                            className="modal-input"
                            type="text"
                            value={joinCode}
                            onChange={e => {
                                setJoinCode(e.target.value);
                                setWarning(""); // Clear warning when user types
                            }}
                            placeholder="הכנס קוד חדר (4 ספרות)"
                            disabled={isJoining}
                        />
                        <div className="modal-buttons">
                            <button
                                className="button-rounded"
                                onClick={handleConfirmJoin}
                                disabled={isJoining}
                                style={{ opacity: isJoining ? 0.7 : 1 }}
                            >
                                {isJoining ? "מצטרף..." : "אישור"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
