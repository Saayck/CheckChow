import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const statistics = [
	{ label: "Promedio general", value: "78.4" },
	{ label: "Aprobación", value: "81%" },
	{ label: "Mayor puntaje", value: "96" },
	{ label: "Menor puntaje", value: "41" },
];

export default function GestResultados() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de resultados</h1>
					<p className="text-light-emphasis mb-0">Resumen analítico para revisar distribución y rendimiento por evaluación.</p>
				</div>

				<div className="row g-4 mb-4">
					{statistics.map((item) => (
						<div className="col-sm-6 col-xl-3" key={item.label}>
							<div className="glass-card p-4 h-100">
								<p className="metric-label mb-1">{item.label}</p>
								<h2 className="metric-value mb-0">{item.value}</h2>
							</div>
						</div>
					))}
				</div>

				<div className="glass-card p-4">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h2 className="h4 mb-0">Distribución simulada</h2>
						<span className="badge text-bg-success">Ciclo 2026-II</span>
					</div>
					<div className="progress-group d-grid gap-3">
						<div>
							<div className="d-flex justify-content-between small mb-1"><span>Excelente</span><span>24%</span></div>
							<div className="progress" style={{ height: "10px" }}><div className="progress-bar bg-success" style={{ width: "24%" }}></div></div>
						</div>
						<div>
							<div className="d-flex justify-content-between small mb-1"><span>Bueno</span><span>41%</span></div>
							<div className="progress" style={{ height: "10px" }}><div className="progress-bar bg-info" style={{ width: "41%" }}></div></div>
						</div>
						<div>
							<div className="d-flex justify-content-between small mb-1"><span>Regular</span><span>23%</span></div>
							<div className="progress" style={{ height: "10px" }}><div className="progress-bar bg-warning" style={{ width: "23%" }}></div></div>
						</div>
						<div>
							<div className="d-flex justify-content-between small mb-1"><span>Crítico</span><span>12%</span></div>
							<div className="progress" style={{ height: "10px" }}><div className="progress-bar bg-danger" style={{ width: "12%" }}></div></div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
