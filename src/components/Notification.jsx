import { useState, useEffect } from 'react';
import './styles/Notification.css';

export default function Notification({ message, type = 'error', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`notification ${type}`}>
            {message}
            <button className="close-button" onClick={() => {
                setIsVisible(false);
                onClose?.();
            }}>×</button>
        </div>
    );
} 