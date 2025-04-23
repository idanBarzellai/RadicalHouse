import { events } from "./data";

export default function Game({ player, event }) {
    const { isSpy, persona } = player;

    return (
        <div>
            {!isSpy ? (
                <>
                    <img src={persona.image} alt={persona.name} width="120" />
                    <h4>{persona.name}</h4>
                    <p>{persona.description}</p>
                    <p><strong>האירוע:</strong> {event}</p>
                </>
            ) : (
                <>
                    <p style={{ color: "red" }}>
                        <strong>את/ה המרגל/ית!</strong><br />
                        נסה/י לגלות מה האירוע.
                    </p>
                    <hr />
                    <h4>רשימת כל האירועים האפשריים:</h4>
                    <ul>
                        {events.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}