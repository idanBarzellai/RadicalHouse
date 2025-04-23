import { useState } from "react";
import { personas, events } from "./data";
import Game from "./Game";

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [room, setRoom] = useState(null);

  const startGame = () => {
    const playerCount = 4; // לדוגמה
    const spyIndex = Math.floor(Math.random() * playerCount);
    const event = getRandomItem(events);

    const shuffledPersonas = [...personas].sort(() => 0.5 - Math.random());

    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `שחקן ${i + 1}`,
      isSpy: i === spyIndex,
      persona: i === spyIndex ? null : shuffledPersonas[i % personas.length],
    }));

    setRoom({
      players,
      event,
      stage: "game"
    });
  };

  return (
    <div style={{ padding: "2rem", direction: "rtl", fontFamily: "sans-serif", textAlign: "right" }}>
      {!room ? (
        <>
          <h1>RadicalHouse</h1>
          <button onClick={startGame}>צור משחק מדומה</button>
        </>
      ) : (
        <>
          <h2>המשחק נוצר 🎉</h2>
          {room.players.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <p><strong>{p.name}</strong></p>
              <Game player={p} event={room.event} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}