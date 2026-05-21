import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState } from "react";
import { getConfig } from "../configuracion_calificacion/configuracion_calificacion";
import { getOfficialResults } from "../resultados_oficiales/resultados_oficiales";
import { getPlazas } from "../plazas/plazas";

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

const buildPrintableReport = ({ titulo, subtitulo, filas, tieneOficial, tienePlazas }) => {
	const headers = [
		"SEC",
		"CODIGO",
		"NOMBRE",
		"CARRERA",
		"PUNTAJE OMR",
		"MERITO",
		...(tieneOficial ? ["PUNTAJE OFICIAL", "CONDICION PDF"] : []),
		...(tienePlazas ? ["CONDICION OMR"] : []),
	];

	const bodyRows = filas.map((f) => {
		const cells = [
			f.sec,
			f.dni || "-",
			f.nombre,
			f.carreraOficial || "-",
			formatScore(f.puntajeOMR),
			(tieneOficial && f.enPDF && f.meritoOficial) ? f.meritoOficial : f.merito,
			...(tieneOficial ? [
				f.enPDF ? formatScore(f.puntajeOficial) : "No en PDF",
				!f.enPDF ? "No encontrado" : f.condicionOficial || "-",
			] : []),
			...(tienePlazas ? [f.condicionOMR || "Sin plazas"] : []),
		];
		return `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
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
		td:nth-child(1), td:nth-child(2), td:nth-child(6), td:nth-child(8) { text-align: center; }
		td:nth-child(5), td:nth-child(7) { text-align: right; font-family: Consolas, monospace; }
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
		<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
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

	const oficiales = useMemo(() => {
		const raw = getOfficialResults();
		const index = new Map();
		raw.forEach((r) => {
			if (r.dni) index.set(String(r.dni).trim(), r);
		});
		return index;
	}, []);

	const { filas, carreras, tienePlazas } = useMemo(() => {
		const postulants = getStored("postulantsData");
		const estudiantes = getStored("studentResponsesData");
		const claves = getStored("responsesData");
		if (!claves.length || !estudiantes.length) return { filas: [], carreras: [], tienePlazas: false };

		const claveIndex = new Map();
		claves.forEach((c) => claveIndex.set(String(c.tema).trim().toUpperCase(), c.answers));

		const postulantIndex = new Map();
		postulants.forEach((p) => postulantIndex.set(p.id, p));

		const items = estudiantes.map((est) => {
			const tema = String(est.tema).trim().toUpperCase();
			const clave = claveIndex.get(tema);
			if (!clave) return null;
			const postulant = postulantIndex.get(est.postulantId);
			const dni = postulant?.dni || "";
			const puntajeOMR = calcularPuntaje(est.answers, clave, config);
			const oficial = oficiales.get(String(dni).trim());
			return {
				nombre: est.postulantName,
				dni,
				puntajeOMR,
				enPDF: !!oficial,
				carreraOficial: oficial?.carrera || postulant?.carrera || "",
				condicionOficial: oficial?.condicion || "",
				puntajeOficial: oficial?.puntaje ?? null,
				meritoOficial: oficial?.merito || "",
			};
		}).filter(Boolean);

		// Condición OMR: top N por carrera según plazas (se calcula ANTES de filtrar)
		const plazas = getPlazas();
		const _tienePlazas = Object.values(plazas).some((v) => v > 0);
		const porCarreraPlaza = {};
		items.forEach((item) => {
			const c = item.carreraOficial || "";
			if (!porCarreraPlaza[c]) porCarreraPlaza[c] = [];
			porCarreraPlaza[c].push(item);
		});
		Object.entries(porCarreraPlaza).forEach(([carrera, grupo]) => {
			grupo.sort((a, b) => b.puntajeOMR - a.puntajeOMR);
			const n = plazas[carrera] || 0;
			grupo.forEach((item, idx) => {
				item.condicionOMR = n > 0 ? (idx < n ? "INGRESO" : "NO INGRESO") : null;
			});
		});

		// Carreras únicas (de PDF oficial o del postulante)
		const carrerasSet = [...new Set(
			items.map((i) => i.carreraOficial).filter(Boolean)
		)].sort();

		const filtrados = filtroCarrera === "__TODAS__"
			? items
			: items.filter((i) => i.carreraOficial === filtroCarrera);

		filtrados.sort((a, b) => b.puntajeOMR - a.puntajeOMR);
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
	}, [config, oficiales, filtroCarrera]);

	const tieneOficial = oficiales.size > 0;

	const handlePrint = () => {
		if (!filas.length) return;
		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			window.print();
			return;
		}
		printWindow.document.open();
		printWindow.document.write(buildPrintableReport({ titulo, subtitulo, filas, tieneOficial, tienePlazas }));
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	};

	const handleExportExcel = async () => {
		if (!filas.length) return;
		const { utils, writeFile } = await import("xlsx");
		const dataRows = filas.map((f) => {
			const row = {
				SEC: f.sec,
				CODIGO: f.dni,
				NOMBRE: f.nombre,
				CARRERA: f.carreraOficial || "",
				"PUNTAJE OMR": formatScore(f.puntajeOMR),
				MERITO: (tieneOficial && f.enPDF && f.meritoOficial) ? f.meritoOficial : f.merito,
			};
			if (tieneOficial) {
				row["PUNTAJE OFICIAL"] = f.enPDF ? formatScore(f.puntajeOficial) : "";
				row["CONDICION PDF"] = f.condicionOficial || (f.enPDF ? "—" : "No en PDF");
			}
			if (tienePlazas) {
				row["CONDICION OMR"] = f.condicionOMR || "Sin plazas";
			}
			return row;
		});
		const data = [
			{ SEC: titulo },
			...(subtitulo ? [{ SEC: subtitulo }] : []),
			{},
			...dataRows,
		];
		const ws = utils.json_to_sheet(data);
		ws["!cols"] = [
			{ wch: 7 }, { wch: 12 }, { wch: 38 }, { wch: 30 },
			{ wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 12 },
		];
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "Resultados");
		writeFile(wb, "resultados.xlsx");
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

						<div className="d-flex flex-wrap gap-2 mb-4">
							<button className="btn action-button action-button-primary action-button-success" onClick={handlePrint} disabled={!filas.length}>
								<i className="bi bi-printer me-2"></i>Guardar PDF
							</button>
							<button className="btn action-button action-button-secondary" onClick={handleExportExcel} disabled={!filas.length}>
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
													{f.puntajeOMR.toFixed(3)}
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

