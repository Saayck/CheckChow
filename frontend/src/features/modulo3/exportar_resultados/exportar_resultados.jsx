import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { writeRowsToXlsx } from "../../../utils/excel";
import { printHtmlDocument } from "../../../utils/print";
import { useMemo, useState } from "react";
import { getConfig } from "../configuracion_calificacion/configuracion_calificacion";
import { getOfficialResults } from "../resultados_oficiales/resultados_oficiales";
import { getPlazas, hasManualPlazas } from "../plazas/plazas";
import { aplicarVacantesPorPuntaje } from "../../../utils/admissionRanking";

const getStored = (key) => {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const calcularPuntaje = (estudianteAnswers, claveAnswers, config) => {
	let total = 0;
	for (let i = 1; i <= 100; i++) {
		const q = `PREG_${String(i).padStart(3, "0")}`;
		const respEst = estudianteAnswers[q] || "";
		const respClave = claveAnswers[q] || "";
		if (!respClave)         total += config.correcta;
		else if (respEst === "") total += config.blanco;
		else if (respEst === respClave) total += config.correcta;
		else                    total += config.incorrecta;
	}
	return Math.round(total * 1000) / 1000;
};

const pad4 = (n) => String(n).padStart(4, "0");
const pad3 = (n) => String(n).padStart(3, "0");
const formatScore = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(3) : "";
const normalizeText = (value) =>
	String(value || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.toUpperCase();

const normalizeKey = (value) => String(value || "").replace(/\s+/g, " ").trim();
const normalizeName = normalizeText;
const carreraKey = normalizeText;

const escapeHtml = (value) => String(value ?? "")
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");

const calcularMerito = (filas) => {
	let denseRank = 0;
	let prevPuntaje = null;
	let count = 0;
	return filas.map((f) => {
		count++;
		if (f.puntajeOMR !== prevPuntaje) denseRank = count;
		prevPuntaje = f.puntajeOMR;
		return { ...f, merito: denseRank };
	});
};

const condicionRank = (item) => {
	const condicion = normalizeText(item?.condicionOficial || item?.condicionOMR || item?.condicion);
	return condicion === "INGRESO" ? 0 : 1;
};

const puntajeCeroRank = (item) => {
	const puntaje = item?.puntajeOMR ?? item?.puntajeOficial;
	return Number(puntaje || 0) === 0 ? 1 : 0;
};

const nombrePostulante = (postulant, fallback = "") => {
	const nombres = normalizeKey(postulant?.names || postulant?.nombres || fallback);
	const apellidoPat = normalizeKey(postulant?.apellidoPat);
	const apellidoMat = normalizeKey(postulant?.apellidoMat);
	const apellidos = [apellidoPat, apellidoMat].filter(Boolean).join(" ");
	if (!nombres) return apellidos;
	if (nombres.includes(",") || (apellidos && normalizeName(nombres).includes(normalizeName(apellidos)))) return nombres;
	return [nombres, apellidoPat, apellidoMat].filter(Boolean).join(" ");
};

const addOfficialIndex = (index, key, result) => {
	const normalized = normalizeKey(key);
	if (normalized) index.set(normalized, result);
};

const officialIdentity = (result) =>
	normalizeKey(result?.dni || result?.codigo || result?.litho || normalizeName(result?.nombre));

const getPlazasCarrera = (plazas, carrera) => {
	const direct = Number(plazas[carrera] || 0);
	if (direct > 0) return direct;
	const selectedKey = carreraKey(carrera);
	const match = Object.entries(plazas).find(([key]) => carreraKey(key) === selectedKey);
	return match ? Number(match[1] || 0) : 0;
};

const reportSubtitle = ({ subtitulo, filtroCarrera }) => {
	const parts = [];
	if (subtitulo) parts.push(subtitulo);
	if (filtroCarrera !== "__TODAS__") parts.push(filtroCarrera);
	return parts.join(" | ");
};

const filenameForCareer = (career) => {
	if (career === "__TODAS__") return "resultados.xlsx";
	const safeCareer = normalizeText(career).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return `resultados-${safeCareer || "carrera"}.xlsx`;
};

const uniqueCarreras = (items) => {
	const map = new Map();
	items.forEach((item) => {
		const carrera = normalizeKey(item.carreraOficial);
		const key = carreraKey(carrera);
		if (key && !map.has(key)) map.set(key, carrera);
	});
	return [...map.values()].sort((a, b) => a.localeCompare(b));
};

const BASE_EXPORT_COLUMNS = [
	{
		key: "SEC",
		header: "SEC",
		width: 7,
		align: "center",
		getValue: (f) => f.sec,
	},
	{
		key: "CODIGO",
		header: "CODIGO",
		width: 12,
		align: "center",
		getValue: (f) => f.dni || "-",
	},
	{
		key: "NOMBRE",
		header: "NOMBRE",
		width: 38,
		getValue: (f) => f.nombre,
	},
	{
		key: "CARRERA",
		header: "CARRERA",
		width: 30,
		getValue: (f) => f.carreraOficial || "-",
	},
	{
		key: "PUNTAJE OMR",
		header: "PUNTAJE OMR",
		width: 12,
		align: "right",
		monospace: true,
		getValue: (f) => formatScore(f.puntajeOMR),
	},
	{
		key: "MERITO",
		header: "MERITO",
		width: 8,
		align: "center",
		monospace: true,
		getValue: (f, ctx) => (ctx.tieneOficial && f.enPDF && f.meritoOficial) ? f.meritoOficial : f.merito,
	},
	{
		key: "PUNTAJE OFICIAL",
		header: "PUNTAJE OFICIAL",
		width: 14,
		align: "right",
		monospace: true,
		requiresOfficial: true,
		getValue: (f) => f.enPDF ? formatScore(f.puntajeOficial) : "No en PDF",
	},
	{
		key: "CONDICION PDF",
		header: "CONDICION PDF",
		width: 12,
		align: "center",
		requiresOfficial: true,
		getValue: (f) => !f.enPDF ? "No encontrado" : f.condicionOficial || "-",
	},
	{
		key: "CONDICION OMR",
		header: "CONDICION OMR",
		width: 12,
		align: "center",
		requiresPlazas: true,
		getValue: (f) => f.condicionOMR || "Sin plazas",
	},
];

const DEFAULT_SELECTED_COLUMNS = BASE_EXPORT_COLUMNS.map((column) => column.key);

const getAvailableColumns = ({ tieneOficial, tienePlazas }) => BASE_EXPORT_COLUMNS.filter((column) => {
	if (column.requiresOfficial && !tieneOficial) return false;
	if (column.requiresPlazas && !tienePlazas) return false;
	return true;
});

const getSelectedColumns = ({ selectedColumnKeys, tieneOficial, tienePlazas }) => {
	const selected = new Set(selectedColumnKeys);
	const columns = getAvailableColumns({ tieneOficial, tienePlazas })
		.filter((column) => selected.has(column.key));
	return columns.length ? columns : getAvailableColumns({ tieneOficial, tienePlazas }).slice(0, 1);
};

const PRINT_CSS = `
@media print {
	* {
		--bs-table-bg: transparent !important;
		--bs-table-color: #000 !important;
		--bs-table-border-color: #ccc !important;
		--bs-table-striped-bg: #f2f2f2 !important;
		--bs-table-striped-color: #000 !important;
		--bs-table-active-bg: transparent !important;
		--bs-table-hover-bg: transparent !important;
	}
	body { background: #fff !important; color: #000 !important; font-family: Arial, sans-serif; }
	.dashboard-navbar, .export-controls, .no-print { display: none !important; }
	.dashboard-shell { background: #fff !important; }
	main { padding: 0 !important; }
	.print-title { display: block !important; font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 4px; }
	.print-subtitle { display: block !important; font-size: 10pt; text-align: center; margin-bottom: 14px; }
	.glass-card { background: #fff !important; border: none !important; box-shadow: none !important; }
	table { width: 100% !important; border-collapse: collapse !important; font-size: 8pt; background: #fff !important; color: #000 !important; }
	thead tr { background: #d0d0d0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
	th { padding: 5px 6px !important; border: 1px solid #999 !important; font-weight: bold; color: #000 !important; background: inherit !important; }
	tbody tr { background: #fff !important; color: #000 !important; }
	td { padding: 4px 6px !important; border: 1px solid #ccc !important; color: #000 !important; background: #fff !important; }
	tr:nth-child(even) td { background: #f2f2f2 !important; color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
	span { color: inherit !important; }
}
`;

const buildPrintableReport = ({ titulo, subtitulo, filas, columns, tieneOficial }) => {
	const bodyRows = filas.map((f) => {
		return `<tr>${columns.map((column) => `<td class="align-${column.align || "left"} ${column.monospace ? "mono" : ""}">${escapeHtml(column.getValue(f, { tieneOficial }))}</td>`).join("")}</tr>`;
	}).join("");

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>${escapeHtml(titulo || "Resultados")}</title>
	<style>
		@page { size: A4 landscape; margin: 12mm; }
		* { box-sizing: border-box; }
		body {
			margin: 0;
			background: #fff;
			color: #000;
			font-family: Arial, Helvetica, sans-serif;
			font-size: 10px;
		}
		h1 {
			margin: 0 0 4px;
			text-align: center;
			font-size: 16px;
			letter-spacing: 0;
			text-transform: uppercase;
		}
		.subtitle {
			margin: 0 0 14px;
			text-align: center;
			font-size: 12px;
			font-weight: 600;
		}
		table {
			width: 100%;
			border-collapse: collapse;
			table-layout: fixed;
		}
		th, td {
			border: 1px solid #999;
			padding: 5px 6px;
			vertical-align: middle;
			overflow-wrap: anywhere;
		}
		th {
			background: #d9d9d9;
			font-size: 9px;
			text-align: center;
			font-weight: 700;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.align-center { text-align: center; }
		.align-right { text-align: right; }
		.mono { font-family: Consolas, monospace; }
		tbody tr:nth-child(even) td {
			background: #f2f2f2;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		@media print {
			body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
		}
	</style>
</head>
<body>
	<h1>${escapeHtml(titulo || "RESULTADOS DE EXAMEN DE ADMISION")}</h1>
	${subtitulo ? `<div class="subtitle">${escapeHtml(subtitulo)}</div>` : ""}
	<table>
		<thead><tr>${columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")}</tr></thead>
		<tbody>${bodyRows}</tbody>
	</table>
</body>
</html>`;
};

export default function ExportarResultados() {
	const config = useMemo(() => getConfig(), []);
	const [titulo, setTitulo] = useState("RESULTADOS DE EXAMEN DE ADMISIÓN");
	const [subtitulo, setSubtitulo] = useState("");
	const [filtroCarrera, setFiltroCarrera] = useState("__TODAS__");
	const [selectedColumnKeys, setSelectedColumnKeys] = useState(DEFAULT_SELECTED_COLUMNS);

	const oficiales = useMemo(() => {
		const index = new Map();
		getOfficialResults().forEach((r) => {
			addOfficialIndex(index, r.dni, r);
			addOfficialIndex(index, r.codigo, r);
			addOfficialIndex(index, r.litho, r);
			if (r.nombre) addOfficialIndex(index, normalizeName(r.nombre), r);
		});
		return index;
	}, []);

	const oficialesRaw = useMemo(() => getOfficialResults(), []);

	const { filas, carreras, tienePlazas } = useMemo(() => {
		const postulants = getStored("postulantsData");
		const estudiantes = getStored("studentResponsesData");
		const claves = getStored("responsesData");

		const claveIndex = new Map();
		claves.forEach((c) => claveIndex.set(String(c.tema).trim().toUpperCase(), c.answers));

		const postulantIndex = new Map();
		postulants.forEach((p) => postulantIndex.set(p.id, p));

		const officialUsed = new Set();
		const items = estudiantes.map((est) => {
			const tema = normalizeText(est.tema);
			const clave = claveIndex.get(tema);
			if (!clave) return null;
			const postulant = postulantIndex.get(est.postulantId) || {};
			const dni = postulant?.dni || "";
			const puntajeOMR = calcularPuntaje(est.answers, clave, config);
			const oficial = oficiales.get(String(est.litho || "").trim())
				|| oficiales.get(String(postulant?.litho || "").trim())
				|| oficiales.get(String(dni).trim())
				|| oficiales.get(normalizeName(est.postulantName || nombrePostulante(postulant)));
			if (oficial) officialUsed.add(officialIdentity(oficial));
			const carrera = oficial?.carrera || postulant?.carrera || postulant?.carreraNombre || "";
			return {
				nombre: est.postulantName || nombrePostulante(postulant),
				dni,
				puntajeOMR: oficial?.puntaje ?? puntajeOMR,
				enPDF: !!oficial,
				carreraOficial: carrera,
				condicionOficial: oficial?.condicion || "",
				puntajeOficial: oficial?.puntaje ?? null,
				meritoOficial: oficial?.merito || "",
			};
		}).filter(Boolean);

		oficialesRaw.forEach((oficial) => {
			const identity = officialIdentity(oficial);
			if (identity && officialUsed.has(identity)) return;
			items.push({
				nombre: oficial.nombre || "",
				dni: oficial.dni || oficial.codigo || "",
				puntajeOMR: oficial.puntaje ?? null,
				enPDF: true,
				carreraOficial: oficial.carrera || "",
				condicionOficial: oficial.condicion || "",
				puntajeOficial: oficial.puntaje ?? null,
				meritoOficial: oficial.merito || "",
			});
			if (identity) officialUsed.add(identity);
		});

		if (!items.length) return { filas: [], carreras: [], tienePlazas: false };

		// Condición OMR: top N por carrera según plazas (se calcula ANTES de filtrar)
		const plazas = getPlazas();
		const manualPlazas = hasManualPlazas();
		const _tienePlazas = manualPlazas && Object.values(plazas).some((v) => v > 0);
		const porCarreraPlaza = {};
		items.forEach((item) => {
			const c = carreraKey(item.carreraOficial || "");
			if (!porCarreraPlaza[c]) porCarreraPlaza[c] = [];
			porCarreraPlaza[c].push(item);
		});
		Object.values(porCarreraPlaza).forEach((grupo) => {
			const n = getPlazasCarrera(plazas, grupo[0]?.carreraOficial || "");
			if (manualPlazas && n > 0) {
				aplicarVacantesPorPuntaje(grupo, n, true, "puntajeOMR");
				grupo.forEach((item) => { item.condicionOMR = item.condicion; });
			} else {
				grupo.forEach((item) => { item.condicionOMR = item.condicionOficial || "NO INGRESO"; });
			}
		});

		// Carreras únicas (de PDF oficial o del postulante)
		const carrerasSet = uniqueCarreras(items);

		const filtrados = filtroCarrera === "__TODAS__"
			? items
			: items.filter((i) => carreraKey(i.carreraOficial) === carreraKey(filtroCarrera));

		filtrados.sort((a, b) => {
			const ceroDiff = puntajeCeroRank(a) - puntajeCeroRank(b);
			if (ceroDiff !== 0) return ceroDiff;
			const condicionDiff = condicionRank(a) - condicionRank(b);
			if (condicionDiff !== 0) return condicionDiff;
			const meritoA = Number(a.meritoOficial);
			const meritoB = Number(b.meritoOficial);
			if (Number.isFinite(meritoA) && Number.isFinite(meritoB)) return meritoA - meritoB;
			return Number(b.puntajeOMR || 0) - Number(a.puntajeOMR || 0);
		});
		const conMerito = calcularMerito(filtrados);

		return {
			carreras: carrerasSet,
			tienePlazas: _tienePlazas,
			filas: conMerito.map((item, idx) => ({
				sec: pad4(idx + 1),
				merito: pad3(item.merito),
				...item,
			})),
		};
	}, [config, oficiales, oficialesRaw, filtroCarrera]);

	const tieneOficial = oficiales.size > 0;
	const availableColumns = useMemo(
		() => getAvailableColumns({ tieneOficial, tienePlazas }),
		[tieneOficial, tienePlazas]
	);
	const selectedColumns = useMemo(
		() => getSelectedColumns({ selectedColumnKeys, tieneOficial, tienePlazas }),
		[selectedColumnKeys, tieneOficial, tienePlazas]
	);
	const selectedColumnKeySet = useMemo(() => new Set(selectedColumns.map((column) => column.key)), [selectedColumns]);
	const hasSelectedColumns = selectedColumns.length > 0;

	const toggleColumn = (key) => {
		setSelectedColumnKeys((prev) => {
			const activeAvailable = availableColumns.filter((column) => prev.includes(column.key));
			if (prev.includes(key) && activeAvailable.length <= 1) return prev;
			return prev.includes(key)
				? prev.filter((columnKey) => columnKey !== key)
				: [...prev, key];
		});
	};

	const selectAllColumns = () => {
		setSelectedColumnKeys((prev) => [...new Set([...prev, ...availableColumns.map((column) => column.key)])]);
	};

	const handlePrint = () => {
		if (!filas.length || !hasSelectedColumns) return;
		const subtituloReporte = reportSubtitle({ subtitulo, filtroCarrera });
		printHtmlDocument(buildPrintableReport({ titulo, subtitulo: subtituloReporte, filas, columns: selectedColumns, tieneOficial }));
	};

	const handleExportExcel = async () => {
		if (!filas.length || !hasSelectedColumns) return;
		const subtituloReporte = reportSubtitle({ subtitulo, filtroCarrera });
		const dataRows = filas.map((f) => {
			const row = {};
			selectedColumns.forEach((column) => {
				row[column.key] = column.getValue(f, { tieneOficial });
			});
			return row;
		});
		const data = [
			{ [selectedColumns[0].key]: titulo },
			...(subtituloReporte ? [{ [selectedColumns[0].key]: subtituloReporte }] : []),
			{},
			...dataRows,
		];
		await writeRowsToXlsx(
			data,
			selectedColumns.map(({ header, key, width }) => ({ header, key, width })),
			"Resultados",
			filenameForCareer(filtroCarrera)
		);
	};

	return (
		<>
			<style>{PRINT_CSS}</style>
			<div className="dashboard-shell">
				<Header />
				<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

					<div className="export-controls">
						<div className="page-title mb-4">
							<span className="eyebrow">Módulo 3</span>
							<h1 className="display-6 fw-bold mb-2">Exportar resultados</h1>
							<p className="text-light-emphasis mb-0">
								{!tieneOficial
									? <span>Carga el PDF oficial en <strong>Resultados Oficiales</strong> para comparar CONDICIÓN y CARRERA por DNI.</span>
									: `Comparando ${filas.length} postulante(s) con ${oficiales.size} registro(s) del PDF oficial.`}
							</p>
						</div>

						<div className="glass-card p-4 mb-4">
							<p className="section-kicker mb-3">Configuración del reporte</p>
							<div className="row g-3">
								<div className="col-12 col-md-5">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>Título</label>
									<input
										className="form-control"
										value={titulo}
										onChange={(e) => setTitulo(e.target.value)}
										style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc" }}
									/>
								</div>
								<div className="col-12 col-md-4">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>Subtítulo (ciclo, carrera, etc.)</label>
									<input
										className="form-control"
										value={subtitulo}
										onChange={(e) => setSubtitulo(e.target.value)}
										placeholder="Ej: Ingeniería de Sistemas — 2026-I"
										style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc" }}
									/>
								</div>
								<div className="col-12 col-md-3">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>Filtrar por carrera</label>
									<select
										className="form-select"
										value={filtroCarrera}
										onChange={(e) => setFiltroCarrera(e.target.value)}
										style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc" }}
									>
										<option value="__TODAS__">— Todas —</option>
										{carreras.map((c) => <option key={c} value={c}>{c}</option>)}
									</select>
								</div>
							</div>
						</div>

						<div className="glass-card p-4 mb-4">
							<div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
								<p className="section-kicker mb-0">Columnas para exportar</p>
								<button type="button" className="btn btn-sm btn-outline-light" onClick={selectAllColumns}>
									<i className="bi bi-check2-square me-2"></i>Seleccionar todas
								</button>
							</div>
							<div className="row g-2">
								{availableColumns.map((column) => {
									const checked = selectedColumnKeySet.has(column.key);
									return (
										<div className="col-12 col-sm-6 col-lg-4" key={column.key}>
											<label
												className="d-flex align-items-center gap-2 px-3 py-2 rounded-2"
												style={{
													border: "1px solid rgba(148,163,184,0.2)",
													background: checked ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
													color: "#e2e8f0",
													cursor: "pointer",
												}}
											>
												<input
													className="form-check-input m-0"
													type="checkbox"
													checked={checked}
													onChange={() => toggleColumn(column.key)}
												/>
												<span style={{ fontWeight: 600 }}>{column.header}</span>
											</label>
										</div>
									);
								})}
							</div>
						</div>

						<div className="d-flex flex-wrap gap-2 mb-4">
							<button className="btn action-button action-button-primary action-button-success" onClick={handlePrint} disabled={!filas.length || !hasSelectedColumns}>
								<i className="bi bi-printer me-2"></i>Guardar PDF
							</button>
							<button className="btn action-button action-button-secondary" onClick={handleExportExcel} disabled={!filas.length || !hasSelectedColumns}>
								<i className="bi bi-file-earmark-excel me-2"></i>Exportar Excel
							</button>
							{!tieneOficial && (
								<span className="d-flex align-items-center" style={{ color: "#eab308", fontSize: "0.85rem" }}>
									<i className="bi bi-exclamation-triangle me-1"></i>
									Sin PDF oficial cargado — ve a "PDF Oficial" en el menú
								</span>
							)}
						</div>
					</div>

					{/* Títulos para impresión (ocultos en pantalla) */}
					<div className="print-title" style={{ display: "none" }}>{titulo}</div>
					{subtitulo && <div className="print-subtitle" style={{ display: "none" }}>{subtitulo}</div>}

					<div className="glass-card p-0">
						{filas.length === 0 ? (
							<p className="text-light-emphasis p-4 mb-0">
								Sin datos. Importa postulantes, respuestas y claves en el Módulo 2.
							</p>
						) : (
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0" style={{ fontSize: "0.83rem" }}>
									<thead>
										<tr>
											<th style={{ textAlign: "center" }}>SEC</th>
											<th style={{ textAlign: "center" }}>CODIGO</th>
											<th>NOMBRE</th>
											<th>CARRERA</th>
											<th style={{ textAlign: "right" }}>PUNTAJE OMR</th>
											<th style={{ textAlign: "center" }}>MERITO</th>
											{tieneOficial && <>
												<th style={{ textAlign: "right" }}>PUNTAJE OFICIAL</th>
												<th style={{ textAlign: "center" }}>CONDICION PDF</th>
											</>}
										{tienePlazas && <th style={{ textAlign: "center" }}>CONDICIÓN OMR</th>}
										</tr>
									</thead>
									<tbody>
										{filas.map((f) => (
											<tr key={f.sec} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
												<td style={{ textAlign: "center", fontFamily: "monospace", color: "#64748b" }}>{f.sec}</td>
												<td style={{ textAlign: "center", fontFamily: "monospace" }}>{f.dni || "—"}</td>
												<td><strong>{f.nombre}</strong></td>
												<td style={{ fontSize: "0.78rem", color: f.enPDF ? "#cbd5e1" : "#475569" }}>
													{f.carreraOficial || <span style={{ color: "#475569" }}>—</span>}
												</td>
												<td style={{ textAlign: "right", fontFamily: "monospace" }}>
													{formatScore(f.puntajeOMR) || <span style={{ color: "#475569" }}>—</span>}
												</td>
												<td style={{ textAlign: "center", fontFamily: "monospace" }}>
														{(tieneOficial && f.enPDF && f.meritoOficial) ? f.meritoOficial : f.merito}
													</td>
												{tieneOficial && <>
													<td style={{ textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>
														{f.enPDF ? f.puntajeOficial?.toFixed(3) : <span style={{ color: "#475569" }}>No en PDF</span>}
													</td>
													<td style={{ textAlign: "center" }}>
														{!f.enPDF ? (
															<span style={{ color: "#475569", fontSize: "0.75rem" }}>No encontrado</span>
														) : f.condicionOficial === "INGRESO" ? (
															<span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.8rem" }}>INGRESO</span>
														) : (
															<span style={{ color: "#ef4444", fontSize: "0.8rem" }}>NO INGRESO</span>
														)}
													</td>
												</>}
												{tienePlazas && (
													<td style={{ textAlign: "center" }}>
														{f.condicionOMR === "INGRESO" && (
															<span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.8rem" }}>INGRESO</span>
														)}
														{f.condicionOMR === "NO INGRESO" && (
															<span style={{ color: "#ef4444", fontSize: "0.8rem" }}>NO INGRESO</span>
														)}
														{!f.condicionOMR && (
															<span style={{ color: "#475569", fontSize: "0.75rem" }}>—</span>
														)}
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</main>
			</div>
		</>
	);
}

