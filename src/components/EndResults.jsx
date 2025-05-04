import React from "react";

export default function EndResults({ player, roomData }) {
    const { isSpy } = player;
    const { spyGuess, votes, players, event } = roomData;

    const totalVotes = Object.values(votes || {}).reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const votedOutId = Object.keys(totalVotes).reduce((a, b) =>
        totalVotes[a] > totalVotes[b] ? a : b
    );

    const isSpyCaught = parseInt(votedOutId, 10) === roomData.spyId;
    const isGuessCorrect = spyGuess === event.title;

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

            <h3>מי הצביע על מי:</h3>
            <ul>
                {Object.entries(votes || {}).map(([voterId, suspectId]) => {
                    const voter = players.find(p => p.id === parseInt(voterId));
                    const suspect = players.find(p => p.id === parseInt(suspectId));
                    return (
                        <li key={voterId}>
                            {voter?.name} → {suspect?.name || "(לא ידוע)"}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}