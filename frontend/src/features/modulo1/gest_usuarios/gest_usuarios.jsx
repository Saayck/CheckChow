import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const users = [
	{ name: "Andrea Paz", role: "Supervisión", email: "andrea.paz@checkchow.com", status: "Activo" },
	{ name: "René Torres", role: "Operador OMR", email: "rene.torres@checkchow.com", status: "Activo" },
	{ name: "Sofía León", role: "Auditor", email: "sofia.leon@checkchow.com", status: "Suspendido" },
	{ name: "Kevin Flores", role: "Admisión", email: "kevin.flores@checkchow.com", status: "Activo" },
];

export default function GestUsuarios() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 1</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de usuarios</h1>
					<p className="text-light-emphasis mb-0">Administra perfiles, permisos y estado de acceso con una vista mock responsive.</p>
				</div>

				<div className="row g-4">
					<div className="col-lg-4">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Resumen</p>
							<h2 className="h4 mb-3">Control de acceso</h2>
							<div className="d-grid gap-3">
								<div className="mini-stat"><span>Total de usuarios</span><strong>48</strong></div>
								<div className="mini-stat"><span>Roles activos</span><strong>6</strong></div>
								<div className="mini-stat"><span>Sesiones hoy</span><strong>132</strong></div>
							</div>
						</div>
					</div>
					<div className="col-lg-8">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Nombre</th>
											<th>Rol</th>
											<th>Correo</th>
											<th>Estado</th>
										</tr>
									</thead>
									<tbody>
										{users.map((user) => (
											<tr key={user.email}>
												<td>{user.name}</td>
												<td>{user.role}</td>
												<td>{user.email}</td>
												<td><span className={`status-pill ${user.status === "Activo" ? "status-success" : "status-danger"}`}>{user.status}</span></td>
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
