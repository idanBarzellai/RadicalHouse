import { useState, useEffect } from "react";
import { update, ref as dbRef, onValue, onDisconnect } from "firebase/database";
import { db } from "./firebase";
import LobbyScreen from "./gameStates/LobbyScreen";
import Game from "./gameStates/Game";
import SplashScreen from "./gameStates/SplashScreen";
import HelpButton from "./components/HelpButton";
import ExitButton from "./components/ExitButton";
import LogoHeader from "./components/LogoHeader";
import './index.css';

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  const handleExit = async () => {
    if (roomCode && playerId) {
      try {
        await leaveRoom(roomCode, playerId);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    setRoomCode(null);
    setRoomData(null);
    setPlayerId(null);
  };

  const startGameForAll = async () => {
    const refPath = dbRef(db, `rooms/${roomCode}`);
    const players = roomData.players;

    // Check minimum player count
    if (players.length < 3) {
      throw new Error("NOT_ENOUGH_PLAYERS");
    }

    // Use the existing spyIndex from room creation
    const spyId = roomData.spyIndex + 1;

    // גם מי יתחיל את הסבב (שומר בקוד שלך)
    const starterId = Math.floor(Math.random() * players.length) + 1;

    // חישוב זמן התחלה וסיום
    const durationSeconds = players.length * 60; // 1 minute per player
    const startTimestamp = Date.now();
    const endTimestamp = startTimestamp + durationSeconds * 1000;

    await update(refPath, {
      stage: "game",
      turnStarterId: starterId,
      spyId,
      startTimestamp,
      endTimestamp,
    });
  };

  // מאזין לשינויים בחדר
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = dbRef(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() || {};
      // normalize players → array, drop null/undefined
      const raw = data.players || [];
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      const players = arr.filter(p => p != null);
      setRoomData({ ...data, players });
    });
    return () => unsubscribe();
  }, [roomCode]);

  useEffect(() => {
    if (!roomData) return;
    // masterId===1; if no player with id=1, master left
    if (!roomData.players?.some(p => p.id === 1)) {
      setRoomCode(null);
      setRoomData(null);
    }
  }, [roomData]);

  // presence / onDisconnect registration:
  useEffect(() => {
    if (!roomCode || !roomData || playerId == null) return;
    // find my index in the array
    const idx = roomData.players.findIndex(p => p.id === playerId);
    if (idx < 0) return;
    const playerRef = dbRef(db, `rooms/${roomCode}/players/${idx}`);
    onDisconnect(playerRef).remove();
  }, [roomCode, playerId, roomData]);

  // if the spy is missing during an active round, push to "results"
  useEffect(() => {
    if (!roomData) return;
    const { stage, spyId, players } = roomData;
    const activeStages = ["game", "vote", "spyGuess"];
    const spyStillHere = players.some(p => p.id === spyId);
    if (activeStages.includes(stage) && !spyStillHere) {
      const roomRef = dbRef(db, `rooms/${roomCode}`);
      update(roomRef, { stage: "results" });
    }
  }, [roomData, roomCode]);

  return (
    <div className="page-container">
      <LogoHeader />
      <HelpButton />
      {(!roomCode || !roomData) ? (
        <SplashScreen onJoin={({ roomCode, playerId }) => {
          setRoomCode(roomCode);
          setPlayerId(playerId);
        }} />
      ) : <>
        <ExitButton onExit={handleExit} />
        {roomData.stage === "lobby" ? (
          <LobbyScreen
            roomCode={roomCode}
            players={roomData.players}
            playerId={playerId}
            onStartGame={startGameForAll}
            onExit={handleExit}
          />
        ) : (
          <Game
            playerId={playerId}
            roomData={roomData}
            roomCode={roomCode}
            onExit={handleExit}
          />
        )}
      </>}
    </div>
  );
}
