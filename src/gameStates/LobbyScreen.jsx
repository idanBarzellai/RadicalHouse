import EventCarousel from "../components/EventCarousel";
import LogoHeader from "../components/LogoHeader";
import RoomCodeDisplay from "../components/RoomCodeDisplay";
import { leaveRoom } from "../roomService";
import "./styles/LobbyScreen.css"
export default function LobbyScreen({ roomCode, players = [], playerId, onStartGame, onExit }) {
    const isMaster = playerId === 1;
    const count = players.length;
    const canStart = count >= 3 && count <= 6;
    const roomFull = count >= 6;
    return (
        <div className="page-container">
            <LogoHeader />
            <RoomCodeDisplay roomCode={roomCode} />

            <h3 className="players-label">שחקנים בחדר</h3>
            <ul className="players-list">
                {players.map(p => (
                    <li key={p.id} className="player-name">{p.name}</li>
                ))}
            </ul>
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
            {/* leave room */}
            <button
                className="button-rounded"
                onClick={async () => {
                    await leaveRoom(roomCode, playerId);
                    onExit();
                }}
                style={{ marginTop: "1rem", backgroundColor: "#f66", color: "#fff" }}
            >
                עזיבת החדר
            </button>

            {!roomFull
                ? <EventCarousel />
                : <p style={{ color: "#b00", marginTop: "1rem" }}>החדר מלא (מקסימום 6 שחקנים)</p>
            }
        </div>
    );
}