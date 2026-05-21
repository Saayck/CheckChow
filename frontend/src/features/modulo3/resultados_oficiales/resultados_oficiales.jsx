import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useState } from "react";

const OFFICIAL_KEY = "officialResultsData";

const saveParsed = (data) => {
	try { localStorage.setItem(OFFICIAL_KEY, JSON.stringify(data)); } catch {}
};

export const getOfficialResults = () => {
	try { return JSON.parse(localStorage.getItem(OFFICIAL_KEY) || "[]"); } catch { return []; }
};

// Agrupa ítems de texto PDF por línea (similar coordenada Y)
const agruparEnLineas = (items, tolerancia = 3) => {
	if (!items.length) return [];
	const sorted = [...items].sort((a, b) => {
		const dy = a.y - b.y;
		return Math.abs(dy) < tolerancia ? a.x - b.x : dy;
	});
	const lineas = [];
	let lineaActual = [sorted[0]];
	for (let i = 1; i < sorted.length; i++) {
		if (Math.abs(sorted[i].y - lineaActual[0].y) < tolerancia) {
			lineaActual.push(sorted[i]);
		} else {
			lineas.push(lineaActual);
			lineaActual = [sorted[i]];
		}
	}
	lineas.push(lineaActual);
	return lineas.map((l) => l.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim());
};

// Intenta detectar si una línea es header de carrera
const esHeaderCarrera = (linea) =>
	/ESCUELA|CARRERA\s+PROFESIONAL|FACULTAD|PROGRAMA/i.test(linea) &&
	!/^\d{4}\s+\d{6}/.test(linea);

const limpiarCarrera = (linea) =>
	linea
		.replace(/ESCUELA\s+PROFESIONAL\s+(DE\s+)?/i, "")
		.replace(/CARRERA\s+PROFESIONAL\s*:?\s*/i, "")
		.replace(/ESCUELA\s+(DE\s+)?/i, "")
		.replace(/PROGRAMA\s+(PROFESIONAL\s+)?(DE\s+)?/i, "")
		.trim();

// Parsea una línea intentando extraer: SEC CODIGO NOMBRE PUNTAJE MERITO CONDICION
const parsearFilaEstudiante = (linea) => {
	// Patrón flexible: empieza con 4 dígitos (SEC), sigue código DNI, luego nombre, puntaje decimal, mérito, condición
	const m = linea.match(
		/^(\d{4})\s+(\d{6,8})\s+(.+?)\s+([\d]{1,6}\.[\d]{1,3})\s+(\d{1,4})\s+(NO\s+INGRESO|INGRESO)/
	);
	if (!m) return null;
	return {
		sec: m[1],
		dni: m[2].trim(),
		nombre: m[3].trim(),
		puntaje: parseFloat(m[4]),
		merito: m[5].trim(),
		condicion: m[6].replace(/\s+/, " ").trim(),
	};
};

export default function ResultadosOficiales() {
	const [loading, setLoading] = useState(false);
	const [mensaje, setMensaje] = useState("");
	const [preview, setPreview] = useState(() => getOfficialResults());
	const [filtroCarrera, setFiltroCarrera] = useState("__TODAS__");

	const carreras = [...new Set(preview.map((r) => r.carrera).filter(Boolean))].sort();

	const handlePdfUpload = async (file) => {
		if (!file) return;
		setLoading(true);
		setMensaje("Cargando PDF...");
		try {
			// Carga dinámica de pdfjs-dist con worker via CDN
			const pdfjsLib = await import("pdfjs-dist");
			pdfjsLib.GlobalWorkerOptions.workerSrc =
				`https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

			const arrayBuffer = await file.arrayBuffer();
			const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
			const pdf = await loadingTask.promise;

			setMensaje(`PDF cargado: ${pdf.numPages} página(s). Extrayendo texto...`);

			const allItems = [];
			for (let p = 1; p <= pdf.numPages; p++) {
				const page = await pdf.getPage(p);
				const viewport = page.getViewport({ scale: 1 });
				const tc = await page.getTextContent();
				tc.items.forEach((item) => {
					if (item.str?.trim()) {
						allItems.push({
							str: item.str,
							x: item.transform[4],
							y: viewport.height - item.transform[5],
							page: p,
						});
					}
				});
			}

			// Agrupar en líneas por página
			const porPagina = {};
			allItems.forEach((it) => {
				if (!porPagina[it.page]) porPagina[it.page] = [];
				porPagina[it.page].push(it);
			});

			const lineas = [];
			Object.keys(porPagina)
				.sort((a, b) => Number(a) - Number(b))
				.forEach((p) => lineas.push(...agruparEnLineas(porPagina[p])));

			// Parsear líneas
			const resultados = [];
			let carreraActual = "";

			for (const linea of lineas) {
				if (!linea) continue;
				if (esHeaderCarrera(linea)) {
					carreraActual = limpiarCarrera(linea);
					continue;
				}
				const fila = parsearFilaEstudiante(linea);
				if (fila) {
					resultados.push({ ...fila, carrera: carreraActual });
				}
			}

			saveParsed(resultados);
			setPreview(resultados);
			setMensaje(
				resultados.length > 0
					? `✓ Extraídos ${resultados.length} registro(s) en ${carreras.length || new Set(resultados.map((r) => r.carrera)).size} carrera(s).`
					: "⚠ No se encontraron filas de estudiantes. Revisa que el PDF tenga texto seleccionable (no escaneado)."
			);
		} catch (err) {
			console.error(err);
			setMensaje(`Error al procesar el PDF: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const filtrados = filtroCarrera === "__TODAS__"
		? preview
		: preview.filter((r) => r.carrera === filtroCarrera);

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Resultados oficiales (PDF)</h1>
					<p className="text-light-emphasis mb-0">
						Carga el PDF oficial de resultados por escuela profesional. Se usará para comparar en la vista de Exportar.
					</p>
				</div>

				<div className="glass-card p-4 mb-4">
					<div className="d-flex flex-wrap align-items-center gap-3">
						<label className="btn action-button action-button-primary" style={{ cursor: "pointer" }}>
							<i className="bi bi-file-earmark-pdf me-2"></i>
							{loading ? "Procesando..." : "Cargar PDF oficial"}
							<input
								type="file"
								accept=".pdf"
								style={{ display: "none" }}
								disabled={loading}
								onChange={(e) => handlePdfUpload(e.target.files?.[0])}
							/>
						</label>
						{preview.length > 0 && (
							<button
								className="btn action-button action-button-ghost action-button-sm"
								onClick={() => { saveParsed([]); setPreview([]); setMensaje("Datos eliminados."); }}
							>
								Limpiar
							</button>
						)}
						{mensaje && (
							<span style={{ color: mensaje.startsWith("✓") ? "#22c55e" : mensaje.startsWith("⚠") ? "#eab308" : "#94a3b8", fontSize: "0.88rem" }}>
								{mensaje}
							</span>
						)}
					</div>
				</div>

				{preview.length > 0 && (
					<>
						<div className="d-flex flex-wrap align-items-center gap-3 mb-3">
							<select
								className="form-select"
								style={{ maxWidth: 340, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc" }}
								value={filtroCarrera}
								onChange={(e) => setFiltroCarrera(e.target.value)}
							>
								<option value="__TODAS__">— Todas las carreras ({preview.length}) —</option>
								{[...new Set(preview.map((r) => r.carrera).filter(Boolean))].sort().map((c) => (
									<option key={c} value={c}>{c} ({preview.filter((r) => r.carrera === c).length})</option>
								))}
							</select>
						</div>

						<div className="glass-card p-0">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0" style={{ fontSize: "0.82rem" }}>
									<thead>
										<tr>
											<th style={{ textAlign: "center" }}>SEC</th>
											<th style={{ textAlign: "center" }}>DNI</th>
											<th>Nombre</th>
											<th>Carrera</th>
											<th style={{ textAlign: "right" }}>Puntaje oficial</th>
											<th style={{ textAlign: "center" }}>Mérito</th>
											<th style={{ textAlign: "center" }}>Condición</th>
										</tr>
									</thead>
									<tbody>
										{filtrados.map((r, i) => (
											<tr key={i} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
												<td style={{ textAlign: "center", fontFamily: "monospace", color: "#64748b" }}>{r.sec}</td>
												<td style={{ textAlign: "center", fontFamily: "monospace" }}>{r.dni}</td>
												<td><strong>{r.nombre}</strong></td>
												<td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{r.carrera || "—"}</td>
												<td style={{ textAlign: "right", fontFamily: "monospace" }}>{r.puntaje?.toFixed(3)}</td>
												<td style={{ textAlign: "center", fontFamily: "monospace" }}>{r.merito}</td>
												<td style={{ textAlign: "center" }}>
													<span style={{ color: r.condicion === "INGRESO" ? "#22c55e" : "#94a3b8", fontWeight: r.condicion === "INGRESO" ? 700 : 400, fontSize: "0.8rem" }}>
														{r.condicion}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
