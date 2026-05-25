import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";
import { writeRowsToXlsx } from "../../../utils/excel";
import { printHtmlDocument } from "../../../utils/print";
import { aplicarVacantesPorPuntaje } from "../../../utils/admissionRanking";
import { getConfig } from "../configuracion_calificacion/configuracion_calificacion";
import { getPlazas, hasManualPlazas } from "../plazas/plazas";

const condicionStyle = (condicion) => {
	switch (String(condicion).toUpperCase()) {
		case "INGRESO":         return { color: "#22c55e", fontWeight: 700 };
		case "NO_INGRESO":
		case "NO INGRESO":     return { color: "#ef4444" };
		case "LISTA_ESPERA":
		case "ESPERA":         return { color: "#eab308" };
		default:               return { color: "#94a3b8" };
	}
};

const nombreCompleto = (p) => {
	const nombres = String(p?.nombres || "").replace(/\s+/g, " ").trim();
	const apellidoPat = String(p?.apellidoPat || "").replace(/\s+/g, " ").trim();
	const apellidoMat = String(p?.apellidoMat || "").replace(/\s+/g, " ").trim();
	const apellidos = [apellidoPat, apellidoMat].filter(Boolean).join(" ");
	if (!nombres) return apellidos;
	const nombresNorm = normalizeName(nombres);
	const apellidosNorm = normalizeName(apellidos);
	if (nombres.includes(",") || (apellidosNorm && nombresNorm.includes(apellidosNorm))) return nombres;
	return [nombres, apellidoPat, apellidoMat].filter(Boolean).join(" ");
};

const normalizeName = (value) =>
	String(value || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.toUpperCase();

const formatFecha = (iso) => {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
	} catch { return iso; }
};

const formatPuntaje = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(4) : "";

const escapeHtml = (value) => String(value ?? "")
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");

const carreraResultado = (r) => r.inscripcion?.carrera?.nombre || "SIN CARRERA";

const buildExportRows = (rows) => rows.map((r) => {
	const postulante = r.inscripcion?.postulante || {};
	return {
		merito: r.ordenMerito ?? "",
		postulante: nombreCompleto(postulante) || "",
		dni: postulante.dni || "",
		carrera: carreraResultado(r),
		puntaje: formatPuntaje(r.puntajeFinal),
		condicion: r.condicion || "",
		publicado: r.publicado ? "SI" : "NO",
		fechaPublicacion: formatFecha(r.fechaPublicacion),
	};
});

const buildPrintableReport = ({ titulo, subtitulo, rows }) => {
	const bodyRows = rows.map((r) => `
		<tr>
			<td>${escapeHtml(r.merito)}</td>
			<td>${escapeHtml(r.postulante)}</td>
			<td>${escapeHtml(r.dni)}</td>
			<td>${escapeHtml(r.carrera)}</td>
			<td>${escapeHtml(r.puntaje)}</td>
			<td>${escapeHtml(r.condicion)}</td>
			<td>${escapeHtml(r.publicado)}</td>
			<td>${escapeHtml(r.fechaPublicacion)}</td>
		</tr>
	`).join("");

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>${escapeHtml(titulo)}</title>
	<style>
		@page { size: A4 landscape; margin: 12mm; }
		body { margin: 0; color: #000; font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
		h1 { margin: 0 0 4px; text-align: center; font-size: 16px; text-transform: uppercase; }
		.subtitle { margin: 0 0 14px; text-align: center; font-size: 12px; font-weight: 600; }
		table { width: 100%; border-collapse: collapse; table-layout: fixed; }
		th, td { border: 1px solid #999; padding: 5px 6px; vertical-align: middle; overflow-wrap: anywhere; }
		th { background: #d9d9d9; font-size: 9px; text-align: center; font-weight: 700; }
		td:nth-child(1), td:nth-child(3), td:nth-child(6), td:nth-child(7), td:nth-child(8) { text-align: center; }
		td:nth-child(5) { text-align: right; font-family: Consolas, monospace; }
		tbody tr:nth-child(even) td { background: #f2f2f2; }
	</style>
</head>
<body>
	<h1>${escapeHtml(titulo)}</h1>
	${subtitulo ? `<div class="subtitle">${escapeHtml(subtitulo)}</div>` : ""}
	<table>
		<thead>
			<tr>
				<th>MERITO</th><th>POSTULANTE</th><th>DNI</th><th>CARRERA</th>
				<th>PUNTAJE</th><th>CONDICION</th><th>PUBLICADO</th><th>FECHA PUB.</th>
			</tr>
		</thead>
		<tbody>${bodyRows}</tbody>
	</table>
</body>
</html>`;
};

const getStored = (key) => {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const calcularPuntaje = (estudianteAnswers, claveAnswers, config) => {
	let total = 0;
	for (let i = 1; i <= 100; i += 1) {
		const q = `PREG_${String(i).padStart(3, "0")}`;
		const respEst = estudianteAnswers[q] || "";
		const respClave = claveAnswers[q] || "";
		if (!respClave) total += config.correcta;
		else if (respEst === "") total += config.blanco;
		else if (respEst === respClave) total += config.correcta;
		else total += config.incorrecta;
	}
	return Math.round(total * 1000) / 1000;
};

export default function GestResultadosAdmision() {
	const [procesos, setProcesos] = useState([]);
	const [resultados, setResultados] = useState([]);
	const [filtroProceso, setFiltroProceso] = useState("__TODOS__");
	const [filtroCondicion, setFiltroCondicion] = useState("__TODAS__");
	const [filtroCarrera, setFiltroCarrera] = useState("__TODAS__");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updatingId, setUpdatingId] = useState(null);
	const [openDropdown, setOpenDropdown] = useState(null);

	const loadResultados = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/resultado-admision");
			setResultados(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar resultados");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		apiRequest("/api/proceso-admision").then(d => setProcesos(d || [])).catch(() => {});
		loadResultados();
	}, []);

	const resultadosLocales = useMemo(() => {
		if (resultados.length > 0) return [];
		const estudiantes = getStored("studentResponsesData");
		const claves = getStored("responsesData");
		const postulantes = getStored("postulantsData");
		if (estudiantes.length === 0 || claves.length === 0) return [];

		const config = getConfig();
		const plazas = getPlazas();
		const manualPlazas = hasManualPlazas();
		const oficiales = getStored("officialResultsData");
		const claveIndex = new Map();
		claves.forEach((c) => claveIndex.set(String(c.tema).trim().toUpperCase(), c.answers));

		const postulanteIndex = new Map();
		postulantes.forEach((p) => postulanteIndex.set(p.id, p));

		const oficialIndex = new Map();
		oficiales.forEach((r) => {
			if (r.dni) oficialIndex.set(String(r.dni).trim(), r);
			if (r.nombre) oficialIndex.set(normalizeName(r.nombre), r);
		});

		const base = estudiantes.map((est, idx) => {
			const tema = String(est.tema || "").trim().toUpperCase();
			const clave = claveIndex.get(tema);
			if (!clave) return null;
			const postulante = postulanteIndex.get(est.postulantId) || {};
			const oficial = oficialIndex.get(String(est.litho || "").trim())
				|| oficialIndex.get(String(postulante.litho || "").trim())
				|| oficialIndex.get(String(postulante.dni || "").trim())
				|| oficialIndex.get(normalizeName(est.postulantName || postulante.names));
			const carreraNombre = oficial?.carrera || postulante.carrera || "";
			return {
				id: `local-${idx}`,
				local: true,
				proceso: procesos[0] ? { id: procesos[0].id } : null,
				inscripcion: {
					id: null,
					postulante: {
						dni: postulante.dni || "",
						nombres: est.postulantName || postulante.names || "",
						apellidoPat: postulante.apellidoPat || "",
						apellidoMat: postulante.apellidoMat || "",
					},
					carrera: { nombre: carreraNombre },
				},
				calificacion: null,
				puntajeFinal: calcularPuntaje(est.answers, clave, config),
				ordenMerito: null,
				condicion: oficial?.condicion || "NO INGRESO",
				vacanteAmpliada: false,
				publicado: false,
				fechaPublicacion: null,
			};
		}).filter(Boolean);

		const porCarrera = {};
		base.forEach((item) => {
			const carrera = item.inscripcion?.carrera?.nombre || "";
			if (!porCarrera[carrera]) porCarrera[carrera] = [];
			porCarrera[carrera].push(item);
		});
		Object.entries(porCarrera).forEach(([carrera, grupo]) => {
			const vacantes = plazas[carrera] || 0;
			if (manualPlazas && vacantes > 0) aplicarVacantesPorPuntaje(grupo, vacantes, true, "puntajeFinal");
			else grupo.forEach((item) => { item.condicion = item.condicion || "NO INGRESO"; });
		});

		return base
			.sort((a, b) => b.puntajeFinal - a.puntajeFinal)
			.map((item, idx) => ({ ...item, ordenMerito: idx + 1 }));
	}, [resultados, procesos]);

	const resultadosMostrados = useMemo(() => {
		const baseResultados = resultados.length === 0 ? resultadosLocales : resultados;

		const oficialIndex = new Map();
		getStored("officialResultsData").forEach((r) => {
			if (r.dni) oficialIndex.set(String(r.dni).trim(), r);
			if (r.nombre) oficialIndex.set(normalizeName(r.nombre), r);
		});
		if (!oficialIndex.size) return baseResultados;

		return baseResultados.map((r) => {
			const postulante = r.inscripcion?.postulante || {};
			const oficial = oficialIndex.get(String(postulante.dni || "").trim())
				|| oficialIndex.get(normalizeName(nombreCompleto(postulante)));
			return oficial?.condicion
				? { ...r, condicion: oficial.condicion, vacanteAmpliada: oficial.condicion === "INGRESO" ? r.vacanteAmpliada : false }
				: r;
		});
	}, [resultados, resultadosLocales]);

	const resultadosFiltrados = useMemo(() => {
		let list = resultadosMostrados;
		if (filtroProceso !== "__TODOS__") {
			list = list.filter(r => String(r.proceso?.id) === filtroProceso);
		}
		if (filtroCondicion !== "__TODAS__") {
			list = list.filter(r => String(r.condicion) === filtroCondicion);
		}
		if (filtroCarrera !== "__TODAS__") {
			list = list.filter(r => carreraResultado(r) === filtroCarrera);
		}
		return list.sort((a, b) => (a.ordenMerito ?? 9999) - (b.ordenMerito ?? 9999));
	}, [resultadosMostrados, filtroProceso, filtroCondicion, filtroCarrera]);

	const condiciones = useMemo(() => {
		const set = new Set(resultadosMostrados.map(r => r.condicion).filter(Boolean));
		return [...set];
	}, [resultadosMostrados]);

	const carreras = useMemo(() => {
		const set = new Set(resultadosMostrados.map(carreraResultado).filter(Boolean));
		return [...set].sort();
	}, [resultadosMostrados]);

	const togglePublicado = async (r) => {
		setUpdatingId(r.id);
		setError("");
		try {
			const payload = {
				proceso:          { id: r.proceso?.id },
				inscripcion:      { id: r.inscripcion?.id },
				calificacion:     { id: r.calificacion?.id },
				puntajeFinal:     r.puntajeFinal,
				ordenMerito:      r.ordenMerito,
				condicion:        r.condicion,
				vacanteAmpliada:  r.vacanteAmpliada,
				publicado:        !r.publicado,
				fechaPublicacion: !r.publicado ? new Date().toISOString() : null,
			};
			if (r.local) {
				throw new Error("Este resultado esta calculado localmente. Para publicarlo en BD primero se debe generar calificacion/inscripcion en backend.");
			}
			const updated = await apiRequest(`/api/resultado-admision/${r.id}`, {
				method: "PUT", body: JSON.stringify(payload),
			});
			setResultados(prev => prev.map(x => x.id === r.id ? updated : x));
		} catch (err) {
			setError(`Error al actualizar resultado ${r.id}: ${err.message}`);
		} finally {
			setUpdatingId(null);
		}
	};

	const ingresados  = resultadosFiltrados.filter(r => String(r.condicion).includes("INGRESO") && !String(r.condicion).includes("NO")).length;
	const publicados  = resultadosFiltrados.filter(r => r.publicado).length;

	const getProcesoLabel = () => {
		if (filtroProceso === "__TODOS__") return "Todos los procesos";
		const p = procesos.find(x => String(x.id) === filtroProceso);
		return p ? `${p.codigo} — ${p.periodo} ${p.anio}` : "Seleccionar";
	};

	const getCondicionLabel = () => {
		if (filtroCondicion === "__TODAS__") return "Todas las condiciones";
		return filtroCondicion;
	};

	const getCarreraLabel = () => {
		if (filtroCarrera === "__TODAS__") return "Todas las carreras";
		return filtroCarrera;
	};

	const handleExportExcel = async () => {
		if (!resultadosFiltrados.length) return;
		const rows = buildExportRows(resultadosFiltrados);
		await writeRowsToXlsx(rows, [
			{ header: "MERITO", key: "merito", width: 10 },
			{ header: "POSTULANTE", key: "postulante", width: 42 },
			{ header: "DNI", key: "dni", width: 14 },
			{ header: "CARRERA", key: "carrera", width: 36 },
			{ header: "PUNTAJE", key: "puntaje", width: 14 },
			{ header: "CONDICION", key: "condicion", width: 16 },
			{ header: "PUBLICADO", key: "publicado", width: 12 },
			{ header: "FECHA PUB.", key: "fechaPublicacion", width: 16 },
		], "Resultados BD", "resultados-admision-bd.xlsx");
	};

	const handlePrint = () => {
		if (!resultadosFiltrados.length) return;
		const subtitulo = [
			getProcesoLabel(),
			getCarreraLabel(),
			getCondicionLabel(),
		].filter(Boolean).join(" | ");
		printHtmlDocument(buildPrintableReport({
			titulo: "Resultados de admision",
			subtitulo,
			rows: buildExportRows(resultadosFiltrados),
		}));
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

				<div className="page-title mb-4">
					<span className="eyebrow">Calificación — BD</span>
					<h1 className="display-6 fw-bold mb-2">Resultados de admisión</h1>
					<p className="text-light-emphasis mb-0">
						Visualiza y publica los resultados oficiales almacenados en la base de datos.
						{resultados.length === 0 && resultadosLocales.length > 0 ? " No hay registros BD; se muestran resultados calculados localmente." : ""}
					</p>
				</div>

				<div className="row g-3 mb-4">
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Total resultados</p>
							<h2 className="metric-value mb-0">{resultadosFiltrados.length}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Con ingreso</p>
							<h2 className="metric-value mb-0" style={{ color: "#22c55e" }}>{ingresados}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Publicados</p>
							<h2 className="metric-value mb-0" style={{ color: "#eab308" }}>{publicados}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Sin publicar</p>
							<h2 className="metric-value mb-0" style={{ color: "#64748b" }}>
								{resultadosFiltrados.length - publicados}
							</h2>
						</div>
					</div>
				</div>

				{error && <div className="alert alert-danger mb-4">{error}</div>}

				<div className="glass-card p-0">
					<div className="d-flex flex-wrap align-items-center gap-3 px-4 py-3"
						style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
						
						{/* Dropdown Procesos */}
						<div style={{ position: "relative", minWidth: 280 }}>
							<button
								onClick={() => setOpenDropdown(openDropdown === "proceso" ? null : "proceso")}
								style={{
									width: "100%",
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(148,163,184,0.2)",
									color: "#f8fafc",
									padding: "0.5rem 0.75rem",
									borderRadius: "0.375rem",
									fontSize: "0.875rem",
									textAlign: "left",
									cursor: "pointer",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								}}
							>
								<span>{getProcesoLabel()}</span>
								<span style={{ color: "#94a3b8" }}>▼</span>
							</button>
							{openDropdown === "proceso" && (
								<div style={{
									position: "absolute",
									top: "100%",
									left: 0,
									right: 0,
									background: "rgba(30,41,59,0.95)",
									border: "1px solid rgba(148,163,184,0.2)",
									borderTop: "none",
									borderRadius: "0 0 0.375rem 0.375rem",
									zIndex: 10,
									maxHeight: "200px",
									overflowY: "auto"
								}}>
									<div
										onClick={() => { setFiltroProceso("__TODOS__"); setOpenDropdown(null); }}
										style={{
											padding: "0.5rem 0.75rem",
											color: "#cbd5e1",
											cursor: "pointer",
											background: filtroProceso === "__TODOS__" ? "rgba(59,130,246,0.2)" : "transparent",
											fontSize: "0.875rem"
										}}
									>
										— Todos los procesos —
									</div>
									{procesos.map(p => (
										<div
											key={p.id}
											onClick={() => { setFiltroProceso(String(p.id)); setOpenDropdown(null); }}
											style={{
												padding: "0.5rem 0.75rem",
												color: "#cbd5e1",
												cursor: "pointer",
												background: String(filtroProceso) === String(p.id) ? "rgba(59,130,246,0.2)" : "transparent",
												fontSize: "0.875rem",
												borderTop: "1px solid rgba(148,163,184,0.08)",
												hover: "background-color"
											}}
											onMouseEnter={(e) => e.target.style.background = "rgba(59,130,246,0.15)"}
											onMouseLeave={(e) => e.target.style.background = String(filtroProceso) === String(p.id) ? "rgba(59,130,246,0.2)" : "transparent"}
										>
											{p.codigo} — {p.periodo} {p.anio}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Dropdown Condiciones */}
						<div style={{ position: "relative", minWidth: 200 }}>
							<button
								onClick={() => setOpenDropdown(openDropdown === "condicion" ? null : "condicion")}
								style={{
									width: "100%",
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(148,163,184,0.2)",
									color: "#f8fafc",
									padding: "0.5rem 0.75rem",
									borderRadius: "0.375rem",
									fontSize: "0.875rem",
									textAlign: "left",
									cursor: "pointer",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								}}
							>
								<span>{getCondicionLabel()}</span>
								<span style={{ color: "#94a3b8" }}>▼</span>
							</button>
							{openDropdown === "condicion" && (
								<div style={{
									position: "absolute",
									top: "100%",
									left: 0,
									right: 0,
									background: "rgba(30,41,59,0.95)",
									border: "1px solid rgba(148,163,184,0.2)",
									borderTop: "none",
									borderRadius: "0 0 0.375rem 0.375rem",
									zIndex: 10,
									maxHeight: "200px",
									overflowY: "auto"
								}}>
									<div
										onClick={() => { setFiltroCondicion("__TODAS__"); setOpenDropdown(null); }}
										style={{
											padding: "0.5rem 0.75rem",
											color: "#cbd5e1",
											cursor: "pointer",
											background: filtroCondicion === "__TODAS__" ? "rgba(59,130,246,0.2)" : "transparent",
											fontSize: "0.875rem"
										}}
									>
										— Todas las condiciones —
									</div>
									{condiciones.map(c => (
										<div
											key={c}
											onClick={() => { setFiltroCondicion(c); setOpenDropdown(null); }}
											style={{
												padding: "0.5rem 0.75rem",
												color: "#cbd5e1",
												cursor: "pointer",
												background: filtroCondicion === c ? "rgba(59,130,246,0.2)" : "transparent",
												fontSize: "0.875rem",
												borderTop: "1px solid rgba(148,163,184,0.08)"
											}}
											onMouseEnter={(e) => e.target.style.background = "rgba(59,130,246,0.15)"}
											onMouseLeave={(e) => e.target.style.background = filtroCondicion === c ? "rgba(59,130,246,0.2)" : "transparent"}
										>
											{c}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Dropdown Carreras */}
						<div style={{ position: "relative", minWidth: 260 }}>
							<button
								onClick={() => setOpenDropdown(openDropdown === "carrera" ? null : "carrera")}
								style={{
									width: "100%",
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(148,163,184,0.2)",
									color: "#f8fafc",
									padding: "0.5rem 0.75rem",
									borderRadius: "0.375rem",
									fontSize: "0.875rem",
									textAlign: "left",
									cursor: "pointer",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								}}
							>
								<span>{getCarreraLabel()}</span>
								<span style={{ color: "#94a3b8" }}>â–¼</span>
							</button>
							{openDropdown === "carrera" && (
								<div style={{
									position: "absolute",
									top: "100%",
									left: 0,
									right: 0,
									background: "rgba(30,41,59,0.95)",
									border: "1px solid rgba(148,163,184,0.2)",
									borderTop: "none",
									borderRadius: "0 0 0.375rem 0.375rem",
									zIndex: 10,
									maxHeight: "240px",
									overflowY: "auto"
								}}>
									<div
										onClick={() => { setFiltroCarrera("__TODAS__"); setOpenDropdown(null); }}
										style={{
											padding: "0.5rem 0.75rem",
											color: "#cbd5e1",
											cursor: "pointer",
											background: filtroCarrera === "__TODAS__" ? "rgba(59,130,246,0.2)" : "transparent",
											fontSize: "0.875rem"
										}}
									>
										â€” Todas las carreras â€”
									</div>
									{carreras.map(c => (
										<div
											key={c}
											onClick={() => { setFiltroCarrera(c); setOpenDropdown(null); }}
											style={{
												padding: "0.5rem 0.75rem",
												color: "#cbd5e1",
												cursor: "pointer",
												background: filtroCarrera === c ? "rgba(59,130,246,0.2)" : "transparent",
												fontSize: "0.875rem",
												borderTop: "1px solid rgba(148,163,184,0.08)"
											}}
											onMouseEnter={(e) => e.target.style.background = "rgba(59,130,246,0.15)"}
											onMouseLeave={(e) => e.target.style.background = filtroCarrera === c ? "rgba(59,130,246,0.2)" : "transparent"}
										>
											{c}
										</div>
									))}
								</div>
							)}
						</div>

						<button className="btn action-button action-button-secondary" onClick={handlePrint} disabled={!resultadosFiltrados.length}>
							<i className="bi bi-printer"></i> PDF
						</button>
						<button className="btn action-button action-button-primary action-button-success" onClick={handleExportExcel} disabled={!resultadosFiltrados.length}>
							<i className="bi bi-file-earmark-excel"></i> Excel
						</button>

						<span style={{ color: "#64748b", fontSize: "0.82rem" }}>
							{resultadosFiltrados.length} resultado(s)
						</span>
					</div>

					<div className="table-responsive">
						<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
							<thead>
								<tr>
									<th style={{ textAlign: "center" }}>Mérito</th>
									<th>Postulante</th>
									<th>DNI</th>
									<th>Carrera</th>
									<th style={{ textAlign: "right" }}>Puntaje</th>
									<th style={{ textAlign: "center" }}>Condición</th>
									<th style={{ textAlign: "center" }}>Publicado</th>
									<th style={{ width: 100 }}>Fecha pub.</th>
								</tr>
							</thead>
							<tbody>
								{loading && (
									<tr><td colSpan="8" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
								)}
								{!loading && resultadosFiltrados.length === 0 && (
									<tr>
										<td colSpan="8" className="text-center text-light-emphasis py-4">
											No hay resultados registrados. Importa postulantes, claves y respuestas primero.
										</td>
									</tr>
								)}
								{!loading && resultadosFiltrados.map(r => {
									const postulante = r.inscripcion?.postulante;
									const carrera = r.inscripcion?.carrera;
									const isUpdating = updatingId === r.id;
									return (
										<tr key={r.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
											<td style={{ textAlign: "center", fontFamily: "monospace", color: "#64748b" }}>
												{r.ordenMerito ?? "—"}
											</td>
											<td>
												<strong style={{ color: "#e2e8f0" }}>
													{nombreCompleto(postulante) || "—"}
												</strong>
											</td>
											<td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.85rem" }}>
												{postulante?.dni || "—"}
											</td>
											<td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
												{carrera?.nombre || "—"}
											</td>
											<td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#f8fafc" }}>
												{r.puntajeFinal != null ? Number(r.puntajeFinal).toFixed(4) : "—"}
											</td>
											<td style={{ textAlign: "center" }}>
												<span style={{ fontSize: "0.78rem", fontWeight: 600, ...condicionStyle(r.condicion) }}>
													{r.condicion || "—"}
												</span>
												{r.vacanteAmpliada && (
													<span style={{ color: "#eab308", fontSize: "0.68rem", display: "block" }}>ampliada</span>
												)}
											</td>
											<td style={{ textAlign: "center" }}>
												<button
													className={`btn btn-sm ${r.publicado ? "btn-success" : "btn-outline-secondary"}`}
													style={{
														fontSize: "0.72rem",
														padding: "2px 10px",
														borderColor: r.publicado ? "#22c55e" : "rgba(148,163,184,0.3)",
														color: r.publicado ? "#fff" : "#94a3b8",
													}}
													onClick={() => togglePublicado(r)}
													disabled={isUpdating || r.local}
													title={r.publicado ? "Despublicar" : "Publicar"}
												>
													{r.local ? "Local" : isUpdating ? "..." : r.publicado ? "Publicado" : "Publicar"}
												</button>
											</td>
											<td style={{ fontSize: "0.78rem", color: "#64748b" }}>
												{formatFecha(r.fechaPublicacion)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
}
