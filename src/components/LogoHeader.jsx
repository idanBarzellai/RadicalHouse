import logo from '/src/assets/radical-logo.svg';
import "./styles/LogoHeader.css"
export default function LogoHeader() {
    return (
        <div className="logo-block">
            <img src={logo} alt="בית רדיקל" className="radical-logo" />
        </div>
    );
}