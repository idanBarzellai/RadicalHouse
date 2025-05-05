import React from "react";

export default function EndResults({ player, roomData }) {
    const { spyGuess, votes = {}, players, event, spyId } = roomData;
    const isSpy = player.id === spyId;

    // סופרים קולות לכל שחקן
    const voteCounts = players.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
    }, {});
    Object.values(votes).forEach(votedId => {
        if (voteCounts[votedId] !== undefined) {
            voteCounts[votedId] += 1;
        }
    });

    // כמה שחקנים (הצבעות אפשריות) לא המרגל
    const nonSpyCount = players.filter(p => p.id !== spyId).length;
    const spyVotes = voteCounts[spyId] || 0;

    // רוב: יותר מחצי מההצבעות של ה-non-spy
    const isSpyCaught = spyVotes > (nonSpyCount / 2);
    const isGuessCorrect = spyGuess === event.title;

    // בניית הודעת תוצאה
    let resultMessage = "";
    if (isSpy) {
        if (isGuessCorrect && !isSpyCaught) {
            resultMessage = "🎉 הצלחת לנחש את האירוע ואף אחד לא עלה עליך! ניצחת!";
        } else if (isGuessCorrect && isSpyCaught) {
            resultMessage = "🔍 ניחשת נכון את האירוע, אבל עלו עליך. הפסדת.";
        } else {
            resultMessage = "❌ לא הצלחת לנחש את האירוע. הפסדת.";
        }
    } else {
        if (isSpyCaught) {
            resultMessage = "🎉 הצלחתם לעלות על המרגל!";
        } else {
            resultMessage = "😅 המרגל חמק בלי שתשימו לב...";
        }
    }

    return (
        <div className="page-container">
            <h2>תוצאות המשחק</h2>
            <p>{resultMessage}</p>

            <h3>האירוע האמיתי היה:</h3>
            <p>{event.title}</p>

            <h3>הניחוש של המרגל:</h3>
            <p>{spyGuess || "המרגל לא ניחש"}</p>

            <h3>מספר קולות נגד כל שחקן:</h3>
            <ul>
                {players.map(p => (
                    <li key={p.id}>
                        {p.name} – הצביעו {voteCounts[p.id] || 0} אנשים
                    </li>
                ))}
            </ul>
        </div>
    );
}
