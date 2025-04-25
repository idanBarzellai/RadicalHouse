export default function PlayerView({ persona, event, showDesc, toggleDesc }) {
    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <img src={persona.image} alt={persona.name} width="80"
                    style={{ borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                <div style={{ textAlign: "right", flex: 1 }}>
                    <h2>{persona.name}</h2>
                    <button onClick={toggleDesc} style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                        {showDesc ? "הסתר תיאור" : "הצג תיאור"}
                    </button>
                    {showDesc && (
                        <p style={{ fontSize: "0.9rem", color: "#555" }}>{persona.description}</p>
                    )}
                </div>
            </div>

            <hr />

            {event && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <img src={event.image} alt={event.title} width="80"
                        style={{ borderRadius: "8px", flexShrink: 0 }} />
                    <div>
                        <h4 style={{ margin: 0 }}>{event.title}</h4>
                        <p style={{ fontSize: "0.85rem", color: "#555" }}>{event.description}</p>
                    </div>
                </div>
            )}
        </>
    );
}