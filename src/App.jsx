import { useState, useEffect } from "react";
import { update, ref as dbRef, onValue, onDisconnect } from "firebase/database";
import { db } from "./firebase";
import LobbyScreen from "./gameStates/LobbyScreen";
import Game from "./gameStates/Game";
import SplashScreen from "./gameStates/SplashScreen";
import './index.css';

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  const startGameForAll = async () => {
    const refPath = dbRef(db, `rooms/${roomCode}`);
    const players = roomData.players;

    // בחר מרגל אקראי
    const spyPlayer = players[Math.floor(Math.random() * players.length)];
    const spyId = spyPlayer.id

    // גם מי יתחיל את הסבב (שומר בקוד שלך)
    const starterId = Math.floor(Math.random() * players.length) + 1;

    // חישוב זמן התחלה וסיום
    const durationSeconds = players.length * 2; // Change to  * 60
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

  if (!roomCode || !roomData) {
    return (
      <SplashScreen onJoin={({ roomCode, playerId }) => {
        setRoomCode(roomCode);
        setPlayerId(playerId);
      }} />
    );
  }

  // const player = roomData.players.find(p => p.id === playerId);

  return (
    roomData.stage === "lobby" ? (
      <LobbyScreen
        roomCode={roomCode}
        players={roomData.players}
        playerId={playerId}
        onStartGame={startGameForAll}
        onExit={() => {
          setRoomCode(null);
          setRoomData(null);
        }}
      />
    ) : (
      <Game
        playerId={playerId}
        roomData={roomData}
        roomCode={roomCode}
        onExit={() => {
          setRoomCode(null);
          setRoomData(null);
        }}
      />
    )
  );
}
