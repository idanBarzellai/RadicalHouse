import { events } from "./data";

export default function SpyView() {
    return (
        <>
            <h2 style={{ color: "#b80000", marginBottom: "1rem" }}>🕵️‍♂️ את/ה המרגל/ית!</h2>
            <p>רשימת כל האירועים האפשריים:</p>
            <ul style={{ paddingRight: 0 }}>
                {events.map((e, i) => (
                    <li key={i} style={{ textAlign: "right" }}>{e.title}</li>
                ))}
            </ul>
        </>
    );
}