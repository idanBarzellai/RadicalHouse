import { useState } from "react";
import { update, ref as dbRef } from "firebase/database";
import { db } from "../services/firebase";
import "./PreGameScreen.css";
import { events } from "../data/data";

export default function PreGameScreen({ playerId, roomData, roomCode }) {
    const player = roomData.players.find(p => p.id === playerId);
    const isSpy = player.isSpy;
    const persona = player.persona;
    const event = roomData.event;
    const ready = roomData.preGameReady?.[playerId];
    const [loading, setLoading] = useState(false);

    const handleReady = async () => {
        setLoading(true);
        const r = dbRef(db, `rooms/${roomCode}/preGameReady`);
        await update(r, { [playerId]: true });
        setLoading(false);
    };

    // Count ready players
    const readyCount = Object.values(roomData.preGameReady || {}).filter(Boolean).length;
    const totalPlayers = roomData.players.length;

    // Fallback for missing persona
    const personaToShow = persona || (roomData.personas ? roomData.personas[0] : null);

    if (!player) {
        return <div>שגיאה: לא נמצא שחקן</div>;
    }

    return (
        <>
            {isSpy ? (
                <div className="spy-block">
                    {personaToShow ? (
                        <>
                            <div className="persona-header">
                                <div className="persona-info">
                                    <h3 className="persona-name">{personaToShow.name}</h3>
                                    <div className="persona-occupation">{personaToShow.occupation}</div>
                                </div>
                                <img src={personaToShow.image} alt={personaToShow.name} className="persona-image" />
                            </div>
                            <div className="persona-description">{personaToShow.description}</div>
                        </>
                    ) : (
                        <div>לא נמצאה דמות</div>
                    )}
                    <hr />
                    <div className="spy-event-list-block">
                        <div className="spy-event-list-title">האירועים האפשריים:</div>
                        <ul className="spy-event-list">
                            {events.map((e, i) => (
                                <li key={i} className="spy-event-item">{e.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="persona-block persona-vertical">
                    <div className="persona-header persona-header-vertical">
                        <img src={personaToShow.image} alt={personaToShow.name} className="persona-image" />
                        <div className="persona-info">
                            <h3 className="persona-name">{personaToShow.name}</h3>
                            <div className="persona-occupation">{personaToShow.occupation}</div>
                        </div>
                    </div>
                    <div className="persona-description persona-description-vertical">{personaToShow.description}</div>
                    <hr />
                    <div className="event-block">
                        <div className="event-title">האירוע שלכם:</div>
                        <div className="event-name">{event.title}</div>
                        <img src={event.image} alt={event.title} className="event-image" />
                    </div>
                </div>
            )}
            <button
                className="button-rounded ready-btn"
                onClick={handleReady}
                disabled={ready || loading}
            >
                {ready ? "ממתינים לשאר השחקנים..." : "מוכן להתחיל!"}
            </button>
            <div className="ready-count">
                {readyCount} / {totalPlayers} מוכנים
            </div>
        </>
    );
} 