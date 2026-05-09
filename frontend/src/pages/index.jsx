import { Link } from "react-router-dom";
import Header from "../components/header";
import "../styles/dashboard.css";

const metrics = [
	{ label: "Exámenes procesados", value: "12.480", trend: "+14% este mes", icon: "bi-clipboard-check" },
	{ label: "Postulantes activos", value: "3.214", trend: "+8% esta semana", icon: "bi-person-check" },
	{ label: "Carreras habilitadas", value: "28", trend: "2 nuevas este ciclo", icon: "bi-mortarboard" },
	{ label: "Auditorías cerradas", value: "94%", trend: "SLA dentro del objetivo", icon: "bi-shield-check" },
];

const quickActions = [
	{ to: "/postulantes", title: "Registrar postulante", icon: "bi-person-plus", text: "Crea un nuevo registro y valida sus datos." },
	{ to: "/admision", title: "Procesar admisión", icon: "bi-diagram-3", text: "Simula lotes, estados y observaciones." },
	{ to: "/resultados", title: "Ver resultados", icon: "bi-graph-up-arrow", text: "Consulta notas, promedio y distribución." },
];

const recentAdmissions = [
	{ code: "ADM-2026-041", postulant: "María Vega", career: "Ingeniería de Sistemas", score: 84, status: "Aprobado" },
	{ code: "ADM-2026-039", postulant: "Diego Rojas", career: "Arquitectura", score: 71, status: "En revisión" },
	{ code: "ADM-2026-033", postulant: "Lucía Fernández", career: "Enfermería", score: 92, status: "Aprobado" },
	{ code: "ADM-2026-028", postulant: "Carlos Mejía", career: "Administración", score: 63, status: "Observado" },
];

function DashboardPage() {
	return (
		<div className="dashboard-shell">
			<Header />

			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<section className="hero-panel mb-4 mb-lg-5">
					<div className="row align-items-center g-4">
						<div className="col-lg-7">
							<span className="eyebrow">Sistema OMR</span>
							<h1 className="display-5 fw-bold mb-3">Controla postulantes, admisión y resultados desde un solo panel.</h1>
							<p className="lead text-light-emphasis mb-4">
								Esta vista consolida el flujo principal del sistema con métricas simuladas, accesos rápidos y actividad reciente.
							</p>
							<div className="d-flex flex-wrap gap-2">
								<Link to="/postulantes" className="btn btn-success btn-lg px-4">Nuevo postulante</Link>
								<Link to="/resultados" className="btn btn-outline-light btn-lg px-4">Explorar resultados</Link>
							</div>
						</div>
						<div className="col-lg-5">
							<div className="hero-card glass-card p-4 p-lg-4">
								<div className="d-flex justify-content-between align-items-start mb-3">
									<div>
										<p className="text-uppercase text-secondary small mb-1">Procesamiento actual</p>
										<h2 className="h4 mb-0">Lote de admisión 2026-II</h2>
									</div>
									<span className="status-pill status-live">En vivo</span>
								</div>
								<div className="progress mb-2" style={{ height: "10px" }}>
									<div className="progress-bar bg-success" style={{ width: "72%" }}></div>
								</div>
								<div className="d-flex justify-content-between small text-light-emphasis mb-4">
									<span>72% procesado</span>
									<span>18,240 hojas OMR</span>
								</div>
								<div className="row g-3">
									<div className="col-6">
										<div className="mini-stat">
											<span>Correctas</span>
											<strong>13,920</strong>
										</div>
									</div>
									<div className="col-6">
										<div className="mini-stat">
											<span>Observadas</span>
											<strong>412</strong>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="row g-3 g-xl-4 mb-4 mb-lg-5">
					{metrics.map((metric) => (
						<div className="col-sm-6 col-xxl-3" key={metric.label}>
							<article className="metric-card glass-card h-100 p-4">
								<div className="metric-icon"><i className={`bi ${metric.icon}`}></i></div>
								<p className="metric-label mb-1">{metric.label}</p>
								<h3 className="metric-value mb-2">{metric.value}</h3>
								<span className="metric-trend">{metric.trend}</span>
							</article>
						</div>
					))}
				</section>

				<section className="row g-4 mb-4 mb-lg-5">
					<div className="col-lg-7">
						<div className="glass-card h-100 p-4">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<p className="section-kicker mb-1">Actividad reciente</p>
									<h2 className="h4 mb-0">Admisiones procesadas</h2>
								</div>
								<span className="badge text-bg-dark">Últimas 24 horas</span>
							</div>
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle mb-0 dashboard-table">
									<thead>
										<tr>
											<th>Código</th>
											<th>Postulante</th>
											<th>Carrera</th>
											<th>Puntaje</th>
											<th>Estado</th>
										</tr>
									</thead>
									<tbody>
										{recentAdmissions.map((item) => (
											<tr key={item.code}>
												<td>{item.code}</td>
												<td>{item.postulant}</td>
												<td>{item.career}</td>
												<td>{item.score}</td>
												<td>
													<span className={`status-pill ${item.status === "Aprobado" ? "status-success" : item.status === "En revisión" ? "status-warning" : "status-danger"}`}>
														{item.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div className="col-lg-5">
						<div className="glass-card h-100 p-4">
							<p className="section-kicker mb-1">Acciones rápidas</p>
							<h2 className="h4 mb-4">Navega por los módulos</h2>
							<div className="d-grid gap-3">
								{quickActions.map((action) => (
									<Link key={action.to} to={action.to} className="quick-action">
										<div className="quick-action-icon"><i className={`bi ${action.icon}`}></i></div>
										<div className="flex-grow-1">
											<h3 className="h6 mb-1">{action.title}</h3>
											<p className="mb-0 text-light-emphasis">{action.text}</p>
										</div>
										<i className="bi bi-arrow-right-short fs-3"></i>
									</Link>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

export default DashboardPage;
