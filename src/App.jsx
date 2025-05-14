import { useState, useEffect } from "react";
import { update, ref as dbRef, onValue, onDisconnect } from "firebase/database";
import { db } from "./services/firebase";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";
import SplashScreen from "./screens/SplashScreen";
import HelpButton from "./components/ui/HelpButton";
import ExitButton from "./components/ui/ExitButton";
import LogoHeader from "./components/ui/LogoHeader";
import './index.css';
import { leaveRoom } from "./services/roomService";
import PreGameScreen from "./screens/PreGameScreen";

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

    // Robust spy index assignment
    let spyIndex = roomData.spyIndex;
    if (typeof spyIndex !== 'number' || spyIndex < 0 || spyIndex >= players.length) {
      spyIndex = Math.floor(Math.random() * players.length);
      await update(refPath, { spyIndex });
    }
    const spyId = players[spyIndex]?.id;

    // Update players array to mark the correct spy
    const updatedPlayers = players.map((p, i) => ({
      ...p,
      isSpy: i === spyIndex,
      persona: i === spyIndex ? null : p.persona // spy gets no persona
    }));

    // גם מי יתחיל את הסבב (שומר בקוד שלך)
    const starterId = Math.floor(Math.random() * players.length) + 1;

    // חישוב זמן התחלה וסיום
    const durationSeconds = players.length * 60; // 1 minute per player
    const startTimestamp = Date.now();
    const endTimestamp = startTimestamp + durationSeconds * 1000;

    await update(refPath, {
      stage: "pre-game",
      turnStarterId: starterId,
      spyId,
      players: updatedPlayers,
      preGameReady: {},
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

    // Only check for spy presence if we have valid data
    if (activeStages.includes(stage) && spyId && players.length > 0 && !spyStillHere) {
      // Add a small delay to prevent false positives during initial load
      const timeoutId = setTimeout(() => {
        const roomRef = dbRef(db, `rooms/${roomCode}`);
        update(roomRef, { stage: "results" });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [roomData, roomCode]);

  // Advance from pre-game to game when all ready (only master triggers)
  useEffect(() => {
    if (!roomData) return;
    if (roomData.stage === "pre-game") {
      const readyObj = roomData.preGameReady || {};
      const allReady = roomData.players.length > 0 && roomData.players.every(p => readyObj[p.id]);
      const isMaster = playerId === 1;
      if (allReady && isMaster) {
        const roomRef = dbRef(db, `rooms/${roomCode}`);
        update(roomRef, { stage: "game" });
      }
    }
  }, [roomData, playerId, roomCode]);

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
        ) : roomData.stage === "pre-game" ? (
          <PreGameScreen
            playerId={playerId}
            roomData={roomData}
            roomCode={roomCode}
          />
        ) : (
          <GameScreen
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
