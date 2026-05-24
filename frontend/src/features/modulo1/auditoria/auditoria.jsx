import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const formatDate = (value) => {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(value));
};

const getSeverity = (event) => {
	if (event.accion === "DELETE" || event.metodoHttp === "DELETE") {
		return "Alta";
	}
	if (event.accion === "LOGIN" || event.accion === "LOGOUT" || event.metodoHttp === "POST") {
		return "Media";
	}
	return "Baja";
};

export default function Auditoria() {
	const [events, setEvents] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadData = async () => {
		setLoading(true);
		setError("");
		try {
			const [auditData, userData] = await Promise.all([
				apiRequest("/api/auditoria"),
				apiRequest("/api/usuarios").catch(() => []),
			]);
			setEvents(auditData || []);
			setUsers(userData || []);
		} catch (err) {
			setError(err.message || "No se pudo cargar la auditoría");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const userMap = useMemo(() => {
		const map = new Map();
		users.forEach((user) => map.set(user.id, user.nombre_completo || user.email));
		return map;
	}, [users]);

	const stats = useMemo(() => {
		const high = events.filter((event) => getSeverity(event) === "Alta").length;
		const openAlerts = events.filter((event) => event.accion === "DELETE" || event.accion === "LOGIN").length;
		const integrity = events.length === 0 ? "100%" : `${Math.max(0, 100 - high * 2).toFixed(1)}%`;

		return { high, openAlerts, integrity };
	}, [events]);

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4 d-flex justify-content-between align-items-start">
					<div>
						<span className="eyebrow">Módulo 1</span>
						<h1 className="display-6 fw-bold mb-2">Auditoría</h1>
						<p className="text-light-emphasis mb-0">Seguimiento real de acciones críticas, sesiones y trazabilidad operativa.</p>
					</div>
					<button className="btn btn-glass" onClick={loadData} disabled={loading}>
						<i className="bi bi-arrow-clockwise"></i> Actualizar
					</button>
				</div>

				{error && <div className="alert alert-danger">{error}</div>}

				<div className="row g-4">
					<div className="col-lg-4">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Estado del sistema</p>
							<h2 className="h4 mb-3">Monitoreo de integridad</h2>
							<div className="d-grid gap-3">
								<div className="mini-stat"><span>Eventos críticos</span><strong>{stats.high}</strong></div>
								<div className="mini-stat"><span>Alertas abiertas</span><strong>{stats.openAlerts}</strong></div>
								<div className="mini-stat"><span>Integridad general</span><strong>{stats.integrity}</strong></div>
							</div>
						</div>
					</div>
					<div className="col-lg-8">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Fecha</th>
											<th>Usuario</th>
											<th>Acción</th>
											<th>Método</th>
											<th>Endpoint</th>
											<th>IP</th>
											<th>Severidad</th>
										</tr>
									</thead>
									<tbody>
										{loading && (
											<tr><td colSpan="7" className="text-center text-light-emphasis">Cargando auditoría...</td></tr>
										)}
										{!loading && events.length === 0 && (
											<tr><td colSpan="7" className="text-center text-light-emphasis">No hay eventos registrados.</td></tr>
										)}
										{!loading && events.map((event) => {
											const severity = getSeverity(event);
											return (
												<tr key={event.id}>
													<td>{formatDate(event.fecha)}</td>
													<td>{userMap.get(event.usuarioId) || `Usuario ${event.usuarioId || "-"}`}</td>
													<td>{event.accion || "-"}</td>
													<td>{event.metodoHttp || "-"}</td>
													<td>{event.endpoint || "-"}</td>
													<td>{event.ipOrigen || "-"}</td>
													<td><span className={`status-pill ${severity === "Alta" ? "status-danger" : severity === "Media" ? "status-warning" : "status-success"}`}>{severity}</span></td>
												</tr>
											);
										})}
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
