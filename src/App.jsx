import { useState, useEffect } from "react";
import { update, ref as dbRef, onValue } from "firebase/database";
import { db } from "./firebase";
import LobbyScreen from "./components/LobbyScreen";
import Game from "./components/Game";
import SplashScreen from "./components/SplashScreen";
import './index.css';

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  const startGameForAll = async () => {
    const refPath = dbRef(db, `rooms/${roomCode}`);
    const starterId = Math.floor(Math.random() * roomData.players.length) + 1;
    await update(refPath, { stage: "game", turnStarterId: starterId });
  };

  // מאזין לשינויים בחדר
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = dbRef(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      setRoomData(snapshot.val());
    });
    return () => unsubscribe();
  }, [roomCode]);


  if (!roomCode || !roomData) {
    return (
      <SplashScreen onJoin={({ roomCode, playerId }) => {
        setRoomCode(roomCode);
        setPlayerId(playerId);
      }} />
    );
  }

  const player = roomData.players.find(p => p.id === playerId);

  return (
    <div >
      {roomData.stage === "lobby" ? (
        <LobbyScreen
          roomCode={roomCode}
          players={roomData.players}
          playerId={playerId}
          onStartGame={startGameForAll}
        />
      ) : (
        <Game
          player={player}
          event={roomData.event}
          players={roomData.players}
          turnStarterId={roomData.turnStarterId}
        />
      )}
    </div>
  );
}
