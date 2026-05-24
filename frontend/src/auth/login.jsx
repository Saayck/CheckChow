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

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Login() {
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerMessage, setRegisterMessage] = useState("");
  const [error, setError] = useState("");

  const validateRegisterForm = () => {
    const errors = {};
    const trimmedName = nombreCompleto.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.nombre_completo = "Los nombres no pueden estar vacios";
    } else if (trimmedName.length > 120) {
      errors.nombre_completo = "Los nombres no pueden exceder 120 caracteres";
    }

    if (!trimmedEmail) {
      errors.email = "El correo no puede estar vacio";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "El correo debe tener un formato valido";
    } else if (trimmedEmail.length > 100) {
      errors.email = "El correo no puede exceder 100 caracteres";
    }

    if (!registerPassword.trim()) {
      errors.password = "La contraseÃ±a no puede estar vacÃ­a";
    } else if (registerPassword.length < 8) {
      errors.password = "La contraseÃ±a debe tener al menos 8 caracteres";
    } else if (!passwordRegex.test(registerPassword)) {
      errors.password = "La contraseÃ±a debe incluir al menos una mayÃºscula, una minÃºscula, un nÃºmero y un sÃ­mbolo";
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const loginEmail = username.trim();

    if (!loginEmail || !password) {
      setError("Correo y contraseña son obligatorios.");
      return;
    }

    if (!emailRegex.test(loginEmail)) {
      setError("El correo debe tener un formato válido.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status !== "OK") {
        setError(data?.message || "Credenciales inválidas.");
        return;
      }

      localStorage.setItem(
        "checkchow_session",
        JSON.stringify({
          token: data.token,
          userId: data.userId,
          nombre: data.nombre,
          email: loginEmail,
        })
      );
      navigate("/panel");
    } catch (err) {
      setError("No se pudo conectar con la API de login.");
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setRegisterMessage("");

    if (!validateRegisterForm()) {
      return;
    }

    const payload = {
      nombre_completo: nombreCompleto.trim(),
      email: email.trim(),
      password: registerPassword,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        setError(data?.message || "No se pudo registrar el usuario.");
        return;
      }

      setRegisterMessage("Usuario registrado exitosamente. Ahora inicia sesión.");
      setUsername(payload.email);
      setPassword("");
      setNombreCompleto("");
      setEmail("");
      setRegisterPassword("");
      setRegisterErrors({});
      setIsRegisterMode(false);
    } catch (err) {
      setError("No se pudo conectar con la API de registro.");
    }
  };

  const handleModeChange = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setRegisterMessage("");
    setRegisterErrors({});
  };

  return (
    <div className="login-page">

      <div className="background-circle circle1" aria-hidden="true"></div>
      <div className="background-circle circle2" aria-hidden="true"></div>

      <div className="login-card" role="form" aria-labelledby="login-title">

        <div className="logo">
          <img src={logoImg} alt="CheckChow" />
        </div>

        <h1 id="login-title">{isRegisterMode ? "Crear cuenta" : "Bienvenido"}</h1>
        <p>Sistema de GestiÃ³n de Asistencia</p>

        {isRegisterMode ? (
        <form onSubmit={handleRegisterSubmit} noValidate>

          <div className="input-container with-error">
            <span className="input-icon" aria-hidden="true"><PersonIcon /></span>

            <input
              id="nombre_completo"
              name="nombre_completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              onBlur={() => setNombreCompleto(nombreCompleto.trim())}
              type="text"
              placeholder="Nombre completo"
              className="form-control"
              autoComplete="name"
              aria-label="Nombre completo"
            />
            {registerErrors.nombre_completo && (
              <span className="field-error" role="alert">{registerErrors.nombre_completo}</span>
            )}
          </div>

          <div className="input-container with-error">
            <span className="input-icon" aria-hidden="true"><PersonIcon /></span>

            <input
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail(email.trim())}
              type="email"
              placeholder="Correo electrÃ³nico"
              className="form-control"
              autoComplete="email"
              aria-label="Correo electrÃ³nico"
            />
            {registerErrors.email && (
              <span className="field-error" role="alert">{registerErrors.email}</span>
            )}
          </div>

          <div className="input-container with-error">
            <span className="input-icon" aria-hidden="true"><LockIcon /></span>

            <input
              id="register-password"
              name="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              type={mostrarPassword ? "text" : "password"}
              placeholder="ContraseÃ±a"
              className="form-control"
              autoComplete="new-password"
              aria-label="ContraseÃ±a"
            />

            <button
              type="button"
              className="eye-button"
              aria-label={mostrarPassword ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
            {registerErrors.password && (
              <span className="field-error" role="alert">{registerErrors.password}</span>
            )}
          </div>

          {error && (
            <div className="alert-error" role="alert">{error}</div>
          )}
          {registerMessage && (
            <div className="alert-success" role="status">{registerMessage}</div>
          )}

          <button type="submit" className="btn-login">
            Registrarse
          </button>

        </form>
        ) : (
        <form onSubmit={handleSubmit} noValidate>

          <div className="input-container">
            <span className="input-icon" aria-hidden="true"><PersonIcon /></span>

            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Correo electrónico"
              className="form-control"
              autoComplete="email"
              aria-label="Correo electrónico"
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
              placeholder="ContraseÃ±a"
              className="form-control"
              autoComplete="current-password"
              aria-label="ContraseÃ±a"
              required
            />

            <button
              type="button"
              className="eye-button"
              aria-label={mostrarPassword ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <div className="alert-error" role="alert">{error}</div>
          )}
          {registerMessage && (
            <div className="alert-success" role="status">{registerMessage}</div>
          )}

          <button type="submit" className="btn-login" disabled={!username || !password}>
            Iniciar SesiÃ³n
          </button>

        </form>
        )}

        <button type="button" className="auth-toggle" onClick={handleModeChange}>
          {isRegisterMode ? "Ya tengo una cuenta" : "Crear una cuenta"}
        </button>

      </div>

    </div>
  );
}
