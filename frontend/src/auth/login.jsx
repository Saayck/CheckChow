import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logoImg from "../assets/logo.png";

const PersonIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.58 10.59A3 3 0 0 0 13.41 13.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12s4-7 10-7c2.02 0 3.87.5 5.45 1.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validUsers = [
    { username: "admin", password: "admin123", role: "Administrador" },
    { username: "operador", password: "omr2026", role: "Operador" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }

    const matchedUser = validUsers.find(
      (user) => user.username === username.trim().toLowerCase() && user.password === password
    );

    if (!matchedUser) {
      setError("Credenciales inválidas. Prueba con admin / admin123 u operador / omr2026.");
      return;
    }

    localStorage.setItem(
      "checkchow_session",
      JSON.stringify({ username: matchedUser.username, role: matchedUser.role })
    );
    navigate("/panel");
  };

  return (
    <div className="login-page">

      <div className="background-circle circle1" aria-hidden="true"></div>
      <div className="background-circle circle2" aria-hidden="true"></div>

      <div className="login-card" role="form" aria-labelledby="login-title">

        <div className="logo">
          <img src={logoImg} alt="CheckChow" />
        </div>

        <h1 id="login-title">Bienvenido</h1>
        <p>Sistema de Gestión de Asistencia</p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="input-container">
            <span className="input-icon" aria-hidden="true"><PersonIcon /></span>

            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Usuario"
              className="form-control"
              autoComplete="username"
              aria-label="Usuario"
              required
            />
          </div>

          <div className="input-container">
            <span className="input-icon" aria-hidden="true"><LockIcon /></span>

            <input
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="form-control"
              autoComplete="current-password"
              aria-label="Contraseña"
              required
            />

            <button
              type="button"
              className="eye-button"
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <div className="alert-error" role="alert">{error}</div>
          )}

          <button type="submit" className="btn-login" disabled={!username || !password}>
            Iniciar Sesión
          </button>

        </form>


      </div>

    </div>
  );
}