import { useEffect, useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const ESTADOS = ["CONFIGURACION", "EN_CURSO", "LECTURA_OMR", "CALIFICANDO", "PUBLICADO", "CERRADO"];

const estadoColor = {
	CONFIGURACION: { pill: "status-info",    label: "Configuración" },
	EN_CURSO:      { pill: "status-warning",  label: "En curso"      },
	LECTURA_OMR:   { pill: "status-warning",  label: "Lectura OMR"   },
	CALIFICANDO:   { pill: "status-info",     label: "Calificando"   },
	PUBLICADO:     { pill: "status-success",  label: "Publicado"     },
	CERRADO:       { pill: "status-danger",   label: "Cerrado"       },
};

const empty = {
	codigo: "", anio: new Date().getFullYear(), periodo: "", descripcion: "",
	tipoProcesoAdmision: "", fechaExamen: "", estado: "CONFIGURACION",
};

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
	.status-info { background: rgba(99,179,237,0.15); color: #63b3ed; border: 1px solid rgba(99,179,237,0.25); border-radius: 20px; padding: 2px 10px; font-size: 0.72rem; font-weight: 600; }
`;

export default function GestProcesos() {
	const [procesos, setProcesos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(empty);
	const [saving, setSaving] = useState(false);

	const load = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/proceso-admision");
			setProcesos(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar procesos");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const openNew = () => {
		setForm(empty);
		setIsEditing(false);
		setEditingId(null);
		setError("");
		setShowModal(true);
	};

	const openEdit = (p) => {
		setForm({
			codigo:      p.codigo || "",
			anio:        p.anio || new Date().getFullYear(),
			periodo:     p.periodo || "",
			descripcion: p.description || "",
			tipoProcesoAdmision: p.tipoProcesoAdmision || "",
			fechaExamen: p.fechaExamen || "",
			estado:      p.estado || "CONFIGURACION",
		});
		setEditingId(p.id);
		setIsEditing(true);
		setError("");
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("¿Eliminar este proceso de admisión?")) return;
		setError("");
		try {
			await apiRequest(`/api/proceso-admision/${id}`, { method: "DELETE" });
			setProcesos((prev) => prev.filter((p) => p.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.codigo.trim() || !form.periodo.trim() || !form.fechaExamen) {
			setError("Código, período y fecha de examen son obligatorios");
			return;
		}
		setSaving(true);
		setError("");
		try {
			const payload = {
				codigo:      form.codigo.trim().toUpperCase(),
				anio:        Number(form.anio),
				periodo:     form.periodo.trim(),
				description: form.descripcion.trim() || null,
				tipoProcesoAdmision: form.tipoProcesoAdmision.trim() || null,
				fechaExamen: form.fechaExamen,
				estado:      form.estado,
			};
			if (isEditing) {
				await apiRequest(`/api/proceso-admision/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/proceso-admision", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowModal(false);
			await load();
		} catch (err) {
			setError(err.message || "No se pudo guardar");
		} finally {
			setSaving(false);
		}
	};

	const activos  = procesos.filter((p) => p.estado === "EN_CURSO" || p.estado === "LECTURA_OMR" || p.estado === "CALIFICANDO").length;
	const cerrados = procesos.filter((p) => p.estado === "CERRADO").length;

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="page-title mb-4 d-flex justify-content-between align-items-start">
						<div>
							<span className="eyebrow">Administración</span>
							<h1 className="display-6 fw-bold mb-2">Procesos de Admisión</h1>
							<p className="text-light-emphasis mb-0">
								Gestiona los procesos de admisión. Cada proceso agrupa temas, claves de respuesta, inscripciones y vacantes.
							</p>
						</div>
						<button className="dashboard-create-btn" onClick={openNew}>
							<span className="dashboard-create-btn__icon">
								<i className="bi bi-plus-lg"></i>
							</span>
							<span className="dashboard-create-btn__text">
								<span className="dashboard-create-btn__label">Nuevo proceso</span>
								<span className="dashboard-create-btn__hint">Crear admisión</span>
							</span>
						</button>
					</div>

					<div className="row g-3 mb-4">
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Total procesos</p>
								<h2 className="metric-value mb-0">{procesos.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">En ejecución</p>
								<h2 className="metric-value mb-0" style={{ color: "#eab308" }}>{activos}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Cerrados</p>
								<h2 className="metric-value mb-0" style={{ color: "#64748b" }}>{cerrados}</h2>
							</div>
						</div>
					</div>

					{error && <div className="alert alert-danger mb-4">{error}</div>}

					<div className="glass-card p-0">
						<div className="table-responsive">
							<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
								<thead>
									<tr>
										<th>Código</th>
										<th style={{ textAlign: "center" }}>Año</th>
										<th>Período</th>
										<th>Fecha examen</th>
										<th>Tipo proceso</th>
										<th>Descripción</th>
										<th style={{ textAlign: "center" }}>Estado</th>
										<th style={{ width: 100 }}></th>
									</tr>
								</thead>
								<tbody>
									{loading && (
										<tr><td colSpan="7" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
									)}
									{!loading && procesos.length === 0 && (
										<tr><td colSpan="7" className="text-center text-light-emphasis py-4">No hay procesos registrados.</td></tr>
									)}
									{!loading && procesos.map((p) => {
										const est = estadoColor[p.estado] || { pill: "status-info", label: p.estado };
										return (
											<tr key={p.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
												<td><code style={{ color: "#94a3b8" }}>{p.codigo}</code></td>
												<td style={{ textAlign: "center", fontFamily: "monospace" }}>{p.anio}</td>
												<td><strong>{p.periodo}</strong></td>
												<td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#94a3b8" }}>{p.fechaExamen || "—"}</td>
												<td style={{ fontSize: "0.82rem", color: "#94a3b8", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
													{p.tipoProcesoAdmision || "—"}
												</td>
												<td style={{ fontSize: "0.82rem", color: "#64748b", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
													{p.description || "—"}
												</td>
												<td style={{ textAlign: "center" }}>
													<span className={`status-pill ${est.pill}`} style={{ fontSize: "0.72rem" }}>
														{est.label}
													</span>
												</td>
												<td>
													<button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(p)} title="Editar">
														<i className="bi bi-pencil"></i>
													</button>
													<button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)} title="Eliminar">
														<i className="bi bi-trash"></i>
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</main>

				{showModal && (
					<div className="modal d-block custom-modal-backdrop">
						<div className="modal-dialog modal-dialog-centered modal-lg">
							<div className="modal-content custom-modal-content">
								<div className="modal-header custom-modal-header border-0 pb-3">
									<h5 className="modal-title fw-bold">
										{isEditing ? "Editar proceso" : "Nuevo proceso de admisión"}
									</h5>
									<button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
								</div>
								<form onSubmit={handleSubmit}>
									<div className="modal-body px-4 py-4">
										<div className="row g-3">
											<div className="col-md-4">
												<label className="form-label">Código</label>
												<input type="text" className="form-control" value={form.codigo}
													onChange={(e) => setForm({ ...form, codigo: e.target.value })}
													placeholder="Ej: ADM-2026-I" maxLength={20} required />
											</div>
											<div className="col-md-3">
												<label className="form-label">Año</label>
												<input type="number" className="form-control" value={form.anio}
													onChange={(e) => setForm({ ...form, anio: e.target.value })}
													min={2000} max={2099} required />
											</div>
											<div className="col-md-5">
												<label className="form-label">Período</label>
												<input type="text" className="form-control" value={form.periodo}
													onChange={(e) => setForm({ ...form, periodo: e.target.value })}
													placeholder="Ej: 2026-I" maxLength={10} required />
											</div>
											<div className="col-md-6">
												<label className="form-label">Fecha de examen</label>
												<input type="date" className="form-control" value={form.fechaExamen}
													onChange={(e) => setForm({ ...form, fechaExamen: e.target.value })}
													required />
											</div>
											<div className="col-md-6">
												<label className="form-label">Estado</label>
												<select className="form-select" value={form.estado}
													onChange={(e) => setForm({ ...form, estado: e.target.value })}>
													{ESTADOS.map((s) => (
														<option key={s} value={s}>{estadoColor[s]?.label || s}</option>
													))}
												</select>
											</div>
											<div className="col-md-6">
												<label className="form-label">Tipo de proceso de admisión</label>
												<input type="text" className="form-control" value={form.tipoProcesoAdmision}
													onChange={(e) => setForm({ ...form, tipoProcesoAdmision: e.target.value })}
													placeholder="Ej: CEPU, Ordinario, Extraordinario" maxLength={80} />
											</div>
											<div className="col-md-6">
												<label className="form-label">Descripción <span style={{ color: "#64748b", fontWeight: 400 }}>(opcional)</span></label>
												<input type="text" className="form-control" value={form.descripcion}
													onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
													placeholder="Ej: Proceso de admisión ordinario 2026" maxLength={255} />
											</div>
										</div>
										{error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}
											style={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,0.2)" }}>
											Cancelar
										</button>
										<button type="submit" className="btn btn-success" disabled={saving}
											style={{ background: "#22c55e", borderColor: "#22c55e" }}>
											{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear proceso"}
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
