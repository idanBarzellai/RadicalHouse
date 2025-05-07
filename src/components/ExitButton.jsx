import { leaveRoom } from "../roomService";
import "./styles/ExitButton.css";

export default function ExitButton({ roomCode, playerId, onExit }) {
    return (
        <div >
            <button
                className="exit-button"
                onClick={async () => {
                    await leaveRoom(roomCode, playerId);
                    onExit();
                }}
            >X</button>
        </div>

    );
}


