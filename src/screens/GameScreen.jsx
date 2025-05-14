import { useState, useEffect, useRef } from "react";
import { update, ref as dbRef } from "firebase/database";
import { db } from "../services/firebase";
import SpyView from "../components/game/SpyView";
import PlayerView from "../components/game/PlayerView";
import LogoHeader from "../components/ui/LogoHeader";
import VotePhase from "../components/game/VotePhase";
import SpyGuess from "../components/game/SpyGuess";
import EndResults from "./EndResults";
import ExitButton from "../components/ui/ExitButton";
import "./GameScreen.css";
import { events } from "../data/data";

// Debug button component
const DebugButton = ({ onClick }) => (
    <button
        className="debug-button"
        onClick={onClick}
        style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000
        }}
        title="Skip the timer and go directly to voting phase"
    >
        Debug: Skip Timer (End Game)
    </button>
);

export default function GameScreen({ playerId, roomData, roomCode, onExit }) {
    const isSpy = playerId === roomData.spyId;
    const me = roomData.players.find((p) => p.id === playerId) || {};
    const persona = me.persona;

    const [showDesc, setShowDesc] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [hasGuessed, setHasGuessed] = useState(false);

    // keep track of previous timeLeft
    const prevTimeRef = useRef(null);

    // reset votes/guesses whenever a new game stage begins
    useEffect(() => {
        if (roomData.stage === "game") {
            setTimeLeft(null);
            setHasVoted(false);
            setHasGuessed(false);
            prevTimeRef.current = null;
        }
    }, [roomData.stage]);

    // local countdown
    useEffect(() => {
        if (!roomData?.endTimestamp) return;

        const updateTimer = () => {
            const now = Date.now();
            const rem = Math.floor((roomData.endTimestamp - now) / 1000);
            setTimeLeft(Math.max(0, rem));
        };

        updateTimer();
        const iv = setInterval(updateTimer, 1000);
        return () => clearInterval(iv);
    }, [roomData.endTimestamp]);

    // only fire once when countdown crosses from >0 to 0
    useEffect(() => {
        const prev = prevTimeRef.current;
        if (
            prev > 0 &&
            timeLeft === 0 &&
            roomData.stage === "game"
        ) {
            update(dbRef(db, `rooms/${roomCode}`), { stage: "vote" });
        }
        prevTimeRef.current = timeLeft;
    }, [timeLeft, roomData.stage, roomCode]);

    // automatically advance from vote → results
    useEffect(() => {
        if (roomData.stage !== "vote") return;
        const votes = roomData.votes || {};
        const spyGuess = roomData.spyGuess;
        const nonSpyCount = roomData.players.filter((p) => !p.isSpy).length;
        if (spyGuess && Object.keys(votes).length === nonSpyCount) {
            update(dbRef(db, `rooms/${roomCode}`), { stage: "results" });
        }
    }, [
        roomData.votes,
        roomData.spyGuess,
        roomData.stage,
        roomData.players,
        roomCode,
    ]);

    // Advance from pre-game to game when all ready (only master triggers)
    useEffect(() => {
        if (roomData.stage === "pre-game") {
            const readyObj = roomData.preGameReady || {};
            const allReady = roomData.players.length > 0 && roomData.players.every(p => readyObj[p.id]);
            const isMaster = playerId === 1;
            if (allReady && isMaster) {
                update(dbRef(db, `rooms/${roomCode}`), { stage: "game" });
            }
        }
    }, [roomData.stage, roomData.preGameReady, roomData.players, playerId, roomCode]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    const handleVote = (id) => {
        setHasVoted(true);
        update(dbRef(db, `rooms/${roomCode}/votes`), { [playerId]: id });
    };

    const handleGuess = (title) => {
        setHasGuessed(true);
        update(dbRef(db, `rooms/${roomCode}`), { spyGuess: title });
    };

    const handleDebugEndGame = () => {
        if (roomData.stage === "game") {
            update(dbRef(db, `rooms/${roomCode}`), { stage: "vote" });
        }
    };

    // If not enough players remain, show message and exit button
    if (roomData.players.length < 3 && roomData.stage !== "lobby") {
        return (
            <div className="not-enough-players">
                <h2>לא נשארו מספיק שחקנים בחדר</h2>
                <button className="button-rounded" onClick={onExit}>
                    חזרה לדף הבית
                </button>
            </div>
        );
    }

    // render per-stage
    if (roomData.stage === "vote") {
        return isSpy ? (
            <SpyGuess onGuess={handleGuess} hasGuessed={hasGuessed} />
        ) : (
            <VotePhase
                players={roomData.players}
                playerId={playerId}
                onVote={handleVote}
                hasVoted={hasVoted}
            />
        );
    }

    if (roomData.stage === "spyGuess") {
        return <SpyGuess onGuess={handleGuess} hasGuessed={hasGuessed} />;
    }

    if (roomData.stage === "results") {
        return (
            <div className="results-container">
                <EndResults
                    playerId={playerId}
                    roomData={roomData}
                    roomCode={roomCode}
                    onExit={onExit}
                />
            </div>
        );
    }

    // normal gameplay screen
    return (
        <>
            <LogoHeader />

            {typeof timeLeft === "number" && (
                <div className="game-timer">{formatTime(timeLeft)}</div>
            )}

            <div className="persona-block persona-vertical">
                {isSpy && (
                    <div className="spy-banner">את/ה המרגל/ית!</div>
                )}
                <div className="persona-header persona-header-vertical">
                    <img src={persona?.image} alt={persona?.name} className="persona-image" />
                    <div className="persona-info">
                        <h3 className="persona-name">{persona?.name}</h3>
                        <div className="persona-occupation">{persona?.occupation}</div>
                        <button className="toggle-desc" onClick={() => setShowDesc(v => !v)}>
                            {showDesc ? "הסתר תיאור" : "הצג תיאור"}
                        </button>
                    </div>
                </div>
                {showDesc && (
                    <div className="persona-description persona-description-vertical">{persona?.description}</div>
                )}
                <hr />
                {isSpy ? (
                    <div className="spy-event-list-block">
                        <div className="spy-event-list-title">האירועים האפשריים:</div>
                        <ul className="spy-event-list">
                            {events.map((e, i) => (
                                <li key={i} className="spy-event-item">{e.title}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="event-block">
                        <div className="event-title">האירוע שלכם:</div>
                        <div className="event-name">{roomData.event.title}</div>
                        <img src={roomData.event.image} alt={roomData.event.title} className="event-image" />
                    </div>
                )}
            </div>

            <div className="game-players">
                <h4 className="players-label">שחקנים בחדר:</h4>
                <ul className="players-list">
                    {roomData.players.map((p) => (
                        <li
                            key={p.id}
                            className={`player-name ${p.id === roomData.turnStarterId ? "current-turn" : ""}`}
                        >
                            {p.name} {p.id === roomData.turnStarterId && "← מתחיל"}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Debug button only shown during game stage */}
            {roomData.stage === "game" && <DebugButton onClick={handleDebugEndGame} />}
        </>
    );
}
