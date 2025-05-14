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
    const [showDesc, setShowDesc] = useState(false);
    const [showEvent, setShowEvent] = useState(false);
    const [markedEvents, setMarkedEvents] = useState([]);

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
            <div className="persona-block persona-vertical">
                {isSpy && (
                    <div className="spy-banner">את/ה המרגל/ית!</div>
                )}
                <div className="persona-header persona-header-vertical">
                    <img src={personaToShow.image} alt={personaToShow.name} className="persona-image" />
                    <div className="persona-info">
                        <h3 className="persona-name">{personaToShow.name}</h3>
                        <div className="persona-occupation">{personaToShow.occupation}</div>
                        <button className="toggle-desc" onClick={() => setShowDesc(v => !v)}>
                            {showDesc ? "הסתר תיאור" : "הצג תיאור"}
                        </button>
                    </div>
                </div>
                {showDesc && (
                    <div className="persona-description persona-description-vertical">{personaToShow.description}</div>
                )}
                <hr />
                {isSpy ? (
                    <div className="spy-event-list-block">
                        <div className="spy-event-list-title">האירועים האפשריים:</div>
                        <ul className="spy-event-list spy-event-list-center">
                            {events.map((e, i) => (
                                <li
                                    key={i}
                                    className={`spy-event-item${markedEvents.includes(i) ? " spy-event-marked" : ""}`}
                                    onClick={() => setMarkedEvents(markedEvents.includes(i)
                                        ? markedEvents.filter(idx => idx !== i)
                                        : [...markedEvents, i])}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {e.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="event-block-vertical">
                        <div className="event-title">האירוע: {event.title}</div>
                        <button className="toggle-desc event-toggle" onClick={() => setShowEvent(v => !v)}>
                            {showEvent ? "הסתר פרטי אירוע" : "הצג פרטי אירוע"}
                        </button>
                        {showEvent && (
                            <>
                                <img src={event.image} alt={event.title} className="event-image-vertical" />
                                <div className="event-description-vertical">{event.description}</div>
                            </>
                        )}
                    </div>
                )}
            </div>
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