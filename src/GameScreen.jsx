import Game from "./Game";

export default function GameScreen({ player, event, players, turnStarterId }) {
    return (
        <div style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            color: "#222",
            fontFamily: "sans-serif"
        }}>

            {/* תוכן השחקן */}
            <div>
                <Game player={player} event={event} />
            </div>

            {/* רשימת שחקנים */}
            <div>
                <h4 style={{
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    שחקנים בחדר:
                </h4>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {players.map(p => (
                        <li
                            key={p.id}
                            style={{
                                marginBottom: "0.5rem",
                                fontSize: "1rem",
                                fontWeight: p.id === turnStarterId ? "bold" : "normal",
                                color: p.id === turnStarterId ? "darkgreen" : "#222"
                            }}
                        >
                            {p.name} {p.id === turnStarterId && "← מתחיל"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}