import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useState, useMemo } from "react";

const PLAZAS_KEY = "plazasData";
const OFFICIAL_KEY = "officialResultsData";

const getStored = (key, fallback) => {
	try { return JSON.parse(localStorage.getItem(key) || null) ?? fallback; } catch { return fallback; }
};

export const getPlazas = () => getStored(PLAZAS_KEY, {});

export default function Plazas() {
	const oficial = useMemo(() => getStored(OFFICIAL_KEY, []), []);
	const [plazas, setPlazas] = useState(() => getStored(PLAZAS_KEY, {}));
	const [saved, setSaved] = useState(false);

	const carreras = useMemo(() => {
		const set = new Set(oficial.map((r) => r.carrera).filter(Boolean));
		return [...set].sort();
	}, [oficial]);

	const statsCarrera = useMemo(() => {
		const map = {};
		oficial.forEach((r) => {
			if (!r.carrera) return;
			if (!map[r.carrera]) map[r.carrera] = { total: 0, ingreso: 0 };
			map[r.carrera].total++;
			if (r.condicion === "INGRESO") map[r.carrera].ingreso++;
		});
		return map;
	}, [oficial]);

	const handleChange = (carrera, value) => {
		const num = parseInt(value, 10);
		setSaved(false);
		setPlazas((prev) => ({ ...prev, [carrera]: isNaN(num) || num < 0 ? 0 : num }));
	};

	const handleSave = () => {
		localStorage.setItem(PLAZAS_KEY, JSON.stringify(plazas));
		setSaved(true);
	};

	const handleReset = () => {
		const empty = Object.fromEntries(carreras.map((c) => [c, 0]));
		setPlazas(empty);
		setSaved(false);
	};

	const totalPlazas = carreras.reduce((sum, c) => sum + (plazas[c] || 0), 0);
	const carrerasConPlaza = carreras.filter((c) => (plazas[c] || 0) > 0).length;

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Asignación de plazas</h1>
					<p className="text-light-emphasis mb-0">
						{carreras.length > 0
							? `${carreras.length} carrera(s) detectadas del PDF oficial. Define cuántas plazas disponibles tiene cada carrera.`
							: "Carga primero el PDF oficial en la sección Resultados Oficiales para ver las carreras disponibles."}
					</p>
				</div>

				<div className="row g-3 mb-4">
					<div className="col-sm-6 col-xl-3">
						<div className="glass-card p-4 h-100">
							<p className="metric-label mb-1">Carreras detectadas</p>
							<h2 className="metric-value mb-0">{carreras.length}</h2>
						</div>
					</div>
					<div className="col-sm-6 col-xl-3">
						<div className="glass-card p-4 h-100">
							<p className="metric-label mb-1">Total plazas asignadas</p>
							<h2 className="metric-value mb-0">{totalPlazas}</h2>
						</div>
					</div>
					<div className="col-sm-6 col-xl-3">
						<div className="glass-card p-4 h-100">
							<p className="metric-label mb-1">Postulantes en PDF</p>
							<h2 className="metric-value mb-0">{oficial.length}</h2>
						</div>
					</div>
					<div className="col-sm-6 col-xl-3">
						<div className="glass-card p-4 h-100">
							<p className="metric-label mb-1">Carreras con plaza</p>
							<h2 className="metric-value mb-0">{carrerasConPlaza} / {carreras.length}</h2>
						</div>
					</div>
				</div>

				{carreras.length === 0 ? (
					<div className="glass-card p-4">
						<p className="text-light-emphasis mb-2">No hay carreras disponibles todavía.</p>
						<p className="mb-0" style={{ fontSize: "0.88rem", color: "#64748b" }}>
							Ve a <strong style={{ color: "#cbd5e1" }}>PDF Oficial</strong> en el menú y carga el PDF de resultados para que las carreras aparezcan aquí automáticamente.
						</p>
					</div>
				) : (
					<>
						<div className="glass-card p-0 mb-4">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th style={{ width: 48 }}>#</th>
											<th>Carrera</th>
											<th style={{ textAlign: "right" }}>Postulantes</th>
											<th style={{ textAlign: "right" }}>Con INGRESO</th>
											<th style={{ textAlign: "center", width: 160 }}>Plazas disponibles</th>
											<th style={{ textAlign: "center", width: 120 }}>Estado</th>
										</tr>
									</thead>
									<tbody>
										{carreras.map((carrera, idx) => {
											const stats = statsCarrera[carrera] || { total: 0, ingreso: 0 };
											const plaza = plazas[carrera] || 0;
											const excede = plaza > 0 && stats.ingreso > plaza;
											const falta = plaza > 0 && stats.ingreso < plaza;
											const exacto = plaza > 0 && stats.ingreso === plaza;
											return (
												<tr key={carrera} style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
													<td style={{ color: "#64748b" }}>{idx + 1}</td>
													<td><strong>{carrera}</strong></td>
													<td style={{ textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>
														{stats.total}
													</td>
													<td style={{ textAlign: "right" }}>
														<span style={{ color: "#22c55e", fontFamily: "monospace" }}>{stats.ingreso}</span>
													</td>
													<td style={{ textAlign: "center" }}>
														<input
															type="number"
															min="0"
															className="form-control form-control-sm text-center"
															style={{
																background: "rgba(255,255,255,0.05)",
																border: "1px solid rgba(148,163,184,0.25)",
																color: "#f8fafc",
																width: 100,
																margin: "0 auto",
															}}
															value={plaza === 0 ? "" : plaza}
															placeholder="0"
															onChange={(e) => handleChange(carrera, e.target.value)}
														/>
													</td>
													<td style={{ textAlign: "center" }}>
														{plaza === 0 && (
															<span style={{ color: "#475569", fontSize: "0.78rem" }}>Sin asignar</span>
														)}
														{excede && (
															<span className="status-pill status-danger" style={{ fontSize: "0.72rem" }}>
																Excede +{stats.ingreso - plaza}
															</span>
														)}
														{falta && (
															<span className="status-pill status-warning" style={{ fontSize: "0.72rem" }}>
																Faltan {plaza - stats.ingreso}
															</span>
														)}
														{exacto && (
															<span className="status-pill status-success" style={{ fontSize: "0.72rem" }}>
																Exacto
															</span>
														)}
													</td>
												</tr>
											);
										})}
									</tbody>
									<tfoot>
										<tr style={{ borderTop: "1px solid rgba(148,163,184,0.2)" }}>
											<td colSpan={2} style={{ color: "#94a3b8", paddingTop: 12 }}>
												<strong>Total</strong>
											</td>
											<td style={{ textAlign: "right", fontFamily: "monospace", color: "#94a3b8", paddingTop: 12 }}>
												{oficial.length}
											</td>
											<td style={{ textAlign: "right", color: "#22c55e", fontFamily: "monospace", paddingTop: 12 }}>
												{carreras.reduce((s, c) => s + (statsCarrera[c]?.ingreso || 0), 0)}
											</td>
											<td style={{ textAlign: "center", fontFamily: "monospace", color: "#f8fafc", paddingTop: 12 }}>
												<strong>{totalPlazas}</strong>
											</td>
											<td></td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>

						<div className="d-flex align-items-center gap-3 flex-wrap">
							<button
								className="btn action-button action-button-primary action-button-success"
								onClick={handleSave}
							>
								<i className="bi bi-floppy me-2"></i>Guardar plazas
							</button>
							<button
								className="btn action-button action-button-ghost"
								onClick={handleReset}
							>
								Limpiar
							</button>
							{saved && (
								<span style={{ color: "#22c55e", fontWeight: 600, fontSize: "0.9rem" }}>
									<i className="bi bi-check-circle me-1"></i>Plazas guardadas correctamente.
								</span>
							)}
						</div>

						<div className="glass-card p-3 mt-4" style={{ fontSize: "0.82rem", color: "#64748b" }}>
							<strong style={{ color: "#94a3b8" }}>Leyenda — </strong>
							<span style={{ color: "#ef4444" }}>Excede</span>: hay más postulantes con INGRESO que plazas.{" "}
							<span style={{ color: "#eab308" }}>Faltan</span>: hay menos postulantes con INGRESO que plazas.{" "}
							<span style={{ color: "#22c55e" }}>Exacto</span>: coincide perfectamente.
						</div>
					</>
				)}
			</main>
		</div>
	);
}
