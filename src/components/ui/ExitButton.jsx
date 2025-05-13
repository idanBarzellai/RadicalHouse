import './ExitButton.css';

export default function ExitButton({ onExit }) {
    return (
        <button
            className="exit-button"
            onClick={onExit}
        >
            ✖
        </button>
    );
}


