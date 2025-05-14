import { useState } from "react";
import { events } from "../../data/data";

export default function SpyGuess({ onGuess, hasGuessed }) {
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        if (selected != null) {
            setConfirmed(true);
            onGuess(selected);
        }
    };

    return (
        <div className="spy-guess-phase">
            <h2>האם הצלחת לגלות את האירוע?</h2>
            <p>בחר/י את האירוע שאת/ה חושב/ת שמתקיים:</p>
            <ul className="events-list">
                {events.map((e, i) => (
                    <li key={i}>
                        <button
                            className="button-rounded"
                            disabled={hasGuessed || confirmed}
                            style={{ border: selected === e.title ? '2px solid #b80000' : undefined }}
                            onClick={() => setSelected(e.title)}
                        >
                            {e.title}
                        </button>
                    </li>
                ))}
            </ul>
            {selected && !confirmed && !hasGuessed && (
                <button className="button-rounded" onClick={handleConfirm} style={{ marginTop: '1rem', background: '#b80000', color: 'white' }}>
                    מאשר/ת את הבחירה
                </button>
            )}
            {hasGuessed && <p>✔ הבחירה נשמרה! ממתינים לשאר השחקנים...</p>}
        </div>
    );
}
