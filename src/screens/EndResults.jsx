import { update, ref as dbRef } from "firebase/database";
import { db } from "../services/firebase";
import { events, personas } from "../data/data";
import RoomCodeDisplay from "../components/ui/RoomCodeDisplay";
import { leaveRoom } from "../services/roomService";
import "./GameScreen.css";

export default function EndResults({
    playerId,
    roomData,
    roomCode,
    onExit
}) {
    const { spyGuess, votes = {}, players, event, spyId, ready = {} } = roomData;

    const masterId = 1;
    const isMaster = playerId === masterId;
    const isSpy = playerId === spyId;

    // if the spy was removed, announce an automatic players-win
    const spyStillHere = players.some(p => p.id === spyId);
    if (!spyStillHere) {
        return (
            <>
                <h2>תוצאות המשחק</h2>
                <p>המרגל עזב באמצע המשחק !</p>

                {/* offer back-to-home or next round as normal */}
                <button
                    className="button-rounded"
                    onClick={async () => {
                        // clean up room (remove master so everyone resets) if you like…
                        onExit();
                    }}
                >
                    חזרה לדף הבית
                </button>
            </>
        );
    }
    // =======================
    // 1. חישוב תוצאות כרגיל
    // =======================
    // סופרים קולות לכל שחקן
    const voteCounts = players.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
    }, {});
    Object.values(votes).forEach(votedId => {
        if (voteCounts[votedId] !== undefined) voteCounts[votedId] += 1;
    });

    // majority check
    const nonSpyCount = players.filter(p => p.id !== spyId).length;
    const spyVotes = voteCounts[spyId] || 0;
    const isSpyCaught = spyVotes > nonSpyCount / 2;
    const isGuessCorrect = spyGuess === event.title;

    // הודעת תוצאה
    let resultMessage = "";
    if (isSpy) {
        resultMessage = isSpyCaught
            ? "🔍 עלו עליך! הפסדת." :
            isGuessCorrect
                ? "🎉 הצלחת לנחש את האירוע ואף אחד לא עלה עליך! ניצחת!"
                : "❌ לא הצלחת לנחש את האירוע. הפסדת."
    } else {
        resultMessage = isSpyCaught
            ? "🎉 הצלחתם לעלות על המרגל!" :
            isGuessCorrect
                ? "המרגל עלה על האירוע ולא תפסתם אותו! 🔍"
                : "😅 המרגל חמק בלי שתשימו לב...";
    }

    // =======================================
    // 2. ניהול toggle "מוכן לסיבוב נוסף"
    // =======================================
    // מיפוי מי לחץ "מוכן"
    const hasReady = !!ready[playerId];

    // players to wait: כל מי שלא מרגל ולא מאסטר
    const playersToWait = players.filter(
        (p) => p.id !== masterId
    );

    const readyCount = playersToWait.filter((p) => ready[p.id]).length;
    const remainingCount = playersToWait.length - readyCount;
    const allReady = remainingCount === 0;

    const handleReady = () => {
        const r = dbRef(db, `rooms/${roomCode}/ready`);
        // toggle בין true/false
        update(r, { [playerId]: !hasReady });
    };

    // =======================================
    // 3. התחלת סיבוב נוסף (מאסטר בלבד)
    // =======================================
    const handleStartNext = () => {
        const shuffled = [...personas].sort(() => 0.5 - Math.random());
        // Pick a random player index
        const spyIdx = Math.floor(Math.random() * players.length);
        const spyId = players[spyIdx].id;

        const newPlayers = players.map((p, i) => ({
            id: p.id,
            name: p.name,
            isSpy: i === spyIdx,
            persona: i === spyIdx ? null : shuffled[i]
        }));
        const newEvent = events[Math.floor(Math.random() * events.length)];

        const startTimestamp = Date.now();
        const durationSeconds = players.length * 2 * 60;
        const endTimestamp = startTimestamp + durationSeconds * 1000;
        const turnStarterId = Math.floor(Math.random() * players.length) + 1;

        const roomRef = dbRef(db, `rooms/${roomCode}`);
        update(roomRef, {
            stage: "game",
            event: newEvent,
            players: newPlayers,
            spyId,
            votes: {},
            spyGuess: null,
            ready: {},
            startTimestamp,
            endTimestamp,
            turnStarterId
        });
    };

    return (
        <>
            <RoomCodeDisplay roomCode={roomCode} />
            <h2>תוצאות המשחק</h2>
            <p>{resultMessage}</p>

            <h3>האירוע האמיתי היה:</h3>
            <p>{event.title}</p>

            <h3>הניחוש של המרגל:</h3>
            <p>{spyGuess || "המרגל לא ניחש"}</p>

            <h3>מספר קולות נגד כל שחקן:</h3>
            <ul>
                {players.map((p) => (
                    <li key={p.id}>
                        {p.name} – הצביעו {voteCounts[p.id] || 0} אנשים
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "2rem", width: "100%", textAlign: "center" }}>
                {/* כפתור חזרה לדף הבית (מגריד את המאסטר מה-DB!) */}
                <button
                    className="button-rounded"
                    style={{ marginBottom: "1rem", backgroundColor: "#ccc" }}
                    onClick={async () => {
                        // remove master from the room → triggers everyone else
                        await leaveRoom(roomCode, playerId);
                        onExit();
                    }}
                >
                    חזרה לדף הבית
                </button>

                {/* כפתור toggle "אני מוכן / אני לא מוכן" לשחקנים (לא מאסטר) */}
                {!isMaster && (
                    <button
                        className="button-rounded"
                        onClick={handleReady}
                        style={{ marginBottom: "1rem" }}
                    >
                        {hasReady ? "אני לא מוכן" : "אני מוכן לסיבוב נוסף"}
                    </button>
                )}

                {/* הצגת מונה למאסטר */}
                {isMaster && (
                    <p style={{ margin: "1rem 0", color: "#555" }}>
                        מחכים ש־{remainingCount} שחקנים יסמנו "מוכן"
                    </p>
                )}

                {/* כפתור "התחל סיבוב נוסף" למאסטר, רק כשכולם מוכנים */}
                {isMaster && allReady && (
                    <button
                        className="button-rounded"
                        onClick={handleStartNext}
                    >
                        התחלת סיבוב נוסף
                    </button>
                )}
            </div>
        </>
    );
}
