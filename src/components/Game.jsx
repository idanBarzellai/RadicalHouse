import { useState, useEffect } from "react";
import SpyView from "./SpyView"
import PlayerView from "./PlayerView"
import LogoHeader from "./LogoHeader"
import RoomCodeDisplay from "./RoomCodeDisplay";
import './styles/Game.css'

export default function Game({ player, roomData, roomCode }) {
    const { isSpy, persona } = player;
    const [showDesc, setShowDesc] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!roomData?.endTimestamp) return;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.floor((roomData.endTimestamp - now) / 1000);
            setTimeLeft(Math.max(0, remaining));
        };

        updateTimer(); // הפעלה ראשונית מיידית
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [roomData?.endTimestamp]);

    // פורמט לתצוגת זמן
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="page-container">
            <LogoHeader />
            {/* טיימר */}
            {typeof timeLeft === "number" && timeLeft >= 0 && (
                <div className="game-timer">
                    {formatTime(timeLeft)}
                </div>
            )}
            <RoomCodeDisplay roomCode={roomCode} />
            {isSpy ? (
                <SpyView />
            ) : (
                <PlayerView
                    persona={persona}
                    event={event}
                    showDesc={showDesc}
                    toggleDesc={() => setShowDesc(prev => !prev)}
                />
            )}
            <div className="game-players">
                <h4 className="players-label">שחקנים בחדר:</h4>
                <ul className="players-list">
                    {roomData.players.map(p => (
                        <li
                            key={p.id}
                            className={`player-name ${p.id === roomData.turnStarterId ? "current-turn" : ""}`}
                        >
                            {p.name} {p.id === roomData.turnStarterId && "← מתחיל"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}