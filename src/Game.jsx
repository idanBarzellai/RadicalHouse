import { events } from "./data";

export default function Game({ player, event }) {
    const { isSpy, persona } = player;

    if (isSpy) {
        return (
            <>
                <p style={{ color: "red" }}><strong>את/ה המרגל/ית!</strong> נסה/י לנחש את האירוע.</p>
                <ul>
                    {events.map((e, i) => (
                        <li key={i}>{e.title}</li>
                    ))}
                </ul>
            </>
        );
    }
    return (
        <>
            <img src={persona.image} alt={persona.name} width="120" />
            <h3>{persona.name}</h3>
            <p>{persona.description}</p>
            {!isSpy && event && (
                <>
                    <hr />
                    <h4>האירוע:</h4>
                    <img src={event.image} alt={event.title} width="250" style={{ borderRadius: "8px" }} />
                    <h5>{event.title}</h5>
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>{event.description}</p>
                </>
            )}
        </>
    );
}