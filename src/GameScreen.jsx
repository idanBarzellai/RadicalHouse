import Game from "./Game";

export default function GameScreen({ player, event, players, turnStarterId }) {
    return (
        <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <div>
                <Game player={player} event={event} />
            </div>

            <div style={{ marginTop: "1rem" }}>
                <h4>שחקנים בחדר:</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {players.map(p => (
                        <li
                            key={p.id}
                            style={{
                                fontWeight: p.id === turnStarterId ? "bold" : "normal",
                                color: p.id === turnStarterId ? "darkgreen" : "black"
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
