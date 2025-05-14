// VotePhase.jsx
export default function VotePhase({ players, playerId, onVote, hasVoted }) {
    const others = players.filter(p => p.id !== playerId);

    return (
        <div className="vote-phase">
            <h2>האם הצלחתם להבין מיהו המרגל?</h2>
            <p>עכשיו הזמן להצביע. מי לדעתכם הוא המרגל?</p>
            <ul className="players-list players-list-thumbs">
                {others.map(p => (
                    <li key={p.id} className="player-thumb">
                        <button
                            className="button-rounded"
                            disabled={hasVoted}
                            onClick={() => onVote(p.id)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <img src={p.persona?.image} alt={p.persona?.name} className="player-thumb-img" />
                            <span className="player-real-name">{p.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {hasVoted && <p>✔ הצבעתך התקבלה! ממתינים לשאר המשתתפים...</p>}
        </div>
    );
}
