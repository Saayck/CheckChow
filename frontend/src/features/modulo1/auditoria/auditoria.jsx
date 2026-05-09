import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const events = [
	{ time: "08:14", user: "Andrea Paz", action: "Exportó resultados OMR", severity: "Alta" },
	{ time: "09:32", user: "René Torres", action: "Aprobó lote de admisión", severity: "Media" },
	{ time: "10:05", user: "Sofía León", action: "Revisó incidencia de escaneo", severity: "Alta" },
	{ time: "11:21", user: "Kevin Flores", action: "Actualizó postulante", severity: "Baja" },
];

export default function Auditoria() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 1</span>
					<h1 className="display-6 fw-bold mb-2">Auditoría</h1>
					<p className="text-light-emphasis mb-0">Seguimiento simulado de acciones críticas, incidentes y trazabilidad operativa.</p>
				</div>

				<div className="row g-4">
					<div className="col-lg-5">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Estado del sistema</p>
							<h2 className="h4 mb-3">Monitoreo de integridad</h2>
							<div className="d-grid gap-3">
								<div className="mini-stat"><span>Eventos críticos</span><strong>7</strong></div>
								<div className="mini-stat"><span>Alertas abiertas</span><strong>2</strong></div>
								<div className="mini-stat"><span>Integridad general</span><strong>98.6%</strong></div>
							</div>
						</div>
					</div>
					<div className="col-lg-7">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Hora</th>
											<th>Usuario</th>
											<th>Acción</th>
											<th>Severidad</th>
										</tr>
									</thead>
									<tbody>
										{events.map((event) => (
											<tr key={`${event.time}-${event.user}`}>
												<td>{event.time}</td>
												<td>{event.user}</td>
												<td>{event.action}</td>
												<td><span className={`status-pill ${event.severity === "Alta" ? "status-danger" : event.severity === "Media" ? "status-warning" : "status-success"}`}>{event.severity}</span></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
