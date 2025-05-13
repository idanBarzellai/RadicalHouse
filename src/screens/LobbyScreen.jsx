import EventCarousel from "../components/game/EventCarousel";
import ExitButton from "../components/ui/ExitButton";
import LogoHeader from "../components/ui/LogoHeader";
import HelpButton from "../components/ui/HelpButton"
import RoomCodeDisplay from "../components/ui/RoomCodeDisplay";
import "./LobbyScreen.css"
export default function LobbyScreen({ roomCode, players = [], playerId, onStartGame, onExit }) {
    const isMaster = playerId === 1;
    const count = players.length;
    const canStart = count >= 3 && count <= 6;
    const roomFull = count >= 6;
    return (
        <>
            <RoomCodeDisplay roomCode={roomCode} />

            <h3 className="players-label">שחקנים בחדר</h3>
            <ul className="players-list">
                {players.map(p => (
                    <li key={p.id} className="player-name">{p.name}</li>
                ))}
            </ul>
            <span className="room-code-display">ממתין לכניסת שחקנים...</span>
            {isMaster && (
                <button
                    onClick={onStartGame}
                    disabled={!canStart}
                    className="button-rounded"
                    style={{
                        opacity: canStart ? 1 : 0.5,
                        cursor: canStart ? "pointer" : "not-allowed"
                    }}
                >
                    התחל משחק
                </button>
            )}
            {!roomFull
                ? <EventCarousel />
                : <p style={{ color: "#b00", marginTop: "1rem" }}>החדר מלא (מקסימום 6 שחקנים)</p>
            }
        </>
    );
}