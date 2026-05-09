import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/login.css";

export default function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="login-page">

      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>

      <div className="login-card">

        <div className="logo">
          <i className="bi bi-shield-lock-fill"></i>
        </div>

        <h1>Bienvenido</h1>
        <p>Sistema de Gestión de Asistencia</p>

        <form onSubmit={handleSubmit}>

          <div className="input-container">
            <span className="input-icon">
              <i className="bi bi-person-fill"></i>
            </span>

            <input
              type="text"
              placeholder="Usuario"
              className="form-control"
              autoComplete="username"
            />
          </div>

          <div className="input-container">
            <span className="input-icon">
              <i className="bi bi-lock-fill"></i>
            </span>

            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="form-control"
              autoComplete="current-password"
            />

            <button
              type="button"
              className="eye-button"
              aria-label={
                mostrarPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() =>
                setMostrarPassword(!mostrarPassword)
              }
            >
              <i
                className={`bi ${
                  mostrarPassword
                    ? "bi-eye-slash-fill"
                    : "bi-eye-fill"
                }`}
              ></i>
            </button>
          </div>

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>

        </form>

        <div className="footer-text">
          ¿Olvidaste tu contraseña?
          <span> Recuperar</span>
        </div>

      </div>

    </div>
  );
}