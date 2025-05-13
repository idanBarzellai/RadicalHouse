import { useState } from 'react';
import './HelpButton.css';

export default function HelpButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="help-button"
                onClick={() => setIsOpen(true)}
            >
                ?
            </button>

            {isOpen && (
                <div className="help-modal">
                    <div className="help-content">
                        <h2>איך משחקים?</h2>
                        <p>במשחק זה, כל השחקנים מקבלים דמות ומיקום משותף - חוץ מאחד שהוא המרגל.</p>
                        <p>המרגל לא יודע את המיקום, אבל צריך להעמיד פנים שהוא יודע.</p>
                        <p>השחקנים מתחלפים בשאלות על המיקום, והמרגל צריך לענות בלי לחשוף שהוא לא יודע.</p>
                        <p>בסוף הזמן, כולם מצביעים מי לדעתם המרגל.</p>
                        <p>המרגל מנצח אם לא זיהו אותו, או אם הצליח לנחש נכון את המיקום.</p>
                        <button
                            className="close-help"
                            onClick={() => setIsOpen(false)}
                        >
                            סגור
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
