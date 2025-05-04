import "./styles/PlayerView.css"
export default function PlayerView({ persona, event, showDesc, toggleDesc }) {
    return (
        <>
            <div className="persona-block">
                <img
                    src={persona.image}
                    alt={persona.name}
                    className="persona-image"
                />
                <div className="persona-text">
                    <h2>{persona.name}</h2>
                    <button className="toggle-desc" onClick={toggleDesc}>
                        {showDesc ? "הסתר תיאור" : "הצג תיאור"}
                    </button>
                    {showDesc && <p className="persona-description">{persona.description}</p>}
                </div>
            </div>

            <hr />

            {event && (
                <div className="event-block">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="event-image"
                    />
                    <div className="event-text">
                        <h4 className="event-title">האירוע - {event.title}</h4>
                        <p className="event-description">{event.description}</p>
                    </div>
                </div>
            )}
        </>
    );
}
