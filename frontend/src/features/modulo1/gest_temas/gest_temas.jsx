import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const empty = { procesoId: "", codigo: "", descripcion: "", totalPreguntas: 100, activo: true };

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

export default function GestTemas() {
	const [procesos, setProcesos] = useState([]);
	const [temas, setTemas] = useState([]);
	const [filtroProceso, setFiltroProceso] = useState("__TODOS__");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(empty);
	const [saving, setSaving] = useState(false);

	const loadProcesos = async () => {
		try {
			const data = await apiRequest("/api/proceso-admision");
			setProcesos(data || []);
		} catch {
			// silencioso, se maneja abajo con el error general
		}
	};

	const loadTemas = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/tema");
			setTemas(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar temas");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProcesos();
		loadTemas();
	}, []);

	const temasFiltrados = useMemo(() => {
		if (filtroProceso === "__TODOS__") return temas;
		return temas.filter((t) => String(t.proceso?.id) === filtroProceso);
	}, [temas, filtroProceso]);

	const openNew = () => {
		setForm({ ...empty, procesoId: procesos[0]?.id ?? "" });
		setIsEditing(false);
		setEditingId(null);
		setError("");
		setShowModal(true);
	};

	const openEdit = (t) => {
		setForm({
			procesoId:      t.proceso?.id ?? "",
			codigo:         t.codigo || "",
			descripcion:    t.descripcion || "",
			totalPreguntas: t.totalPreguntas ?? 100,
			activo:         t.activo ?? true,
		});
		setEditingId(t.id);
		setIsEditing(true);
		setError("");
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("¿Eliminar este tema?")) return;
		setError("");
		try {
			await apiRequest(`/api/tema/${id}`, { method: "DELETE" });
			setTemas((prev) => prev.filter((t) => t.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar el tema");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.procesoId) { setError("Selecciona un proceso"); return; }
		if (!form.codigo.trim()) { setError("El código es obligatorio"); return; }
		setSaving(true);
		setError("");
		try {
			const payload = {
				proceso:        { id: Number(form.procesoId) },
				codigo:         form.codigo.trim().toUpperCase(),
				descripcion:    form.descripcion.trim() || null,
				totalPreguntas: Number(form.totalPreguntas) || 100,
				activo:         form.activo,
			};
			if (isEditing) {
				await apiRequest(`/api/tema/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/tema", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowModal(false);
			await loadTemas();
		} catch (err) {
			setError(err.message || "No se pudo guardar el tema");
		} finally {
			setSaving(false);
		}
	};

	const activos = temas.filter((t) => t.activo).length;

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="page-title mb-4 d-flex justify-content-between align-items-start">
						<div>
							<span className="eyebrow">Administración</span>
							<h1 className="display-6 fw-bold mb-2">Temas de examen</h1>
							<p className="text-light-emphasis mb-0">
								Gestiona los temas (versiones de examen) por proceso de admisión.
								Cada tema agrupa las claves de respuesta.
							</p>
						</div>
						<button
							className="dashboard-create-btn"
							onClick={openNew}
							disabled={procesos.length === 0}
							title={procesos.length === 0 ? "Crea primero un proceso de admisión" : ""}
						>
							<span className="dashboard-create-btn__icon">
								<i className="bi bi-plus-lg"></i>
							</span>
							<span className="dashboard-create-btn__text">
								<span className="dashboard-create-btn__label">Nuevo tema</span>
								<span className="dashboard-create-btn__hint">Crear examen</span>
							</span>
						</button>
					</div>

					<div className="row g-3 mb-4">
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Total temas</p>
								<h2 className="metric-value mb-0">{temas.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Activos</p>
								<h2 className="metric-value mb-0" style={{ color: "#22c55e" }}>{activos}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Procesos con temas</p>
								<h2 className="metric-value mb-0">
									{new Set(temas.map((t) => t.proceso?.id).filter(Boolean)).size}
								</h2>
							</div>
						</div>
					</div>

					{error && <div className="alert alert-danger mb-4">{error}</div>}

					{procesos.length === 0 && !loading && (
						<div className="glass-card p-4 mb-4">
							<p className="text-light-emphasis mb-0">
								<i className="bi bi-info-circle me-2"></i>
								No hay procesos de admisión registrados. Ve a{" "}
								<strong style={{ color: "#cbd5e1" }}>Procesos</strong> para crear uno primero.
							</p>
						</div>
					)}

					<div className="glass-card p-0">
						<div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
							<label style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>
								Filtrar por proceso:
							</label>
							<select
								className="form-select form-select-sm"
								style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 340 }}
								value={filtroProceso}
								onChange={(e) => setFiltroProceso(e.target.value)}
							>
								<option value="__TODOS__">— Todos los procesos —</option>
								{procesos.map((p) => (
									<option key={p.id} value={p.id}>
										{p.codigo} — {p.periodo} {p.anio}
									</option>
								))}
							</select>
							<span style={{ color: "#64748b", fontSize: "0.82rem" }}>
								{temasFiltrados.length} tema(s)
							</span>
						</div>

						<div className="table-responsive">
							<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
								<thead>
									<tr>
										<th>Código</th>
										<th>Proceso</th>
										<th>Descripción</th>
										<th style={{ textAlign: "center" }}>Preguntas</th>
										<th style={{ textAlign: "center" }}>Estado</th>
										<th style={{ width: 90 }}></th>
									</tr>
								</thead>
								<tbody>
									{loading && (
										<tr><td colSpan="6" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
									)}
									{!loading && temasFiltrados.length === 0 && (
										<tr>
											<td colSpan="6" className="text-center text-light-emphasis py-4">
												{temas.length === 0
													? "No hay temas registrados."
													: "No hay temas para el proceso seleccionado."}
											</td>
										</tr>
									)}
									{!loading && temasFiltrados.map((t) => (
										<tr key={t.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
											<td>
												<code style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{t.codigo}</code>
											</td>
											<td style={{ fontSize: "0.82rem", color: "#64748b" }}>
												{t.proceso?.codigo
													? <span><span style={{ color: "#94a3b8" }}>{t.proceso.codigo}</span> · {t.proceso.periodo} {t.proceso.anio}</span>
													: "—"}
											</td>
											<td style={{ fontSize: "0.83rem", color: "#94a3b8" }}>
												{t.descripcion || <span style={{ color: "#475569" }}>—</span>}
											</td>
											<td style={{ textAlign: "center", fontFamily: "monospace" }}>{t.totalPreguntas}</td>
											<td style={{ textAlign: "center" }}>
												<span className={`status-pill ${t.activo ? "status-success" : "status-danger"}`} style={{ fontSize: "0.72rem" }}>
													{t.activo ? "Activo" : "Inactivo"}
												</span>
											</td>
											<td>
												<button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(t)} title="Editar">
													<i className="bi bi-pencil"></i>
												</button>
												<button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)} title="Eliminar">
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
										{isEditing ? "Editar tema" : "Nuevo tema de examen"}
									</h5>
									<button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
								</div>
								<form onSubmit={handleSubmit}>
									<div className="modal-body px-4 py-4">
										<div className="mb-3">
											<label className="form-label">Proceso de admisión</label>
											<select
												className="form-select"
												value={form.procesoId}
												onChange={(e) => setForm({ ...form, procesoId: e.target.value })}
												required
											>
												<option value="">— Seleccionar proceso —</option>
												{procesos.map((p) => (
													<option key={p.id} value={p.id}>
														{p.codigo} — {p.periodo} {p.anio}
													</option>
												))}
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Código del tema</label>
											<input
												type="text"
												className="form-control"
												value={form.codigo}
												onChange={(e) => setForm({ ...form, codigo: e.target.value })}
												placeholder="Ej: A, B, C o T01"
												maxLength={5}
												required
											/>
										</div>
										<div className="mb-3">
											<label className="form-label">
												Descripción <span style={{ color: "#64748b", fontWeight: 400 }}>(opcional)</span>
											</label>
											<input
												type="text"
												className="form-control"
												value={form.descripcion}
												onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
												placeholder="Ej: Tema A — Ciencias"
												maxLength={100}
											/>
										</div>
										<div className="row g-3">
											<div className="col-6">
												<label className="form-label">Total preguntas</label>
												<input
													type="number"
													className="form-control"
													value={form.totalPreguntas}
													onChange={(e) => setForm({ ...form, totalPreguntas: e.target.value })}
													min={1}
													max={200}
													required
												/>
											</div>
											<div className="col-6">
												<label className="form-label">Estado</label>
												<select
													className="form-select"
													value={String(form.activo)}
													onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}
												>
													<option value="true">Activo</option>
													<option value="false">Inactivo</option>
												</select>
											</div>
										</div>
										{error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={() => setShowModal(false)}
											style={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,0.2)" }}
										>
											Cancelar
										</button>
										<button
											type="submit"
											className="btn btn-success"
											disabled={saving}
											style={{ background: "#22c55e", borderColor: "#22c55e" }}
										>
											{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear tema"}
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
