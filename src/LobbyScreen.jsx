import EventCarousel from "./EventCarousel";

export default function LobbyScreen({ roomCode, players, playerId, onStartGame }) {
    return (
        <div>
            <h2>חדר: {roomCode}</h2>
            <h3>שחקנים:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {players.map(p => (
                    <li key={p.id}>{p.name}</li>
                ))}
            </ul>
            {playerId === 1 && (
                <button onClick={onStartGame} style={{ marginTop: "1rem" }}>
                    התחל משחק
                </button>
            )}
            <EventCarousel />
        </div>
    );
}