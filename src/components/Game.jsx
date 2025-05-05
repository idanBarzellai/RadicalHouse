import { useState, useEffect } from "react";
import { update, ref as dbRef } from "firebase/database";
import { db } from "../firebase";
import SpyView from "./SpyView";
import PlayerView from "./PlayerView";
import LogoHeader from "./LogoHeader";
import RoomCodeDisplay from "./RoomCodeDisplay";
import VotePhase from "./VotePhase";
import SpyGuess from "./SpyGuess";
import EndResults from "./EndResults";
import "./styles/Game.css";

export default function Game({ player, roomData, roomCode }) {
    const isSpy = player.id === roomData.spyId;
    const persona = player.persona;
    const [showDesc, setShowDesc] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [hasGuessed, setHasGuessed] = useState(false);

    // טיימר מקומי
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
    }, [roomData?.endTimestamp]);

    // ב־0 זמן נעדכן ל־vote
    useEffect(() => {
        if (timeLeft === 0 && roomData.stage === "game") {
            const r = dbRef(db, `rooms/${roomCode}`);
            update(r, { stage: "vote" });
        }
    }, [timeLeft, roomData.stage, roomCode]);

    // אחרי הצבעות וניחוש, מעבר ל־results
    useEffect(() => {
        if (roomData.stage !== "vote") return;
        const votes = roomData.votes || {};
        const spyGuess = roomData.spyGuess;
        const nonSpyCount = roomData.players.filter(p => !p.isSpy).length;
        if (spyGuess && Object.keys(votes).length === nonSpyCount) {
            const r = dbRef(db, `rooms/${roomCode}`);
            update(r, { stage: "results" });
        }
    }, [roomData.votes, roomData.spyGuess, roomData.stage, roomCode, roomData.players]);

    const formatTime = s => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    const handleVote = id => {
        setHasVoted(true);
        const r = dbRef(db, `rooms/${roomCode}/votes`);
        update(r, { [player.id]: id });
    };

    const handleGuess = title => {
        setHasGuessed(true);
        const r = dbRef(db, `rooms/${roomCode}`);
        update(r, { spyGuess: title });
    };

    // שלבי פונקציונליות
    if (roomData.stage === "vote") {
        return (
            isSpy
                ? <SpyGuess onGuess={handleGuess} hasGuessed={hasGuessed} />
                : <VotePhase
                    players={roomData.players}
                    playerId={player.id}
                    onVote={handleVote}
                    hasVoted={hasVoted}
                />
        );
    }
    if (roomData.stage === "spyGuess") {
        return <SpyGuess onGuess={handleGuess} hasGuessed={hasGuessed} />;
    }
    if (roomData.stage === "results") {
        return <EndResults player={player} roomData={roomData} />;
    }

    // שלב המשחק
    return (
        <div className="page-container">
            <LogoHeader />
            {typeof timeLeft === "number" && <div className="game-timer">{formatTime(timeLeft)}</div>}
            <RoomCodeDisplay roomCode={roomCode} />
            {isSpy
                ? <SpyView />
                : persona && <PlayerView
                    persona={persona}
                    event={roomData.event}
                    showDesc={showDesc}
                    toggleDesc={() => setShowDesc(v => !v)}
                />
            }
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
