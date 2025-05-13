// VotePhase.jsx
export default function VotePhase({ players, playerId, onVote, hasVoted }) {
    const others = players.filter(p => p.id !== playerId);

    return (
        <div className="vote-phase">
            <h2>האם הצלחתם להבין מיהו המרגל?</h2>
            <p>עכשיו הזמן להצביע. מי לדעתכם הוא המרגל?</p>
            <ul className="players-list">
                {others.map(p => (
                    <li key={p.id}>
                        <button
                            className="button-rounded"
                            disabled={hasVoted}
                            onClick={() => onVote(p.id)}
                        >
                            {p.name}
                        </button>
                    </li>
                ))}
            </ul>
            {hasVoted && <p>✔ הצבעתך התקבלה! ממתינים לשאר המשתתפים...</p>}
        </div>
    );
}
