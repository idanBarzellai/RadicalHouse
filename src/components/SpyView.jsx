import { events } from "../data";
import "./styles/PlayerView.css"

export default function SpyView() {
    return (
        <div className="spy-view">
            <h2 className="spy-title">🕵️‍♂️ את/ה המרגל/ית!</h2>
            <p className="spy-instruction">רשימת כל האירועים האפשריים:</p>
            <ul className="spy-event-list">
                {events.map((e, i) => (
                    <li key={i} className="spy-event-item">{e.title}</li>
                ))}
            </ul>
        </div>
    );
}
