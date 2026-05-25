import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState, useRef, useEffect } from "react";
import { getConfig } from "../configuracion_calificacion/configuracion_calificacion";
import { getPlazas, hasManualPlazas } from "../plazas/plazas";
import { aplicarVacantesPorPuntaje } from "../../../utils/admissionRanking";

const getStored = (key) => {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const calcularDetalle = (estudianteAnswers, claveAnswers, config) => {
	let total = 0;
	const detalle = [];
	for (let i = 1; i <= 100; i++) {
		const q = `PREG_${String(i).padStart(3, "0")}`;
		const respEst = estudianteAnswers[q] || "";
		const respClave = claveAnswers[q] || "";
		let puntos = 0;
		let resultado = "";

		if (!respClave) {
			// Clave vacía: pregunta anulada → puntos completos siempre
			puntos = config.correcta;
			resultado = "anulada";
		} else if (respEst === "") {
			puntos = config.blanco;
			resultado = "sin_respuesta";
		} else if (respEst === respClave) {
			puntos = config.correcta;
			resultado = "correcta";
		} else {
			puntos = config.incorrecta;
			resultado = "incorrecta";
		}

		total += puntos;
		detalle.push({ pregunta: q, respEst, respClave, puntos, resultado });
	}
	const puntaje = Math.round(total * 1000) / 1000;
	return { puntaje, detalle };
};

export default function Resultados() {
	const [selectedIdx, setSelectedIdx] = useState(null);
	const config = useMemo(() => getConfig(), []);
	const detalleRef = useRef(null);

	useEffect(() => {
		if (selectedIdx !== null && detalleRef.current) {
			detalleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [selectedIdx]);

	const resultados = useMemo(() => {
		const config = getConfig();
		const estudiantes = getStored("studentResponsesData");
		const claves = getStored("responsesData");
		if (claves.length === 0 || estudiantes.length === 0) return [];

		const postulants = getStored("postulantsData");
		const oficialData = getStored("officialResultsData");
		const plazas = getPlazas();
		const manualPlazas = hasManualPlazas();

		const claveIndex = new Map();
		claves.forEach((c) => claveIndex.set(String(c.tema).trim().toUpperCase(), c.answers));

		const postulantIndex = new Map();
		postulants.forEach((p) => postulantIndex.set(p.id, p));

		const oficialIndex = new Map();
		oficialData.forEach((r) => { if (r.dni) oficialIndex.set(String(r.dni).trim(), r); });

		const items = estudiantes.map((est) => {
			const tema = String(est.tema).trim().toUpperCase();
			const clave = claveIndex.get(tema);
			if (!clave) return null;
			const { puntaje, detalle } = calcularDetalle(est.answers, clave, config);
			const postulant = postulantIndex.get(est.postulantId);
			const dni = postulant?.dni || "";
			const oficialEntry = oficialIndex.get(String(est.litho || "").trim())
				|| oficialIndex.get(String(postulant?.litho || "").trim())
				|| oficialIndex.get(String(dni).trim());
			const carrera = oficialEntry?.carrera || postulant?.carrera || "";
			return {
				nombre: est.postulantName,
				litho: est.litho,
				tema,
				puntaje,
				detalle,
				carrera,
				dni,
				condicionOficial: oficialEntry?.condicion || "",
				meritoOficial: oficialEntry?.merito || "",
			};
		}).filter(Boolean);

		// Sin plazas manuales, la condicion OMR respeta el PDF oficial.
		const porCarrera = {};
		items.forEach((item) => {
			const c = item.carrera || "";
			if (!porCarrera[c]) porCarrera[c] = [];
			porCarrera[c].push(item);
		});
		Object.entries(porCarrera).forEach(([carrera, grupo]) => {
			grupo.sort((a, b) => b.puntaje - a.puntaje);
			const n = plazas[carrera] || 0;
			if (manualPlazas && n > 0) {
				aplicarVacantesPorPuntaje(grupo, n, true, "puntaje");
				grupo.forEach((item) => { item.condicionOMR = item.condicion; });
			} else {
				grupo.forEach((item) => { item.condicionOMR = item.condicionOficial || "NO INGRESO"; });
			}
		});

		items.sort((a, b) => {
			const meritoA = Number(a.meritoOficial);
			const meritoB = Number(b.meritoOficial);
			if (Number.isFinite(meritoA) && Number.isFinite(meritoB)) return meritoA - meritoB;
			return b.puntaje - a.puntaje;
		});
		return items;
	}, []);

	const selected = selectedIdx !== null ? resultados[selectedIdx] : null;

	const maxScore = config.correcta * 100;
	const puntajeColor = (puntaje) => {
		if (puntaje >= maxScore * 0.80) return "#22c55e";
		if (puntaje >= maxScore * 0.50) return "#eab308";
		if (puntaje >= 0) return "#f97316";
		return "#ef4444";
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Resultados</h1>
					<p className="text-light-emphasis mb-0">
						{resultados.length > 0
							? `${resultados.length} postulante(s). Correcta: +${config.correcta} | Incorrecta: ${config.incorrecta} | Sin respuesta: ${config.blanco} | Máx: ${config.correcta * 100} pts`
							: "Importa postulantes, sus respuestas y las claves en el Módulo 2 para ver resultados reales."}
					</p>
				</div>

				<div className="row g-4">
					{/* Tabla principal */}
					<div className={selected ? "col-lg-5" : "col-12"}>
						<div className="glass-card p-4 h-100">
							{resultados.length === 0 ? (
								<p className="text-light-emphasis mb-0">Sin datos. Carga respuestas y claves primero.</p>
							) : (
								<div className="table-responsive">
									<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
										<thead>
											<tr>
												<th>#</th>
												<th>Postulante</th>
												<th>LITHO</th>
												<th>TEMA</th>
												<th>Puntaje</th>
												<th style={{ textAlign: "center" }}>Condición PDF</th>
												<th style={{ textAlign: "center" }}>Condición OMR</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{resultados.map((item, idx) => (
												<tr key={`${item.litho}-${item.tema}-${idx}`} style={{ cursor: "pointer" }} onClick={() => setSelectedIdx(idx === selectedIdx ? null : idx)}>
													<td>{idx + 1}</td>
													<td>{item.nombre}</td>
													<td>{item.litho}</td>
													<td>{item.tema}</td>
													<td>
														<strong style={{ color: puntajeColor(item.puntaje), fontSize: "1rem" }}>
															{item.puntaje.toFixed(3)}
														</strong>
													</td>
													<td style={{ textAlign: "center" }}>
														{item.condicionOficial === "INGRESO" && (
															<span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.8rem" }}>INGRESO</span>
														)}
														{item.condicionOficial === "NO INGRESO" && (
															<span style={{ color: "#ef4444", fontSize: "0.8rem" }}>NO INGRESO</span>
														)}
														{!item.condicionOficial && (
															<span style={{ color: "#475569", fontSize: "0.75rem" }}>—</span>
														)}
													</td>
													<td style={{ textAlign: "center" }}>
														{item.condicionOMR === "INGRESO" && (
															<span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.8rem" }}>INGRESO</span>
														)}
														{item.condicionOMR === "NO INGRESO" && (
															<span style={{ color: "#ef4444", fontSize: "0.8rem" }}>NO INGRESO</span>
														)}
														{!item.condicionOMR && (
															<span style={{ color: "#475569", fontSize: "0.75rem" }}>—</span>
														)}
													</td>
													<td>
														<button
															className="btn action-button action-button-secondary action-button-sm"
															onClick={(e) => { e.stopPropagation(); setSelectedIdx(idx === selectedIdx ? null : idx); }}
														>
															{idx === selectedIdx ? "Cerrar" : "Ver detalle"}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>

					{/* Panel de detalle por pregunta */}
					{selected && (
						<div className="col-lg-7" ref={detalleRef}>
							<div className="glass-card p-4 h-100">
								<div className="d-flex justify-content-between align-items-start mb-3">
									<div>
										<p className="section-kicker mb-1">Detalle de respuestas</p>
										<h2 className="h5 mb-1">{selected.nombre}</h2>
										<p className="mb-0 text-light-emphasis">LITHO: {selected.litho} | TEMA: {selected.tema}</p>
									</div>
									<div style={{ textAlign: "right" }}>
										<p className="metric-label mb-0">Puntaje total</p>
										<h2 className="metric-value mb-0" style={{ color: puntajeColor(selected.puntaje), fontSize: "1.6rem" }}>
											{selected.puntaje.toFixed(3)}
										</h2>
										<p className="mb-0" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>/ {maxScore} pts</p>
									</div>
								</div>

								{/* Resumen rápido */}
								<div className="row g-2 mb-3">
									{[
										{ label: "Correctas", val: selected.detalle.filter(d => d.resultado === "correcta").length, color: "#22c55e" },
										{ label: "Incorrectas", val: selected.detalle.filter(d => d.resultado === "incorrecta").length, color: "#ef4444" },
										{ label: "Sin respuesta", val: selected.detalle.filter(d => d.resultado === "sin_respuesta").length, color: "#94a3b8" },
										{ label: "Anuladas (+20)", val: selected.detalle.filter(d => d.resultado === "anulada").length, color: "#a78bfa" },
									].map(s => (
										<div className="col-3" key={s.label}>
											<div className="glass-card p-2 text-center">
												<p className="mb-0" style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{s.label}</p>
												<strong style={{ color: s.color, fontSize: "1.1rem" }}>{s.val}</strong>
											</div>
										</div>
									))}
								</div>

								{/* Tabla pregunta a pregunta */}
								<div style={{ overflowY: "auto", maxHeight: "420px" }}>
									<table className="table table-dark table-borderless align-middle mb-0" style={{ fontSize: "0.82rem" }}>
										<thead style={{ position: "sticky", top: 0, background: "#0f172a" }}>
											<tr>
												<th>Pregunta</th>
												<th>Resp. Alumno</th>
												<th>Clave</th>
												<th>Puntos</th>
												<th>Estado</th>
											</tr>
										</thead>
										<tbody>
											{selected.detalle.map((d) => (
												<tr key={d.pregunta}>
													<td style={{ color: "#94a3b8" }}>{d.pregunta}</td>
													<td>
														<strong style={{ color: d.resultado === "correcta" ? "#22c55e" : d.resultado === "incorrecta" ? "#ef4444" : d.resultado === "anulada" ? "#a78bfa" : "#94a3b8" }}>
															{d.respEst || "—"}
														</strong>
													</td>
													<td style={{ color: d.resultado === "anulada" ? "#a78bfa" : "#cbd5e1" }}>
														{d.resultado === "anulada" ? "—" : (d.respClave || "—")}
													</td>
													<td>
														<strong style={{ color: d.puntos > 0 ? "#22c55e" : d.puntos < 0 ? "#ef4444" : "#94a3b8" }}>
															{d.puntos > 0 ? `+${d.puntos}` : d.puntos}
														</strong>
													</td>
													<td style={{ fontSize: "0.75rem" }}>
														{d.resultado === "anulada" && <span style={{ color: "#a78bfa" }}>Anulada</span>}
														{d.resultado === "correcta" && <span style={{ color: "#22c55e" }}>Correcta</span>}
														{d.resultado === "incorrecta" && <span style={{ color: "#ef4444" }}>Incorrecta</span>}
														{d.resultado === "sin_respuesta" && <span style={{ color: "#94a3b8" }}>En blanco</span>}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="mt-3">
									<button className="btn action-button action-button-ghost action-button-sm" onClick={() => setSelectedIdx(null)}>
										Cerrar detalle
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
