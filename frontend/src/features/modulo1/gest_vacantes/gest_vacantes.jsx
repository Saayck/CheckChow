import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";
import { readFirstSheetRows } from "../../../utils/excel";
import { upsertOfficialImport } from "../../../utils/admissionImport";

const empty = { procesoId: "", carreraId: "", vacantes: 1, permiteAmpliacion: true };

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

export default function GestVacantes() {
	const [procesos, setProcesos] = useState([]);
	const [carreras, setCarreras] = useState([]);
	const [vacantes, setVacantes] = useState([]);
	const [filtroProceso, setFiltroProceso] = useState("__TODOS__");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(empty);
	const [saving, setSaving] = useState(false);
	const [importing, setImporting] = useState(false);
	const [importMessage, setImportMessage] = useState("");

	const loadVacantes = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/vacante");
			setVacantes(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar vacantes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		apiRequest("/api/proceso-admision").then(d => setProcesos(d || [])).catch(() => {});
		apiRequest("/api/carrera").then(d => setCarreras((d || []).filter(c => c.activo))).catch(() => {});
		loadVacantes();
	}, []);

	const vacantesFiltradas = useMemo(() => {
		if (filtroProceso === "__TODOS__") return vacantes;
		return vacantes.filter(v => String(v.proceso?.id) === filtroProceso);
	}, [vacantes, filtroProceso]);

	const openNew = () => {
		setForm({ ...empty, procesoId: procesos[0]?.id ?? "" });
		setIsEditing(false);
		setEditingId(null);
		setError("");
		setShowModal(true);
	};

	const openEdit = (v) => {
		setForm({
			procesoId:         v.proceso?.id ?? "",
			carreraId:         v.carrera?.id ?? "",
			vacantes:          v.vacantes ?? 1,
			permiteAmpliacion: v.permiteAmpliacion ?? true,
		});
		setEditingId(v.id);
		setIsEditing(true);
		setError("");
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("¿Eliminar esta asignación de vacantes?")) return;
		setError("");
		try {
			await apiRequest(`/api/vacante/${id}`, { method: "DELETE" });
			setVacantes(prev => prev.filter(v => v.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.procesoId) { setError("Selecciona un proceso"); return; }
		if (!form.carreraId) { setError("Selecciona una carrera"); return; }
		setSaving(true);
		setError("");
		try {
			const payload = {
				proceso:           { id: Number(form.procesoId) },
				carrera:           { id: Number(form.carreraId) },
				vacantes:          Number(form.vacantes) || 1,
				permiteAmpliacion: form.permiteAmpliacion,
			};
			if (isEditing) {
				await apiRequest(`/api/vacante/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/vacante", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowModal(false);
			await loadVacantes();
		} catch (err) {
			setError(err.message || "No se pudo guardar");
		} finally {
			setSaving(false);
		}
	};

	const procesoImportacion = filtroProceso !== "__TODOS__" ? filtroProceso : String(procesos[0]?.id || "");

	const handleExcelImport = async (file) => {
		if (!file) return;
		if (!procesoImportacion) {
			setImportMessage("Selecciona un proceso para importar vacantes.");
			return;
		}
		setImporting(true);
		setImportMessage("Importando vacantes desde Excel...");
		try {
			const rows = await readFirstSheetRows(file);
			const resultados = rows
				.map((row) => {
					const carrera = row.CARRERA || row.Carrera || row.carrera || row.ESCUELA || row.Escuela || row.PROGRAMA || row.Programa;
					const facultad = row.FACULTAD || row.Facultad || row.facultad || "";
					const vacantes = row.VACANTES || row.Vacantes || row.vacantes || row.PLAZAS || row.Plazas || row.plazas;
					const numero = Number(vacantes);
					if (!carrera || !Number.isFinite(numero) || numero <= 0) return null;
					return { carrera: String(carrera).trim(), facultad: String(facultad || "SIN FACULTAD").trim(), condicion: "INGRESO", vacantesPdf: numero };
				})
				.filter(Boolean);
			if (!resultados.length) {
				setImportMessage("No se encontraron columnas Carrera y Vacantes en el Excel.");
				return;
			}
			const result = await upsertOfficialImport({ resultados, metadata: {}, procesoId: procesoImportacion });
			setImportMessage(`Excel importado: ${result.vacantesGuardadas} vacante(s) guardada(s).`);
			await Promise.all([
				apiRequest("/api/carrera").then(d => setCarreras((d || []).filter(c => c.activo))).catch(() => {}),
				loadVacantes(),
			]);
		} catch (err) {
			setImportMessage(err.message || "No se pudo importar el Excel.");
		} finally {
			setImporting(false);
		}
	};

	const totalVacantes = vacantesFiltradas.reduce((sum, v) => sum + (v.vacantes || 0), 0);

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="page-title mb-4 d-flex justify-content-between align-items-start">
						<div>
							<span className="eyebrow">Administración</span>
							<h1 className="display-6 fw-bold mb-2">Vacantes por proceso</h1>
							<p className="text-light-emphasis mb-0">
								Asigna el número de vacantes por carrera y proceso de admisión.
							</p>
						</div>
						<button
							className="btn btn-glass"
							onClick={openNew}
							disabled={procesos.length === 0 || carreras.length === 0}
						>
							<i className="bi bi-plus-lg me-1"></i>Nueva vacante
						</button>
						<label className={`btn btn-glass ms-2 ${!procesoImportacion || importing ? "disabled" : ""}`} style={{ cursor: procesoImportacion && !importing ? "pointer" : "default" }}>
							<i className="bi bi-file-earmark-excel me-1"></i>{importing ? "Importando..." : "Importar Excel"}
							<input type="file" accept=".xlsx" disabled={!procesoImportacion || importing} onChange={(e) => handleExcelImport(e.target.files?.[0])} style={{ display: "none" }} />
						</label>
					</div>

					<div className="row g-3 mb-4">
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Asignaciones</p>
								<h2 className="metric-value mb-0">{vacantesFiltradas.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Total vacantes</p>
								<h2 className="metric-value mb-0" style={{ color: "#22c55e" }}>{totalVacantes}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Con ampliación</p>
								<h2 className="metric-value mb-0" style={{ color: "#eab308" }}>
									{vacantesFiltradas.filter(v => v.permiteAmpliacion).length}
								</h2>
							</div>
						</div>
					</div>

					{error && <div className="alert alert-danger mb-4">{error}</div>}
					{importMessage && <div className="alert alert-info mb-4">{importMessage}</div>}

					<div className="glass-card p-0">
						<div className="d-flex align-items-center gap-3 px-4 py-3"
							style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
							<label style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>
								Filtrar por proceso:
							</label>
							<select
								className="form-select form-select-sm"
								style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 340 }}
								value={filtroProceso}
								onChange={e => setFiltroProceso(e.target.value)}
							>
								<option value="__TODOS__">— Todos los procesos —</option>
								{procesos.map(p => (
									<option key={p.id} value={p.id}>{p.codigo} — {p.periodo} {p.anio}</option>
								))}
							</select>
							<span style={{ color: "#64748b", fontSize: "0.82rem" }}>{vacantesFiltradas.length} registro(s)</span>
						</div>

						<div className="table-responsive">
							<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
								<thead>
									<tr>
										<th>Proceso</th>
										<th>Carrera</th>
										<th style={{ textAlign: "center" }}>Vacantes</th>
										<th style={{ textAlign: "center" }}>Ampliación</th>
										<th style={{ width: 90 }}></th>
									</tr>
								</thead>
								<tbody>
									{loading && (
										<tr><td colSpan="5" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
									)}
									{!loading && vacantesFiltradas.length === 0 && (
										<tr>
											<td colSpan="5" className="text-center text-light-emphasis py-4">
												No hay vacantes registradas para el filtro seleccionado.
											</td>
										</tr>
									)}
									{!loading && vacantesFiltradas.map(v => (
										<tr key={v.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
											<td style={{ fontSize: "0.82rem", color: "#64748b" }}>
												<span style={{ color: "#94a3b8" }}>{v.proceso?.codigo}</span>
												{" · "}{v.proceso?.periodo} {v.proceso?.anio}
											</td>
											<td>
												<span style={{ color: "#cbd5e1" }}>{v.carrera?.nombre || "—"}</span>
												{v.carrera?.codigo && (
													<code style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: 6 }}>
														{v.carrera.codigo}
													</code>
												)}
											</td>
											<td style={{ textAlign: "center", fontFamily: "monospace", color: "#22c55e", fontWeight: 700 }}>
												{v.vacantes}
											</td>
											<td style={{ textAlign: "center" }}>
												<span className={`status-pill ${v.permiteAmpliacion ? "status-success" : "status-danger"}`}
													style={{ fontSize: "0.72rem" }}>
													{v.permiteAmpliacion ? "Sí" : "No"}
												</span>
											</td>
											<td>
												<button className="btn btn-sm btn-warning me-1" onClick={() => openEdit(v)} title="Editar">
													<i className="bi bi-pencil"></i>
												</button>
												<button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)} title="Eliminar">
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
										{isEditing ? "Editar vacante" : "Nueva asignación de vacantes"}
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
											<label className="form-label">Carrera</label>
											<select className="form-select" value={form.carreraId}
												onChange={e => setForm({ ...form, carreraId: e.target.value })} required>
												<option value="">— Seleccionar carrera —</option>
												{carreras.map(c => (
													<option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
												))}
											</select>
										</div>
										<div className="row g-3">
											<div className="col-6">
												<label className="form-label">N.° vacantes</label>
												<input type="number" className="form-control" value={form.vacantes}
													onChange={e => setForm({ ...form, vacantes: e.target.value })}
													min={1} max={9999} required />
											</div>
											<div className="col-6">
												<label className="form-label">Permite ampliación</label>
												<select className="form-select" value={String(form.permiteAmpliacion)}
													onChange={e => setForm({ ...form, permiteAmpliacion: e.target.value === "true" })}>
													<option value="true">Sí</option>
													<option value="false">No</option>
												</select>
											</div>
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
											{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear vacante"}
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
