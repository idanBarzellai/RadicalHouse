// VotePhase.jsx
import { useState } from "react";

export default function VotePhase({ players, playerId, onVote, hasVoted, voteTimeLeft }) {
    const others = players.filter(p => p.id !== playerId);
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        if (selected != null) {
            setConfirmed(true);
            onVote(selected);
        }
    };

    return (
        <div className="vote-phase">
            <div className="vote-timer">{voteTimeLeft > 0 ? `00:${voteTimeLeft.toString().padStart(2, '0')}` : "⏰ הזמן נגמר"}</div>
            <h2>האם הצלחתם להבין מיהו המרגל?</h2>
            <p>עכשיו הזמן להצביע. מי לדעתכם הוא המרגל?</p>
            <ul className="players-list players-list-thumbs">
                {others.map(p => (
                    <li key={p.id} className={`player-thumb${selected === p.id ? " player-thumb-selected" : ""}`}>
                        <button
                            className="button-rounded"
                            disabled={hasVoted || confirmed || voteTimeLeft === 0}
                            onClick={() => setSelected(p.id)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: selected === p.id ? '2px solid #b80000' : undefined }}
                        >
                            <img src={p.persona?.image} alt={p.persona?.name} className="player-thumb-img" />
                            <span className="player-real-name">{p.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {selected && !confirmed && voteTimeLeft > 0 && (
                <button className="button-rounded" onClick={handleConfirm} style={{ marginTop: '1rem', background: '#b80000', color: 'white' }}>
                    מאשר/ת את הבחירה
                </button>
            )}
            {hasVoted && <p>✔ הצבעתך התקבלה! ממתינים לשאר המשתתפים...</p>}
            {voteTimeLeft === 0 && !hasVoted && <p style={{ color: '#b80000', fontWeight: 'bold' }}>ההצבעה נסגרה</p>}
        </div>
    );
}
