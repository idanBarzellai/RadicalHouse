export default function PageContainer({ children }) {
    return (
        <div style={{
            justifyContent: "center",
            alignItems: "start",
            direction: "rtl",
            width: "100%",
            maxWidth: "500px",
            backgroundColor: "#f2f2f2",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            color: "#222", // ✅ טקסט כהה
            fontFamily: "sans-serif"
        }}>
            {children}
        </div>
    );
}