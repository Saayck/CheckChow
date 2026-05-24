import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const empty = { procesoId: "", postulanteId: "", carreraId: "" };

const modalStyles = `
	.custom-modal-backdrop { background: rgba(0,0,0,0.64) !important; backdrop-filter: blur(8px); }
	.custom-modal-content  { background: rgba(7,12,22,0.95) !important; border: 1px solid rgba(148,163,184,0.12) !important; border-radius: 28px !important; }
	.custom-modal-header   { border-bottom: 1px solid rgba(148,163,184,0.12) !important; color: #f8fafc !important; }
	.custom-modal-footer   { border-top: 1px solid rgba(148,163,184,0.12) !important; }
	.form-label   { color: #cbd5e1 !important; font-weight: 600; font-size: 0.92rem; }
	.form-control, .form-select { background: rgba(255,255,255,0.04) !important; border: 1px solid rgba(148,163,184,0.12) !important; color: #f8fafc !important; }
	.form-control::placeholder { color: rgba(203,213,225,0.5) !important; }
	.form-control:focus, .form-select:focus { background: rgba(255,255,255,0.06) !important; border-color: rgba(134,239,172,0.24) !important; box-shadow: 0 0 0 0.25rem rgba(34,197,94,0.15) !important; color: #f8fafc !important; }
	.form-select option { background: #0f172a; color: #f8fafc; }
`;

const nombreCompleto = (p) =>
	[p?.nombres, p?.apellidoPat, p?.apellidoMat].filter(Boolean).join(" ");

export default function GestInscripciones() {
	const [procesos, setProcesos] = useState([]);
	const [postulantes, setPostulantes] = useState([]);
	const [carreras, setCarreras] = useState([]);
	const [inscripciones, setInscripciones] = useState([]);
	const [filtroProceso, setFiltroProceso] = useState("__TODOS__");
	const [busqueda, setBusqueda] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(empty);
	const [saving, setSaving] = useState(false);

	const loadInscripciones = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/inscripcion");
			setInscripciones(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar inscripciones");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		apiRequest("/api/proceso-admision").then(d => setProcesos(d || [])).catch(() => {});
		apiRequest("/api/postulante").then(d => setPostulantes(d || [])).catch(() => {});
		apiRequest("/api/carrera").then(d => setCarreras((d || []).filter(c => c.activo))).catch(() => {});
		loadInscripciones();
	}, []);

	const inscripcionesFiltradas = useMemo(() => {
		let list = inscripciones;
		if (filtroProceso !== "__TODOS__") {
			list = list.filter(i => String(i.proceso?.id) === filtroProceso);
		}
		if (busqueda.trim()) {
			const q = busqueda.trim().toLowerCase();
			list = list.filter(i => {
				const nombre = nombreCompleto(i.postulante).toLowerCase();
				const dni = String(i.postulante?.dni || "").toLowerCase();
				return nombre.includes(q) || dni.includes(q);
			});
		}
		return list;
	}, [inscripciones, filtroProceso, busqueda]);

	const openNew = () => {
		setForm({ ...empty, procesoId: procesos[0]?.id ?? "" });
		setIsEditing(false);
		setEditingId(null);
		setError("");
		setShowModal(true);
	};

	const openEdit = (i) => {
		setForm({
			procesoId:    i.proceso?.id ?? "",
			postulanteId: i.postulante?.id ?? "",
			carreraId:    i.carrera?.id ?? "",
		});
		setEditingId(i.id);
		setIsEditing(true);
		setError("");
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("¿Eliminar esta inscripción?")) return;
		setError("");
		try {
			await apiRequest(`/api/inscripcion/${id}`, { method: "DELETE" });
			setInscripciones(prev => prev.filter(i => i.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.procesoId)    { setError("Selecciona un proceso"); return; }
		if (!form.postulanteId) { setError("Selecciona un postulante"); return; }
		if (!form.carreraId)    { setError("Selecciona una carrera"); return; }
		setSaving(true);
		setError("");
		try {
			const payload = {
				proceso:    { id: Number(form.procesoId) },
				postulante: { id: Number(form.postulanteId) },
				carrera:    { id: Number(form.carreraId) },
			};
			if (isEditing) {
				await apiRequest(`/api/inscripcion/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/inscripcion", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowModal(false);
			await loadInscripciones();
		} catch (err) {
			setError(err.message || "No se pudo guardar");
		} finally {
			setSaving(false);
		}
	};

	const formatFecha = (iso) => {
		if (!iso) return "—";
		try {
			return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
		} catch { return iso; }
	};

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="page-title mb-4 d-flex justify-content-between align-items-start">
						<div>
							<span className="eyebrow">Examen — BD</span>
							<h1 className="display-6 fw-bold mb-2">Inscripciones</h1>
							<p className="text-light-emphasis mb-0">
								Gestiona la inscripción de postulantes a procesos de admisión.
							</p>
						</div>
						<button
							className="btn btn-glass"
							onClick={openNew}
							disabled={procesos.length === 0 || postulantes.length === 0}
							title={postulantes.length === 0 ? "No hay postulantes en la BD" : ""}
						>
							<i className="bi bi-plus-lg me-1"></i>Nueva inscripción
						</button>
					</div>

					<div className="row g-3 mb-4">
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Total inscripciones</p>
								<h2 className="metric-value mb-0">{inscripcionesFiltradas.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Postulantes BD</p>
								<h2 className="metric-value mb-0" style={{ color: "#22c55e" }}>{postulantes.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Procesos activos</p>
								<h2 className="metric-value mb-0" style={{ color: "#eab308" }}>{procesos.length}</h2>
							</div>
						</div>
					</div>

					{error && <div className="alert alert-danger mb-4">{error}</div>}

					{postulantes.length === 0 && !loading && (
						<div className="glass-card p-4 mb-4">
							<p className="text-light-emphasis mb-0">
								<i className="bi bi-info-circle me-2"></i>
								No hay postulantes en la BD. Ve a{" "}
								<strong style={{ color: "#cbd5e1" }}>Examen → Postulantes</strong>{" "}
								e importa el archivo DBF/Excel — se guardarán automáticamente en la base de datos y aparecerán aquí.
							</p>
						</div>
					)}

					<div className="glass-card p-0">
						<div className="d-flex flex-wrap align-items-center gap-3 px-4 py-3"
							style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
							<select
								className="form-select form-select-sm"
								style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 280 }}
								value={filtroProceso}
								onChange={e => setFiltroProceso(e.target.value)}
							>
								<option value="__TODOS__">— Todos los procesos —</option>
								{procesos.map(p => (
									<option key={p.id} value={p.id}>{p.codigo} — {p.periodo} {p.anio}</option>
								))}
							</select>
							<input
								type="text"
								className="form-control form-control-sm"
								style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 240 }}
								placeholder="Buscar por nombre o DNI..."
								value={busqueda}
								onChange={e => setBusqueda(e.target.value)}
							/>
							<span style={{ color: "#64748b", fontSize: "0.82rem" }}>
								{inscripcionesFiltradas.length} inscripción(es)
							</span>
						</div>

						<div className="table-responsive">
							<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
								<thead>
									<tr>
										<th>Postulante</th>
										<th>DNI</th>
										<th>Proceso</th>
										<th>Carrera</th>
										<th>Fecha</th>
										<th style={{ width: 90 }}></th>
									</tr>
								</thead>
								<tbody>
									{loading && (
										<tr><td colSpan="6" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
									)}
									{!loading && inscripcionesFiltradas.length === 0 && (
										<tr>
											<td colSpan="6" className="text-center text-light-emphasis py-4">
												No hay inscripciones para el filtro seleccionado.
											</td>
										</tr>
									)}
									{!loading && inscripcionesFiltradas.map(i => (
										<tr key={i.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
											<td><strong style={{ color: "#e2e8f0" }}>{nombreCompleto(i.postulante) || "—"}</strong></td>
											<td style={{ fontFamily: "monospace", color: "#94a3b8" }}>
												{i.postulante?.dni || "—"}
											</td>
											<td style={{ fontSize: "0.82rem", color: "#64748b" }}>
												<span style={{ color: "#94a3b8" }}>{i.proceso?.codigo}</span>
												{" · "}{i.proceso?.periodo} {i.proceso?.anio}
											</td>
											<td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
												{i.carrera?.nombre || "—"}
											</td>
											<td style={{ fontSize: "0.78rem", color: "#64748b" }}>
												{formatFecha(i.fechaInscripcion)}
											</td>
											<td>
												<button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(i)} title="Editar">
													<i className="bi bi-pencil"></i>
												</button>
												<button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.id)} title="Eliminar">
													<i className="bi bi-trash"></i>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</main>

				{showModal && (
					<div className="modal d-block custom-modal-backdrop">
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content custom-modal-content">
								<div className="modal-header custom-modal-header border-0 pb-3">
									<h5 className="modal-title fw-bold">
										{isEditing ? "Editar inscripción" : "Nueva inscripción"}
									</h5>
									<button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
								</div>
								<form onSubmit={handleSubmit}>
									<div className="modal-body px-4 py-4">
										<div className="mb-3">
											<label className="form-label">Proceso de admisión</label>
											<select className="form-select" value={form.procesoId}
												onChange={e => setForm({ ...form, procesoId: e.target.value })} required>
												<option value="">— Seleccionar proceso —</option>
												{procesos.map(p => (
													<option key={p.id} value={p.id}>{p.codigo} — {p.periodo} {p.anio}</option>
												))}
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Postulante</label>
											<select className="form-select" value={form.postulanteId}
												onChange={e => setForm({ ...form, postulanteId: e.target.value })} required>
												<option value="">— Seleccionar postulante —</option>
												{postulantes.map(p => (
													<option key={p.id} value={p.id}>
														{p.dni} — {nombreCompleto(p)}
													</option>
												))}
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Carrera</label>
											<select className="form-select" value={form.carreraId}
												onChange={e => setForm({ ...form, carreraId: e.target.value })} required>
												<option value="">— Seleccionar carrera —</option>
												{carreras.map(c => (
													<option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
												))}
											</select>
										</div>
										{error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button type="button" className="btn btn-outline-secondary"
											onClick={() => setShowModal(false)}
											style={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,0.2)" }}>
											Cancelar
										</button>
										<button type="submit" className="btn btn-success" disabled={saving}
											style={{ background: "#22c55e", borderColor: "#22c55e" }}>
											{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Inscribir"}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
