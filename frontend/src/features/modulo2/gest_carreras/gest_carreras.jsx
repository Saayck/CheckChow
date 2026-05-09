import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const careers = [
	{ name: "Ingeniería de Sistemas", seats: 120, applicants: 96, status: "Abierta" },
	{ name: "Enfermería", seats: 80, applicants: 84, status: "Llena" },
	{ name: "Arquitectura", seats: 60, applicants: 52, status: "Abierta" },
	{ name: "Administración", seats: 100, applicants: 74, status: "Abierta" },
];

export default function GestCarreras() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de carreras</h1>
					<p className="text-light-emphasis mb-0">Configura cupos, demanda y estado de apertura de cada carrera.</p>
				</div>

				<div className="row g-4">
					{careers.map((career) => (
						<div className="col-md-6 col-xl-3" key={career.name}>
							<article className="glass-card p-4 h-100">
								<p className="section-kicker mb-1">Programa</p>
								<h2 className="h5 mb-3">{career.name}</h2>
								<div className="mini-stat mb-3"><span>Cupos</span><strong>{career.seats}</strong></div>
								<div className="mini-stat mb-3"><span>Postulantes</span><strong>{career.applicants}</strong></div>
								<span className={`status-pill ${career.status === "Abierta" ? "status-success" : "status-warning"}`}>{career.status}</span>
							</article>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
