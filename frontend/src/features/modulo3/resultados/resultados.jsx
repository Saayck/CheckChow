import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const examResults = [
	{ student: "María Vega", score: 84, percent: 91, status: "Aprobado" },
	{ student: "Diego Rojas", score: 71, percent: 77, status: "Aprobado" },
	{ student: "Lucía Fernández", score: 92, percent: 97, status: "Destacado" },
	{ student: "Carlos Mejía", score: 63, percent: 68, status: "Observado" },
];

export default function Resultados() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Resultados</h1>
					<p className="text-light-emphasis mb-0">Consulta el desempeño individual y la trazabilidad del examen con datos simulados.</p>
				</div>

				<div className="row g-4">
					<div className="col-lg-7">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Estudiante</th>
											<th>Puntaje</th>
											<th>Percentil</th>
											<th>Estado</th>
										</tr>
									</thead>
									<tbody>
										{examResults.map((item) => (
											<tr key={item.student}>
												<td>{item.student}</td>
												<td>{item.score}</td>
												<td>{item.percent}%</td>
												<td><span className={`status-pill ${item.status === "Destacado" ? "status-success" : item.status === "Aprobado" ? "status-warning" : "status-danger"}`}>{item.status}</span></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="col-lg-5">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Inspección rápida</p>
							<h2 className="h4 mb-3">Indicadores clave</h2>
							<div className="d-grid gap-3">
								<div className="mini-stat"><span>Hojas procesadas</span><strong>18,240</strong></div>
								<div className="mini-stat"><span>Errores de lectura</span><strong>0.8%</strong></div>
								<div className="mini-stat"><span>Publicación final</span><strong>100%</strong></div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
