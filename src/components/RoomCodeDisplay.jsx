import { useState } from "react";
import "./styles/RoomCodeDisplay.css";

export default function RoomCodeDisplay({ roomCode }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="room-code-display">
            <span>קוד חדר: {roomCode}</span>
            {copied ? (
                <span className="copied-label">הועתק</span>
            ) : (
                <button
                    className="copy-room-code"
                    onClick={handleCopy}
                    title="העתק קוד"
                >
                    📋
                </button>
            )}
        </div>
    );
}
