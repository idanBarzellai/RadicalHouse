import { useState } from "react";
import SpyView from "./SpyView"
import PlayerView from "./PlayerView"
import LogoHeader from "./LogoHeader"
import RoomCodeDisplay from "./RoomCodeDisplay";
import './styles/Game.css'

export default function Game({ player, event, players, turnStarterId, roomCode }) {
    const { isSpy, persona } = player;
    const [showDesc, setShowDesc] = useState(true);

    return (
        <div className="page-container">
            <LogoHeader />
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
                    {players.map(p => (
                        <li
                            key={p.id}
                            className={`player-name ${p.id === turnStarterId ? "current-turn" : ""}`}
                        >
                            {p.name} {p.id === turnStarterId && "← מתחיל"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}