import { useState, useEffect, useRef } from "react";
import { useAuth } from "../services/AuthProvider";

export default function LoginPage({ onLogin }) {
  const { login }  = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const canvasRef  = useRef(null);

  /* ── Particle canvas background ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* twinkling stars */
    const STARS = Array.from({ length: 120 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    /* slow-moving colour orbs */
    const ORBS = [
      { x: 0.15, y: 0.20, r: 320, color: "37,99,235",  speed: 0.00018 },
      { x: 0.82, y: 0.75, r: 280, color: "99,102,241", speed: 0.00024 },
      { x: 0.55, y: 0.10, r: 200, color: "14,165,233", speed: 0.00030 },
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* solid dark base */
      ctx.fillStyle = "#050911";
      ctx.fillRect(0, 0, W, H);

      /* glowing orbs */
      ORBS.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.speed * 0.7 + i) * 0.12) * W;
        const oy = (o.y + Math.cos(t * o.speed       + i) * 0.10) * H;
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grd.addColorStop(0, `rgba(${o.color},0.18)`);
        grd.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* dot grid — fades at edges */
      const gap = 28;
      for (let gx = gap / 2; gx < W; gx += gap) {
        for (let gy = gap / 2; gy < H; gy += gap) {
          const dx = (gx - W / 2) / W;
          const dy = (gy - H / 2) / H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const a = Math.max(0, 0.22 - dist * 0.55);
          ctx.fillStyle = `rgba(59,130,246,${a})`;
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* twinkling stars */
      STARS.forEach(s => {
        s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.fillStyle = `rgba(180,210,255,${s.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* subtle diagonal lines */
      [
        [0, H * 0.28, W * 0.32, 0],
        [0, H * 0.56, W * 0.52, 0],
        [W, H * 0.18, W * 0.62, H],
        [W, H * 0.50, W * 0.35, H],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.strokeStyle = "rgba(59,130,246,0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

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
      login(data.token, data.username, data.role);
      onLogin();
    } catch {
      setError("Error lidhje me serverin");
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
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Sans', sans-serif;
          overflow: hidden;
        }

        /* canvas fills the entire viewport behind everything */
        .lp-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          display: block;
        }

        /* corner bracket accents */
        .lp-corner {
          position: fixed;
          width: 36px; height: 36px;
          border-color: rgba(59,130,246,0.3);
          border-style: solid;
          z-index: 1;
          pointer-events: none;
        }
        .lp-corner-tl { top: 20px;    left: 20px;  border-width: 1px 0 0 1px; }
        .lp-corner-tr { top: 20px;    right: 20px; border-width: 1px 1px 0 0; }
        .lp-corner-bl { bottom: 20px; left: 20px;  border-width: 0 0 1px 1px; }
        .lp-corner-br { bottom: 20px; right: 20px; border-width: 0 1px 1px 0; }

        .lp-card {
          position: relative;
          z-index: 10;
          background: rgba(8, 14, 28, 0.78);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.22);
          border-radius: 14px;
          padding: 40px 36px;
          width: 100%; max-width: 380px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 40px 80px rgba(0,0,0,0.7),
            0 0 60px rgba(37,99,235,0.1);
        }

        .lp-logo {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: .18em; text-transform: uppercase;
          color: #3b82f6; margin-bottom: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-logo-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 8px #3b82f6, 0 0 16px rgba(59,130,246,0.5);
          animation: lpBlink 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes lpBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .lp-tabs {
          display: flex;
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
        .lp-tab.active { background: #1e3a5f; color: #93c5fd; }

        .lp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .lp-field label {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          color: #475569; text-transform: uppercase; letter-spacing: .08em;
        }
        .lp-input-wrap {
          display: flex; align-items: center;
          background: rgba(5,9,17,0.8); border: 1px solid #1e293b;
          border-radius: 6px; overflow: hidden;
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-input-wrap:focus-within {
          border-color: rgba(59,130,246,0.55);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .lp-input-wrap input {
          flex: 1; background: none; border: none; outline: none;
          padding: 10px 14px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px; color: #e2e8f0;
        }
        .lp-input-wrap input::placeholder { color: #334155; }

        .lp-btn {
          width: 100%; padding: 11px;
          background: #1e3a5f; border: 1px solid #2d5a8e;
          border-radius: 6px; color: #93c5fd;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; font-weight: 600;
          letter-spacing: .06em; cursor: pointer;
          margin-top: 8px;
          transition: background .15s, box-shadow .2s;
        }
        .lp-btn:hover {
          background: #2d5a8e;
          box-shadow: 0 0 28px rgba(59,130,246,0.25);
        }
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

        {/* Animated canvas background */}
        <canvas ref={canvasRef} className="lp-canvas" />

        {/* Corner bracket accents */}
        <div className="lp-corner lp-corner-tl" />
        <div className="lp-corner lp-corner-tr" />
        <div className="lp-corner lp-corner-bl" />
        <div className="lp-corner lp-corner-br" />

        {/* Login card */}
        <div className="lp-card">
          <div className="lp-logo">
            <span className="lp-logo-dot" />
            Salus Monitor
          </div>

          <div className="lp-tabs">
            <button className="lp-tab active">Login</button>
          </div>

          {error   && <div className="lp-error">{error}</div>}
          {success && <div className="lp-success">{success}</div>}

          <form onSubmit={handleLogin}>
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
              {loading ? "Ne proces..." : "Hyr ne Profil"}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}