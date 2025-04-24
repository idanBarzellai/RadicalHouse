import { useState } from "react";
import { events } from "./data";

export default function EventCarousel() {
    const [index, setIndex] = useState(0);

    const prev = () => {
        setIndex((index - 1 + events.length) % events.length);
    };

    const next = () => {
        setIndex((index + 1) % events.length);
    };

    const current = events[index];

    return (
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <h3>אירועים בבית רדיקל:</h3>
            <div style={{
                position: "relative",
                width: "300px",
                margin: "auto",
                overflow: "hidden",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}>
                <img
                    src={current.image}
                    alt={current.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                />
                <div style={{ padding: "1rem" }}>
                    <h4>{current.title}</h4>
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>{current.description}</p>
                    <button onClick={() => window.open(current.link, "_blank")}>לצפייה באתר</button>
                </div>

                {/* חצים */}
                <button onClick={prev} style={{
                    position: "absolute", top: "45%", left: "0", background: "transparent",
                    border: "none", fontSize: "2rem", cursor: "pointer", color: "#888"
                }}>‹</button>

                <button onClick={next} style={{
                    position: "absolute", top: "45%", right: "0", background: "transparent",
                    border: "none", fontSize: "2rem", cursor: "pointer", color: "#888"
                }}>›</button>
            </div>
        </div>
    );
}