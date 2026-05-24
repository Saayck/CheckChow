import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logoImg from "../assets/favicon.png";
import "../styles/dashboard.css";
import { apiRequest } from "../utils/api";

const NAV_GROUPS = [
	{
		label: "Administración",
		icon: "bi-gear-fill",
		items: [
			{ to: "/panel",     label: "Inicio",    icon: "bi-grid-1x2-fill" },
			{ to: "/usuarios",  label: "Usuarios",  icon: "bi-people-fill"   },
			{ to: "/carreras",  label: "Carreras",  icon: "bi-building"      },
			{ to: "/procesos",  label: "Procesos",  icon: "bi-calendar2-event-fill" },
			{ to: "/temas",     label: "Temas",     icon: "bi-layers"              },
			{ to: "/vacantes",  label: "Vacantes",  icon: "bi-person-check-fill"   },
			{ to: "/auditoria", label: "Auditoría", icon: "bi-shield-fill-check" },
		],
	},
	{
		label: "Examen",
		icon: "bi-pencil-square",
		items: [
			{ to: "/postulantes",          label: "Postulantes", icon: "bi-person-vcard-fill" },
			{ to: "/omr",                  label: "OMR",         icon: "bi-upc-scan"          },
			{ to: "/respuestas_postulantes", label: "Respuestas", icon: "bi-list-check"       },
			{ to: "/gest-claves",          label: "Claves",      icon: "bi-key-fill"          },
			{ to: "/inscripciones",        label: "Inscripciones", icon: "bi-person-plus-fill" },
		],
	},
	{
		label: "Calificación",
		icon: "bi-calculator-fill",
		items: [
			{ to: "/configuracion-calificacion", label: "Configuración", icon: "bi-sliders"            },
			{ to: "/gestion-resultados",         label: "Gestión",       icon: "bi-clipboard2-data-fill" },
			{ to: "/resultados",                 label: "Resultados",    icon: "bi-bar-chart-fill"      },
			{ to: "/resultados-bd",              label: "Resultados BD", icon: "bi-table"               },
		],
	},
	{
		label: "Exportar",
		icon: "bi-box-arrow-up",
		items: [
			{ to: "/resultados-oficiales", label: "PDF Oficial", icon: "bi-file-earmark-pdf-fill" },
			{ to: "/plazas",               label: "Plazas",      icon: "bi-list-ol"               },
			{ to: "/exportar-resultados",  label: "Exportar",    icon: "bi-download"              },
		],
	},
];

const headerCss = `
.dashboard-navbar .nav-group-toggle {
	color: #94a3b8;
	font-size: 0.85rem;
	font-weight: 600;
	letter-spacing: 0.02em;
	padding: 6px 14px;
	border-radius: 8px;
	border: none;
	background: transparent;
	display: flex;
	align-items: center;
	gap: 7px;
	transition: color 0.15s, background 0.15s;
	white-space: nowrap;
	cursor: pointer;
}
.dashboard-navbar .nav-group-toggle:hover,
.dashboard-navbar .nav-group-toggle.group-active {
	color: #f8fafc;
	background: rgba(255,255,255,0.06);
}
.dashboard-navbar .nav-group-toggle .caret {
	font-size: 0.65rem;
	opacity: 0.6;
	transition: transform 0.2s;
}
.dashboard-navbar .dropdown.show .caret {
	transform: rotate(180deg);
}
.dashboard-navbar .nav-group-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #22c55e;
	flex-shrink: 0;
}

/* Dropdown menu */
.nav-dropdown-menu {
	background: rgba(7, 12, 22, 0.98) !important;
	border: 1px solid rgba(148,163,184,0.13) !important;
	border-radius: 14px !important;
	padding: 8px 6px !important;
	min-width: 210px;
	box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.05) !important;
	backdrop-filter: blur(16px);
	margin-top: 6px !important;
}
.nav-dropdown-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 14px;
	border-radius: 9px;
	color: #94a3b8;
	font-size: 0.86rem;
	font-weight: 500;
	text-decoration: none;
	transition: background 0.13s, color 0.13s;
}
.nav-dropdown-item:hover {
	background: rgba(255,255,255,0.06);
	color: #e2e8f0;
}
.nav-dropdown-item.active-page {
	background: rgba(34,197,94,0.12);
	color: #22c55e;
	font-weight: 700;
}
.nav-dropdown-item i {
	font-size: 0.95rem;
	width: 18px;
	text-align: center;
	opacity: 0.8;
}
.nav-dropdown-item.active-page i {
	opacity: 1;
}
.nav-dropdown-divider {
	height: 1px;
	background: rgba(148,163,184,0.08);
	margin: 5px 8px;
}

/* Mobile collapse */
@media (max-width: 991px) {
	.nav-dropdown-menu {
		border: none !important;
		background: transparent !important;
		box-shadow: none !important;
		padding: 0 0 4px 12px !important;
		margin-top: 0 !important;
		min-width: unset;
	}
	.nav-dropdown-item {
		padding: 7px 10px;
	}
	.dashboard-navbar .nav-group-toggle {
		width: 100%;
		justify-content: space-between;
	}
}
`;

function NavGroup({ group, location }) {
	const isGroupActive = group.items.some((item) => location.pathname === item.to);

	return (
		<li className="nav-item dropdown">
			<button
				className={`nav-group-toggle dropdown-toggle${isGroupActive ? " group-active" : ""}`}
				data-bs-toggle="dropdown"
				aria-expanded="false"
				type="button"
			>
				<i className={`bi ${group.icon}`}></i>
				<span>{group.label}</span>
				{isGroupActive && <span className="nav-group-dot ms-auto"></span>}
				<i className="bi bi-chevron-down caret"></i>
			</button>
			<ul className="dropdown-menu nav-dropdown-menu">
				{group.items.map((item, idx) => (
					<li key={item.to}>
						{idx > 0 && idx === group.items.length - 1 && group.items.length > 2 && (
							<div className="nav-dropdown-divider"></div>
						)}
						<NavLink
							to={item.to}
							className={({ isActive }) =>
								`nav-dropdown-item${isActive ? " active-page" : ""}`
							}
						>
							<i className={`bi ${item.icon}`}></i>
							<span>{item.label}</span>
						</NavLink>
					</li>
				))}
			</ul>
		</li>
	);
}

function Header() {
	const navigate  = useNavigate();
	const location  = useLocation();

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
		<>
			<style>{headerCss}</style>
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
						<ul className="navbar-nav ms-auto gap-1 gap-lg-1 align-items-lg-center">
							{NAV_GROUPS.map((group) => (
								<NavGroup key={group.label} group={group} location={location} />
							))}
							<li className="nav-item ms-lg-3">
								<button
									className="btn btn-outline-light btn-sm px-3"
									onClick={handleLogout}
									style={{ fontSize: "0.83rem", borderColor: "rgba(148,163,184,0.3)" }}
								>
									<i className="bi bi-box-arrow-right me-1"></i>
									Cerrar sesión
								</button>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</>
	);
}

export default Header;
