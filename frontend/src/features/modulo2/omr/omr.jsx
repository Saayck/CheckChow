import { useEffect, useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";
import { readFirstSheetRows } from "../../../utils/excel";

const formatValue = (value) => {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
};

const normalizeHeader = (header) =>
	String(header || "")
		.trim()
		.split(/[,;]+/)[0]
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9_]/g, "");

const getValue = (row, key) => {
	const expected = normalizeHeader(key);
	const found = Object.keys(row).find((k) => normalizeHeader(k) === expected);
	return found ? row[found] : "";
};

const getStoredJson = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
};

const toText = (value) => String(value ?? "").trim();
const toBool = (value) => value === true || String(value ?? "").trim().toLowerCase() === "true" || String(value ?? "").trim() === "1";
const parseAnswer = (value) => {
	const match = String(value ?? "").trim().match(/[A-Ea-e]/);
	return match ? match[0].toUpperCase() : "";
};

const buildRespuestaPayload = (item) => {
	const respuestas = {};
	for (let i = 1; i <= 120; i += 1) {
		const key = `PREG_${String(i).padStart(3, "0")}`;
		const answer = parseAnswer(item.answers?.[key]);
		if (answer) respuestas[i] = answer;
	}
	return {
		lithocode: toText(item.litho),
		codigoTema: toText(item.tema).toUpperCase(),
		anulado: false,
		lecturaDudosa: false,
		observacion: "Sincronizado desde respuestas importadas",
		respuestas,
	};
};

export default function Omr() {
	const [lithocode, setLithocode] = useState("");
	const [union, setUnion] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [procesos, setProcesos] = useState([]);
	const [procesoId, setProcesoId] = useState("");
	const [importing, setImporting] = useState(false);
	const [respuestasLocalCount, setRespuestasLocalCount] = useState(() => getStoredJson("studentResponsesData", []).length);

	useEffect(() => {
		apiRequest("/api/proceso-admision", { redirectOnUnauthorized: false })
			.then((data) => {
				const list = data || [];
				setProcesos(list);
				setProcesoId((current) => current || String(list[0]?.id || ""));
			})
			.catch(() => {});
	}, []);

	const runRequest = async (method) => {
		const code = lithocode.trim();
		if (!code) {
			setMessage("Ingrese un LITHO para consultar o crear la union OMR.");
			return;
		}

		setLoading(true);
		setMessage("");
		try {
			const data = await apiRequest(`/api/omr/union/${encodeURIComponent(code)}`, { method });
			setUnion(data);
			if (method === "POST") {
				setMessage(data?.unionValida ? "Union OMR creada correctamente." : `Union OMR creada con observacion: ${data?.motivoInvalido || "no valida"}.`);
			} else {
				setMessage(data?.persistida ? "Union OMR encontrada." : "Coincidencia calculada. Presione Crear para guardarla.");
			}
		} catch (err) {
			setUnion(null);
			setMessage(err.message || "No se pudo procesar la union OMR.");
		} finally {
			setLoading(false);
		}
	};

	const importIdentificaciones = async (file) => {
		if (!file) return;
		setImporting(true);
		setMessage("");
		try {
			const rows = await readFirstSheetRows(file);
			const payload = rows.map((row) => ({
				lithocode: toText(getValue(row, "LITHO")),
				codigoTema: toText(getValue(row, "TEMA")).toUpperCase(),
				codigo: toText(getValue(row, "CODIGO")),
				sinCodigo: toBool(getValue(row, "NOCODIGO")),
				sinTema: toBool(getValue(row, "NOTEMA")),
				lecturaDudosa: toBool(getValue(row, "DUPCODIGO")) || toBool(getValue(row, "DUPLITHO")),
				observacion: toText(getValue(row, "OBSERVA")),
			})).filter((row) => row.lithocode);
			const query = procesoId ? `?procesoId=${encodeURIComponent(procesoId)}` : "";
			const result = await apiRequest(`/api/omr/identificaciones/import${query}`, {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setMessage(`Identificaciones importadas: ${result.guardados} nuevas, ${result.actualizados} actualizadas, ${result.omitidos} omitidas.`);
		} catch (err) {
			setMessage(err.message || "No se pudo importar identifi.xls.");
		} finally {
			setImporting(false);
		}
	};

	const importRespuestas = async (file) => {
		if (!file) return;
		setImporting(true);
		setMessage("");
		try {
			const rows = await readFirstSheetRows(file);
			const payload = rows.map((row) => {
				const respuestas = {};
				for (let i = 1; i <= 120; i += 1) {
					const key = `PREG_${String(i).padStart(3, "0")}`;
					const answer = parseAnswer(getValue(row, key));
					if (answer) respuestas[i] = answer;
				}
				return {
					lithocode: toText(getValue(row, "LITHO")),
					codigoTema: toText(getValue(row, "TEMA")).toUpperCase(),
					anulado: toText(getValue(row, "NULO")).toUpperCase() === "S" || toBool(getValue(row, "NULO")),
					lecturaDudosa: false,
					observacion: "",
					respuestas,
				};
			}).filter((row) => row.lithocode);
			const query = procesoId ? `?procesoId=${encodeURIComponent(procesoId)}` : "";
			const result = await apiRequest(`/api/omr/respuestas/import${query}`, {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setMessage(`Respuestas importadas: ${result.guardados} nuevas, ${result.actualizados} actualizadas, ${result.omitidos} omitidas.`);
		} catch (err) {
			setMessage(err.message || "No se pudo importar respuest.xls.");
		} finally {
			setImporting(false);
		}
	};

	const syncRespuestasImportadas = async () => {
		setImporting(true);
		setMessage("");
		try {
			const stored = getStoredJson("studentResponsesData", []);
			setRespuestasLocalCount(stored.length);
			const payload = stored
				.map(buildRespuestaPayload)
				.filter((row) => row.lithocode && Object.keys(row.respuestas).length > 0);

			if (payload.length === 0) {
				setMessage("No hay respuestas de estudiantes importadas para sincronizar. Primero importa respuest.xls en Respuestas de estudiantes.");
				return;
			}

			const query = procesoId ? `?procesoId=${encodeURIComponent(procesoId)}` : "";
			const result = await apiRequest(`/api/omr/respuestas/import${query}`, {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setMessage(`Respuestas sincronizadas desde el módulo de respuestas: ${result.guardados} nuevas, ${result.actualizados} actualizadas, ${result.omitidos} omitidas.`);
		} catch (err) {
			setMessage(err.message || "No se pudo sincronizar las respuestas ya importadas.");
		} finally {
			setImporting(false);
		}
	};

	const fields = union ? Object.entries(union) : [];

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Modulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Union OMR</h1>
					<p className="text-light-emphasis mb-0">Importa identifi.xls y une por LITHO. Si las respuestas ya fueron cargadas, sincronízalas desde el módulo de respuestas.</p>
				</div>

				<div className="row g-4">
					<div className="col-lg-4">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Busqueda</p>
							<h2 className="h4 mb-3">LITHO</h2>
							<div className="d-grid gap-3">
								<select className="form-select" value={procesoId} onChange={(event) => setProcesoId(event.target.value)}>
									<option value="">Proceso por defecto</option>
									{procesos.map((p) => (
										<option key={p.id} value={p.id}>{p.codigo} - {p.periodo}</option>
									))}
								</select>
								<input
									className="form-control"
									value={lithocode}
									onChange={(event) => setLithocode(event.target.value)}
									placeholder="Ej: 27297 o 027297"
								/>
								<div className="d-flex gap-2 flex-wrap">
									<button className="btn btn-success" disabled={loading} onClick={() => runRequest("GET")}>
										<i className="bi bi-search"></i> Buscar
									</button>
									<button className="btn btn-glass" disabled={loading} onClick={() => runRequest("POST")}>
										<i className="bi bi-plus-lg"></i> Crear
									</button>
								</div>
								<div className="d-grid gap-2">
									<label className="btn btn-outline-light btn-sm" style={{ cursor: "pointer" }}>
										Importar identifi.xls
										<input type="file" accept=".xls,.xlsx" onChange={(event) => importIdentificaciones(event.target.files?.[0])} style={{ display: "none" }} disabled={importing} />
									</label>
									<button type="button" className="btn btn-outline-light btn-sm" onClick={syncRespuestasImportadas} disabled={importing}>
										Sincronizar respuestas ya importadas ({respuestasLocalCount})
									</button>
									<label className="btn btn-outline-light btn-sm" style={{ cursor: "pointer" }}>
										Importar respuest.xls manualmente
										<input type="file" accept=".xls,.xlsx" onChange={(event) => importRespuestas(event.target.files?.[0])} style={{ display: "none" }} disabled={importing} />
									</label>
								</div>
								{message && <div className="text-light-emphasis">{message}</div>}
							</div>
						</div>
					</div>

					<div className="col-lg-8">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Campo</th>
											<th>Valor</th>
										</tr>
									</thead>
									<tbody>
										{loading && (
											<tr><td colSpan="2" className="text-center text-light-emphasis">Procesando OMR...</td></tr>
										)}
										{!loading && fields.length === 0 && (
											<tr><td colSpan="2" className="text-center text-light-emphasis">No hay datos para mostrar.</td></tr>
										)}
										{!loading && fields.map(([key, value]) => (
											<tr key={key}>
												<td>{key}</td>
												<td style={{ wordBreak: "break-word" }}>{formatValue(value)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
