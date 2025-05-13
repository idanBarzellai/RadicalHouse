import logo from '/src/assets/radical-logo.svg';
import "./LogoHeader.css"

export default function LogoHeader() {
    return (
        <div className="logo-header">
            <img src={logo} alt="בית רדיקל" className="radical-logo" />
        </div>
    );
}