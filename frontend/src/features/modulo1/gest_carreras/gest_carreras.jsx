import { useEffect, useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const emptyCarrera = { codigo: "", nombre: "", facultadId: "", activo: true };
const emptyFacultad = { codigo: "", nombre: "", activo: true };

const modalStyles = `
	.custom-modal-backdrop {
		background: rgba(0, 0, 0, 0.64) !important;
		backdrop-filter: blur(8px);
	}
	.custom-modal-content {
		background: rgba(7, 12, 22, 0.95) !important;
		border: 1px solid rgba(148, 163, 184, 0.12) !important;
		border-radius: 28px !important;
	}
	.custom-modal-header {
		border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
		color: #f8fafc !important;
	}
	.custom-modal-footer {
		border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
	}
	.form-label {
		color: #cbd5e1 !important;
		font-weight: 600;
		font-size: 0.92rem;
	}
	.form-control, .form-select {
		background: rgba(255, 255, 255, 0.04) !important;
		border: 1px solid rgba(148, 163, 184, 0.12) !important;
		color: #f8fafc !important;
	}
	.form-control::placeholder {
		color: rgba(203, 213, 225, 0.5) !important;
	}
	.form-control:focus, .form-select:focus {
		background: rgba(255, 255, 255, 0.06) !important;
		border-color: rgba(134, 239, 172, 0.24) !important;
		box-shadow: 0 0 0 0.25rem rgba(34, 197, 94, 0.15) !important;
		color: #f8fafc !important;
	}
	.form-select option {
		background: #0f172a;
		color: #f8fafc;
	}
`;

export default function GestCarreras() {
	const [facultades, setFacultades] = useState([]);
	const [carreras, setCarreras] = useState([]);
	const [loadingF, setLoadingF] = useState(true);
	const [loadingC, setLoadingC] = useState(true);
	const [error, setError] = useState("");

	const [showFacultadModal, setShowFacultadModal] = useState(false);
	const [isEditingFacultad, setIsEditingFacultad] = useState(false);
	const [editingFacultadId, setEditingFacultadId] = useState(null);
	const [formFacultad, setFormFacultad] = useState(emptyFacultad);
	const [savingFacultad, setSavingFacultad] = useState(false);

	const [showCarreraModal, setShowCarreraModal] = useState(false);
	const [isEditingCarrera, setIsEditingCarrera] = useState(false);
	const [editingCarreraId, setEditingCarreraId] = useState(null);
	const [formCarrera, setFormCarrera] = useState(emptyCarrera);
	const [savingCarrera, setSavingCarrera] = useState(false);

	const loadFacultades = async () => {
		setLoadingF(true);
		try {
			const data = await apiRequest("/api/facultad");
			setFacultades(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar facultades");
		} finally {
			setLoadingF(false);
		}
	};

	const loadCarreras = async () => {
		setLoadingC(true);
		try {
			const data = await apiRequest("/api/carrera");
			setCarreras(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar carreras");
		} finally {
			setLoadingC(false);
		}
	};

	useEffect(() => {
		loadFacultades();
		loadCarreras();
	}, []);

	// --- Facultad handlers ---

	const handleNewFacultad = () => {
		setFormFacultad(emptyFacultad);
		setIsEditingFacultad(false);
		setEditingFacultadId(null);
		setError("");
		setShowFacultadModal(true);
	};

	const handleEditFacultad = (f) => {
		setFormFacultad({ codigo: f.codigo, nombre: f.nombre, activo: f.activo });
		setEditingFacultadId(f.id);
		setIsEditingFacultad(true);
		setError("");
		setShowFacultadModal(true);
	};

	const handleDeleteFacultad = async (id) => {
		if (!window.confirm("¿Eliminar esta facultad? Las carreras asociadas también pueden verse afectadas.")) return;
		setError("");
		try {
			await apiRequest(`/api/facultad/${id}`, { method: "DELETE" });
			setFacultades((prev) => prev.filter((f) => f.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar la facultad");
		}
	};

	const handleSubmitFacultad = async (e) => {
		e.preventDefault();
		if (!formFacultad.codigo.trim() || !formFacultad.nombre.trim()) {
			setError("Código y nombre son obligatorios");
			return;
		}
		setSavingFacultad(true);
		setError("");
		try {
			const payload = {
				codigo: formFacultad.codigo.trim().toUpperCase(),
				nombre: formFacultad.nombre.trim(),
				activo: formFacultad.activo,
			};
			if (isEditingFacultad) {
				await apiRequest(`/api/facultad/${editingFacultadId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/facultad", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowFacultadModal(false);
			await loadFacultades();
		} catch (err) {
			setError(err.message || "No se pudo guardar la facultad");
		} finally {
			setSavingFacultad(false);
		}
	};

	// --- Carrera handlers ---

	const handleNewCarrera = () => {
		setFormCarrera({ ...emptyCarrera, facultadId: facultades[0]?.id ?? "" });
		setIsEditingCarrera(false);
		setEditingCarreraId(null);
		setError("");
		setShowCarreraModal(true);
	};

	const handleEditCarrera = (c) => {
		setFormCarrera({
			codigo: c.codigo,
			nombre: c.nombre,
			facultadId: c.facultad?.id ?? "",
			activo: c.activo,
		});
		setEditingCarreraId(c.id);
		setIsEditingCarrera(true);
		setError("");
		setShowCarreraModal(true);
	};

	const handleDeleteCarrera = async (id) => {
		if (!window.confirm("¿Eliminar esta carrera?")) return;
		setError("");
		try {
			await apiRequest(`/api/carrera/${id}`, { method: "DELETE" });
			setCarreras((prev) => prev.filter((c) => c.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar la carrera");
		}
	};

	const handleSubmitCarrera = async (e) => {
		e.preventDefault();
		if (!formCarrera.facultadId) { setError("Selecciona una facultad"); return; }
		if (!formCarrera.codigo.trim() || !formCarrera.nombre.trim()) { setError("Código y nombre son obligatorios"); return; }
		setSavingCarrera(true);
		setError("");
		try {
			const payload = {
				codigo: formCarrera.codigo.trim().toUpperCase(),
				nombre: formCarrera.nombre.trim(),
				activo: formCarrera.activo,
				facultad: { id: Number(formCarrera.facultadId) },
			};
			if (isEditingCarrera) {
				await apiRequest(`/api/carrera/${editingCarreraId}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				await apiRequest("/api/carrera", { method: "POST", body: JSON.stringify(payload) });
			}
			setShowCarreraModal(false);
			await loadCarreras();
		} catch (err) {
			setError(err.message || "No se pudo guardar la carrera");
		} finally {
			setSavingCarrera(false);
		}
	};

	const carrerasActivas = carreras.filter((c) => c.activo).length;

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="page-title mb-4">
						<span className="eyebrow">Módulo 1</span>
						<h1 className="display-6 fw-bold mb-2">Gestión de carreras</h1>
						<p className="text-light-emphasis mb-0">
							Administra las facultades y carreras del proceso de admisión. Las carreras registradas aquí
							se usarán en la asignación de plazas y exportación de resultados.
						</p>
					</div>

					<div className="row g-3 mb-4">
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Facultades</p>
								<h2 className="metric-value mb-0">{facultades.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Carreras totales</p>
								<h2 className="metric-value mb-0">{carreras.length}</h2>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="glass-card p-4">
								<p className="metric-label mb-1">Carreras activas</p>
								<h2 className="metric-value mb-0">{carrerasActivas}</h2>
							</div>
						</div>
					</div>

					{error && (
						<div className="alert alert-danger mb-4" role="alert">
							{error}
						</div>
					)}

					<div className="row g-4">
						{/* FACULTADES */}
						<div className="col-lg-4">
							<div className="glass-card p-4 h-100">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h2 className="h5 mb-0">Facultades</h2>
									<button className="btn btn-glass btn-sm" onClick={handleNewFacultad}>
										<i className="bi bi-plus-lg me-1"></i>Nueva
									</button>
								</div>
								<div className="table-responsive">
									<table className="table table-dark table-borderless align-middle dashboard-table mb-0" style={{ fontSize: "0.85rem" }}>
										<thead>
											<tr>
												<th>Código</th>
												<th>Nombre</th>
												<th style={{ textAlign: "center" }}>Estado</th>
												<th style={{ width: 72 }}></th>
											</tr>
										</thead>
										<tbody>
											{loadingF && (
												<tr><td colSpan="4" className="text-center text-light-emphasis py-3">Cargando...</td></tr>
											)}
											{!loadingF && facultades.length === 0 && (
												<tr><td colSpan="4" className="text-center text-light-emphasis py-3">Sin facultades registradas.</td></tr>
											)}
											{!loadingF && facultades.map((f) => (
												<tr key={f.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
													<td><code style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{f.codigo}</code></td>
													<td>{f.nombre}</td>
													<td style={{ textAlign: "center" }}>
														<span className={`status-pill ${f.activo ? "status-success" : "status-danger"}`} style={{ fontSize: "0.7rem" }}>
															{f.activo ? "Activa" : "Inactiva"}
														</span>
													</td>
													<td>
														<button className="btn btn-sm btn-warning me-1" onClick={() => handleEditFacultad(f)} title="Editar">
															<i className="bi bi-pencil"></i>
														</button>
														<button className="btn btn-sm btn-danger" onClick={() => handleDeleteFacultad(f.id)} title="Eliminar">
															<i className="bi bi-trash"></i>
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>

						{/* CARRERAS */}
						<div className="col-lg-8">
							<div className="glass-card p-4 h-100">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h2 className="h5 mb-0">Carreras <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.9rem" }}>({carreras.length})</span></h2>
									<button
										className="btn btn-glass btn-sm"
										onClick={handleNewCarrera}
										disabled={facultades.length === 0}
										title={facultades.length === 0 ? "Crea primero una facultad" : ""}
									>
										<i className="bi bi-plus-lg me-1"></i>Nueva
									</button>
								</div>
								{!loadingF && facultades.length === 0 && (
									<p className="text-light-emphasis mb-3" style={{ fontSize: "0.85rem" }}>
										<i className="bi bi-info-circle me-1"></i>
										Primero crea al menos una facultad para poder registrar carreras.
									</p>
								)}
								<div className="table-responsive">
									<table className="table table-dark table-borderless align-middle dashboard-table mb-0" style={{ fontSize: "0.85rem" }}>
										<thead>
											<tr>
												<th>Código</th>
												<th>Nombre</th>
												<th>Facultad</th>
												<th style={{ textAlign: "center" }}>Estado</th>
												<th style={{ width: 80 }}></th>
											</tr>
										</thead>
										<tbody>
											{loadingC && (
												<tr><td colSpan="5" className="text-center text-light-emphasis py-3">Cargando...</td></tr>
											)}
											{!loadingC && carreras.length === 0 && (
												<tr><td colSpan="5" className="text-center text-light-emphasis py-3">Sin carreras registradas.</td></tr>
											)}
											{!loadingC && carreras.map((c) => (
												<tr key={c.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
													<td><code style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{c.codigo}</code></td>
													<td><strong>{c.nombre}</strong></td>
													<td style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{c.facultad?.nombre || "—"}</td>
													<td style={{ textAlign: "center" }}>
														<span className={`status-pill ${c.activo ? "status-success" : "status-danger"}`} style={{ fontSize: "0.7rem" }}>
															{c.activo ? "Activa" : "Inactiva"}
														</span>
													</td>
													<td>
														<button className="btn btn-sm btn-warning me-1" onClick={() => handleEditCarrera(c)} title="Editar">
															<i className="bi bi-pencil"></i>
														</button>
														<button className="btn btn-sm btn-danger" onClick={() => handleDeleteCarrera(c.id)} title="Eliminar">
															<i className="bi bi-trash"></i>
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</main>

				{/* MODAL FACULTAD */}
				{showFacultadModal && (
					<div className="modal d-block custom-modal-backdrop">
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content custom-modal-content">
								<div className="modal-header custom-modal-header border-0 pb-3">
									<h5 className="modal-title fw-bold">{isEditingFacultad ? "Editar facultad" : "Nueva facultad"}</h5>
									<button type="button" className="btn-close btn-close-white" onClick={() => setShowFacultadModal(false)}></button>
								</div>
								<form onSubmit={handleSubmitFacultad}>
									<div className="modal-body px-4 py-4">
										<div className="mb-3">
											<label className="form-label">Código</label>
											<input
												type="text"
												className="form-control"
												value={formFacultad.codigo}
												onChange={(e) => setFormFacultad({ ...formFacultad, codigo: e.target.value })}
												placeholder="Ej: FCIS"
												maxLength={10}
												required
											/>
										</div>
										<div className="mb-3">
											<label className="form-label">Nombre</label>
											<input
												type="text"
												className="form-control"
												value={formFacultad.nombre}
												onChange={(e) => setFormFacultad({ ...formFacultad, nombre: e.target.value })}
												placeholder="Nombre completo de la facultad"
												maxLength={150}
												required
											/>
										</div>
										<div className="mb-0">
											<label className="form-label">Estado</label>
											<select
												className="form-select"
												value={String(formFacultad.activo)}
												onChange={(e) => setFormFacultad({ ...formFacultad, activo: e.target.value === "true" })}
											>
												<option value="true">Activa</option>
												<option value="false">Inactiva</option>
											</select>
										</div>
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button type="button" className="btn btn-outline-secondary" onClick={() => setShowFacultadModal(false)} style={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,0.2)" }}>
											Cancelar
										</button>
										<button type="submit" className="btn btn-success" disabled={savingFacultad} style={{ background: "#22c55e", borderColor: "#22c55e" }}>
											{savingFacultad ? "Guardando..." : isEditingFacultad ? "Guardar cambios" : "Crear facultad"}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{/* MODAL CARRERA */}
				{showCarreraModal && (
					<div className="modal d-block custom-modal-backdrop">
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content custom-modal-content">
								<div className="modal-header custom-modal-header border-0 pb-3">
									<h5 className="modal-title fw-bold">{isEditingCarrera ? "Editar carrera" : "Nueva carrera"}</h5>
									<button type="button" className="btn-close btn-close-white" onClick={() => setShowCarreraModal(false)}></button>
								</div>
								<form onSubmit={handleSubmitCarrera}>
									<div className="modal-body px-4 py-4">
										<div className="mb-3">
											<label className="form-label">Facultad</label>
											<select
												className="form-select"
												value={formCarrera.facultadId}
												onChange={(e) => setFormCarrera({ ...formCarrera, facultadId: e.target.value })}
												required
											>
												<option value="">— Seleccionar facultad —</option>
												{facultades.map((f) => (
													<option key={f.id} value={f.id}>{f.nombre}</option>
												))}
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Código</label>
											<input
												type="text"
												className="form-control"
												value={formCarrera.codigo}
												onChange={(e) => setFormCarrera({ ...formCarrera, codigo: e.target.value })}
												placeholder="Ej: IS101"
												maxLength={10}
												required
											/>
										</div>
										<div className="mb-3">
											<label className="form-label">Nombre</label>
											<input
												type="text"
												className="form-control"
												value={formCarrera.nombre}
												onChange={(e) => setFormCarrera({ ...formCarrera, nombre: e.target.value })}
												placeholder="Nombre completo de la carrera"
												maxLength={150}
												required
											/>
										</div>
										<div className="mb-0">
											<label className="form-label">Estado</label>
											<select
												className="form-select"
												value={String(formCarrera.activo)}
												onChange={(e) => setFormCarrera({ ...formCarrera, activo: e.target.value === "true" })}
											>
												<option value="true">Activa</option>
												<option value="false">Inactiva</option>
											</select>
										</div>
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button type="button" className="btn btn-outline-secondary" onClick={() => setShowCarreraModal(false)} style={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,0.2)" }}>
											Cancelar
										</button>
										<button type="submit" className="btn btn-success" disabled={savingCarrera} style={{ background: "#22c55e", borderColor: "#22c55e" }}>
											{savingCarrera ? "Guardando..." : isEditingCarrera ? "Guardar cambios" : "Crear carrera"}
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
