import { useState } from "react";
import { events } from "../../data/data";
import '../game/EventCarousel.css'

export default function EventCarousel() {
    const [index, setIndex] = useState(0);
    const prev = () => setIndex((index - 1 + events.length) % events.length);
    const next = () => setIndex((index + 1) % events.length);
    const current = events[index];

    return (
        <div className="carousel-wrapper">
            <h3 className="carousel-title">אירועים בבית רדיקל:</h3>

            <div className="carousel-card">
                <img
                    src={current.image}
                    alt={current.title}
                    className="carousel-image"
                />

                <div className="carousel-content">
                    <h4 className="carousel-event-title">{current.title}</h4>
                    <p className="carousel-description">{current.description}</p>
                    <button
                        className="carousel-link-button"
                        onClick={() => window.open(current.link, "_blank")}
                    >
                        לצפייה באתר
                    </button>
                </div>

                {/* חצים */}
                <button className="carousel-arrow left" onClick={prev}>‹</button>
                <button className="carousel-arrow right" onClick={next}>›</button>
            </div>
        </div>
    );
}
