import { Link, NavLink, useNavigate } from "react-router-dom";
import logoImg from "../assets/favicon.png";
import "../styles/dashboard.css";
import { apiRequest } from "../utils/api";

const navItems = [
	{ to: "/panel", label: "Inicio", icon: "bi-grid-1x2" },
	{ to: "/usuarios", label: "Usuarios", icon: "bi-people" },
	{ to: "/postulantes", label: "Postulantes", icon: "bi-person-vcard" },
	{ to: "/omr", label: "OMR", icon: "bi-upc-scan" },
	{ to: "/respuestas_postulantes", label: "Respuestas", icon: "bi-diagram-3" },
	{ to: "/respuestas", label: "Claves", icon: "bi-diagram-3" },
	{ to: "/configuracion-calificacion", label: "Calificación", icon: "bi-sliders" },
	{ to: "/resultados", label: "Resultados", icon: "bi-clipboard-data" },
	{ to: "/exportar-resultados", label: "Exportar", icon: "bi-download" },
	{ to: "/resultados-oficiales", label: "PDF Oficial", icon: "bi-file-earmark-pdf" },
	{ to: "/plazas", label: "Plazas", icon: "bi-list-ol" },
	{ to: "/auditoria", label: "Auditoría", icon: "bi-shield-check" },
];

function Header() {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await apiRequest("/api/auth/logout", { method: "POST" });
		} catch {
			// Si el token ya expiró, igual se limpia la sesión local.
		}
		localStorage.removeItem("checkchow_session");
		navigate("/");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark dashboard-navbar sticky-top">
			<div className="container-fluid px-3 px-lg-4">
				<Link className="navbar-brand d-flex align-items-center gap-3" to="/panel">
					<span className="brand-mark">
						<img src={logoImg} alt="CheckChow" />
					</span>
					<span className="brand-copy">
						<strong>CheckChow</strong>
						<small>OMR para resultados de exámenes</small>
					</span>
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#dashboardNavbar"
					aria-controls="dashboardNavbar"
					aria-expanded="false"
					aria-label="Alternar navegación"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="dashboardNavbar">
					<ul className="navbar-nav ms-auto gap-1 gap-lg-2 align-items-lg-center">
						{navItems.map((item) => (
							<li className="nav-item" key={item.to}>
								<NavLink
									to={item.to}
									className={({ isActive }) =>
										`nav-link dashboard-nav-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`
									}
								>
									<i className={`bi ${item.icon}`}></i>
									<span>{item.label}</span>
								</NavLink>
							</li>
						))}
						<li className="nav-item ms-lg-2">
							<button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
								Cerrar sesión
							</button>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}

export default Header;
