import EventCarousel from "./EventCarousel";
import LogoHeader from "./LogoHeader";
import "./styles/LobbyScreen.css"
export default function LobbyScreen({ roomCode, players, playerId, onStartGame }) {
    return (
        <div className="page-container">
            <LogoHeader />
            <h2 className="lobby-title">קוד חדר: {roomCode}</h2>

            <h3 className="players-label">שחקנים בחדר</h3>
            <ul className="players-list">
                {players.map(p => (
                    <li key={p.id} className="player-name">{p.name}</li>
                ))}
            </ul>

            {playerId === 1 && (
                <button onClick={onStartGame} className="button-rounded">
                    התחל משחק
                </button>
            )}
            <EventCarousel />
        </div>
    );
}
