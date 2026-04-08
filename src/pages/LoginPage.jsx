import { useState } from "react";
import { useAuth } from "../services/AuthProvider";

export default function LoginPage({ onLogin }) {
  const { login }    = useAuth();
  const [tab,        setTab]        = useState("login"); // "login" | "register"
  const [username,   setUsername]   = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [loading,    setLoading]    = useState(false);

  const reset = () => { setError(""); setSuccess(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      login(data.token, data.username, data.role);  // ← era doar data.token, data.username
      onLogin();
    } catch {
      setError("Eroare de conexiune cu serverul");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .lp-root {
          min-height: 100vh;
          background: #080c14;
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .lp-card {
          background: #0c1220;
          border: 1px solid #1a2236;
          border-radius: 12px;
          padding: 40px 36px;
          width: 100%; max-width: 380px;
          box-shadow: 0 24px 48px rgba(0,0,0,.5);
        }
        .lp-logo {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: .18em; text-transform: uppercase;
          color: #3b82f6; margin-bottom: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-logo::before {
          content: '';
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 8px #3b82f6;
        }
        .lp-tabs {
          display: flex; gap: 0;
          border: 1px solid #1e293b; border-radius: 6px;
          overflow: hidden; margin-bottom: 28px;
        }
        .lp-tab {
          flex: 1; padding: 9px;
          background: none; border: none; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 500;
          color: #475569; transition: background .15s, color .15s;
        }
        .lp-tab.active {
          background: #1e3a5f; color: #93c5fd;
        }
        .lp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .lp-field label {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          color: #475569; text-transform: uppercase; letter-spacing: .08em;
        }
        .lp-input-wrap {
          display: flex; align-items: center;
          background: #090d18; border: 1px solid #1e293b;
          border-radius: 6px; overflow: hidden;
          transition: border-color .15s;
        }
        .lp-input-wrap:focus-within { border-color: #3b82f6; }
        .lp-input-wrap input {
          flex: 1; background: none; border: none; outline: none;
          padding: 10px 14px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px; color: #e2e8f0;
        }
        .lp-btn {
          width: 100%; padding: 11px;
          background: #1e3a5f; border: 1px solid #2d5a8e;
          border-radius: 6px; color: #93c5fd;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; font-weight: 600;
          letter-spacing: .06em; cursor: pointer;
          margin-top: 8px;
          transition: background .15s;
        }
        .lp-btn:hover    { background: #2d5a8e; }
        .lp-btn:disabled { opacity: .5; pointer-events: none; }
        .lp-error {
          background: #2a0f0f; border: 1px solid #7f1d1d;
          color: #f87171; font-size: 11px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 9px 13px; border-radius: 6px; margin-bottom: 16px;
        }
        .lp-success {
          background: #0f2a18; border: 1px solid #166534;
          color: #4ade80; font-size: 11px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 9px 13px; border-radius: 6px; margin-bottom: 16px;
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">
          <div className="lp-logo">Salus Monitor</div>

          <div className="lp-tabs">
            <button
              className={`lp-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); reset(); }}
            >
              Login
            </button>
            
          </div>

          {error   && <div className="lp-error">{error}</div>}
          {success && <div className="lp-success">{success}</div>}

          <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
            <div className="lp-field">
              <label>Username</label>
              <div className="lp-input-wrap">
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Password</label>
              <div className="lp-input-wrap">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="lp-btn" type="submit" disabled={loading}>
              {loading ? "Se procesează..." : tab === "login" ? "Hyr ne Profil" : "Creează cont"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}