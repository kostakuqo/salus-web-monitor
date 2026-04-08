import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const ONE_HOUR = 60 * 60 * 1000; // 1 oră în ms

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [username, setUsername] = useState(() => localStorage.getItem("username"));
    const [role, setRole] = useState(() => localStorage.getItem("role"));


    const login = (token, username, userRole) => {
        const loginTime = Date.now();
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", userRole); // ← salvează rolul
        localStorage.setItem("login_time", loginTime);
        setToken(token);
        setUsername(username);
        setRole(userRole);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");      // ← curăță rolul
        localStorage.removeItem("login_time");
        setToken(null);
        setUsername(null);
        setRole(null);
    };

    // ── auto-logout după 1 oră ─────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;

        const loginTime = parseInt(localStorage.getItem("login_time") || "0");
        const elapsed = Date.now() - loginTime;
        const remaining = ONE_HOUR - elapsed;

        // dacă a trecut deja ora → logout imediat
        if (remaining <= 0) {
            logout();
            return;
        }

        // altfel → setează timer pentru timpul rămas
        const timer = setTimeout(() => {
            logout();
        }, remaining);

        return () => clearTimeout(timer);
    }, [token]);

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    });

    return (
        <AuthContext.Provider value={{ token, username,role, login, logout, authHeaders }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);