import { Link, NavLink } from "react-router-dom";
import logoImg from "../assets/favicon.png";
import "../styles/dashboard.css";

const navItems = [
	{ to: "/panel", label: "Inicio", icon: "bi-grid-1x2" },
	{ to: "/usuarios", label: "Usuarios", icon: "bi-people" },
	{ to: "/postulantes", label: "Postulantes", icon: "bi-person-vcard" },
	{ to: "/carreras", label: "Carreras", icon: "bi-journal-bookmark" },
	{ to: "/respuestas", label: "Respuestas", icon: "bi-diagram-3" },
	{ to: "/resultados", label: "Resultados", icon: "bi-clipboard-data" },
	{ to: "/auditoria", label: "Auditoría", icon: "bi-shield-check" },
];

function Header() {
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
							<Link className="btn btn-outline-light btn-sm px-3" to="/">
								Cerrar sesión
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}

export default Header;
