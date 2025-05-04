import { events } from "../data";

export default function SpyGuess({ onGuess, hasGuessed }) {
    return (
        <div className="spy-guess-phase">
            <h2>האם הצלחת לגלות את האירוע?</h2>
            <p>בחר/י את האירוע שאת/ה חושב/ת שמתקיים:</p>
            <ul className="events-list">
                {events.map((e, i) => (
                    <li key={i}>
                        <button
                            className="button-rounded"
                            disabled={hasGuessed}
                            onClick={() => onGuess(e.title)}
                        >
                            {e.title}
                        </button>
                    </li>
                ))}
            </ul>
            {hasGuessed && <p>✔ הבחירה נשמרה! ממתינים לשאר השחקנים...</p>}
        </div>
    );
}
