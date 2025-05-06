import { useState, useEffect } from "react";
import { update, ref as dbRef, onValue } from "firebase/database";
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
      setRoomData(snapshot.val());
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
    <div >
      {roomData.stage === "lobby" ? (
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
      )}
    </div>
  );
}
