import { useState, useEffect, useRef } from "react";
import { update, ref as dbRef } from "firebase/database";
import { db } from "../firebase";
import SpyView from "../components/SpyView";
import PlayerView from "../components/PlayerView";
import LogoHeader from "../components/LogoHeader";
import VotePhase from "../components/VotePhase";
import SpyGuess from "../components/SpyGuess";
import EndResults from "./EndResults";
import "./styles/Game.css";
import ExitButton from "../components/ExitButton";

export default function Game({ playerId, roomData, roomCode, onExit }) {
    const isSpy = playerId === roomData.spyId;
    const me = roomData.players.find((p) => p.id === playerId) || {};
    const persona = me.persona;

    const [showDesc, setShowDesc] = useState(true);
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
            <EndResults
                playerId={playerId}
                roomData={roomData}
                roomCode={roomCode}
                onExit={onExit}
            />
        );
    }

    // normal gameplay screen
    return (
        <div className="page-container">
            <LogoHeader />

            {typeof timeLeft === "number" && (
                <div className="game-timer">{formatTime(timeLeft)}</div>
            )}

            {/* <RoomCodeDisplay roomCode={roomCode} /> */}
            {isSpy
                ? <SpyView />
                : <PlayerView
                    persona={persona}
                    event={roomData.event}
                    showDesc={showDesc}
                    toggleDesc={() => setShowDesc((v) => !v)}
                />
            }

            <div className="game-players">
                <h4 className="players-label">שחקנים בחדר:</h4>
                <ul className="players-list">
                    {roomData.players.map((p) => (
                        <li
                            key={p.id}
                            className={`player-name ${p.id === roomData.turnStarterId ? "current-turn" : ""
                                }`}
                        >
                            {p.name} {p.id === roomData.turnStarterId && "← מתחיל"}
                        </li>
                    ))}
                </ul>
            </div>

            {/* leave mid-game */}
            <ExitButton />
        </div>
    );
}
