import { useState } from "react";
import "./styles/HelpButton.css";

export default function HelpButton() {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="help-wrapper">
            <button className="help-button" onClick={() => setShowHelp(true)}>?</button>

            {showHelp && (
                <div className="help-popup">
                    <button className="help-close" onClick={() => setShowHelp(false)}>✖</button>
                    <h3>איך משחקים?</h3>
                    <p>
                        לכל שחקן מוצגת דמות ואירוע, חוץ מהמרגל שלא מקבל אירוע.<br />
                        המרגל מנסה להבין היכן הוא נמצא – והאחרים מנסים לחשוף אותו.<br />
                        בסיום הסיבוב, כל אחד מצביע על מי הוא חושב המרגל!
                    </p>
                </div>
            )}
        </div>
    );
}
