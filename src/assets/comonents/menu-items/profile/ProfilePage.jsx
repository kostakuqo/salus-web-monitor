// ProfilePage.jsx
import { useAuth } from "../../../../services/AuthProvider";

export default function ProfilePage() {
  
   const { username, role } = useAuth(); // ← luam si rolul

  const loginTime = localStorage.getItem("login_time");
  const loginDate = loginTime
    ? new Date(parseInt(loginTime)).toLocaleString("sql-Al")
    : "—";

const elapsed = loginTime ? Date.now() - parseInt(loginTime) : 0;

// durata sesiunii în milisecunde (8 ore)
const sessionDuration = 8 * 60 * 60 * 1000;

// calculează timpul rămas
const remaining = Math.max(0, sessionDuration - elapsed);

// calculează ore, minute și secunde
const hours = Math.floor(remaining / (1000 * 60 * 60));
const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

// pentru afișare
console.log(`${hours}h ${minutes}m ${seconds}s`);

  return (
    <div style={{background: "#121B2E", minHeight: "92.7vh", color: "#cbd5e1" }}>
    

      <div style={{
        background: "#121b2e",
        padding: 32,
        margin: "0 auto",
       
        display: "flex",
        flexDirection: "column",
        gap: 24,
        border: "1px solid #1e2a42"
      }}>
        {/* Header profil */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#1e3a5f",
            border: "2px solid #2d5a8e",
            color: "#93c5fd",
            fontSize: 28,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "IBM Plex Mono",
            flexShrink: 0
          }}>
            {username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{username}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{role}</div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #2a3b5e" }} />

        {/* Informații detaliate */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Username" value={username} />
          <Row label="Login ne" value={loginDate} />
          <Row label="Sesioni mbaron ne   " value={`${hours}h ${minutes}m ${seconds}s`} />
          <Row label="Rol" value="Admin" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14,
      padding: "6px 0",
      borderRadius: 6,
      background: "#0f172a20",
      paddingLeft: 12,
      paddingRight: 12,
    }}>
      <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono" }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{value}</span>
    </div>
  );
}