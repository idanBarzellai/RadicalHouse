import './App.css'

export default function App() {
  const handleStart = () => {
    alert("המשחק יתחיל כאן 🎮");
  };

  return (
    <div style={{ padding: "2rem", direction: "rtl", fontFamily: "sans-serif" }}>
      <h1>RadicalHouse</h1>
      <p>משחק חשדנות באווירה קווירית</p>
      <button onClick={handleStart}>התחל משחק</button>
    </div>
  );
}