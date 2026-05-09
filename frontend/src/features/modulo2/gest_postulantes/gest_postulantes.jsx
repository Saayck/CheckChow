import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const postulants = [
	{ name: "María Vega", dni: "74291836", career: "Ing. de Sistemas", stage: "Registro validado" },
	{ name: "Diego Rojas", dni: "71548392", career: "Arquitectura", stage: "Documentación incompleta" },
	{ name: "Lucía Fernández", dni: "76823419", career: "Enfermería", stage: "Lista para admisión" },
	{ name: "Carlos Mejía", dni: "70192834", career: "Administración", stage: "Observado" },
];

export default function GestPostulantes() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de postulantes</h1>
					<p className="text-light-emphasis mb-0">Vista dinámica para seguimiento de inscripción, validación y estado del postulante.</p>
				</div>

				<div className="glass-card p-4">
					<div className="table-responsive">
						<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
							<thead>
								<tr>
									<th>Nombre</th>
									<th>DNI</th>
									<th>Carrera</th>
									<th>Etapa</th>
								</tr>
							</thead>
							<tbody>
								{postulants.map((postulant) => (
									<tr key={postulant.dni}>
										<td>{postulant.name}</td>
										<td>{postulant.dni}</td>
										<td>{postulant.career}</td>
										<td>{postulant.stage}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
}
