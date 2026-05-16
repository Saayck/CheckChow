import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "studentResponsesData";
const POSTULANTS_KEY = "postulantsData";

const parseAlternative = (value) => {
	if (value == null) return "";
	const text = String(value).trim();
	if (!text) return "";
	const match = text.match(/[A-Ea-e]/);
	return match ? match[0].toUpperCase() : "";
};

const normalizeMatchValue = (value) => {
	const text = String(value ?? "").trim().toUpperCase();
	if (!text) return "";
	if (/^\d+$/.test(text)) {
		return text.replace(/^0+(?=\d)/, "");
	}
	return text;
};

const normalizeHeader = (header) =>
	String(header || "")
		.trim()
		.split(/[,;]+/)[0]
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9_]/g, "");

const getLookupValue = (lookup, expectedKey) => {
	const normalizedExpected = normalizeHeader(expectedKey);
	const keys = Object.keys(lookup);
	const foundKey = keys.find((key) => normalizeHeader(key) === normalizedExpected || normalizeHeader(key).startsWith(normalizedExpected));
	return foundKey ? lookup[foundKey] : "";
};

const getStoredJson = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
};

const buildPostulantIndex = (postulants) => {
	const index = new Map();
	postulants.forEach((postulant) => {
		const litho = normalizeMatchValue(postulant.litho);
		const tema = normalizeMatchValue(postulant.tema);
		if (!litho || !tema) return;
		index.set(`${litho}__${tema}`, postulant);
	});
	return index;
};

export default function GestRespPost() {
	const [postulants, setPostulants] = useState(() => getStoredJson(POSTULANTS_KEY, []));
	const [responses, setResponses] = useState(() => getStoredJson(STORAGE_KEY, []));
	const [message, setMessage] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
		} catch {}
	}, [responses]);

	useEffect(() => {
		try {
			setPostulants(getStoredJson(POSTULANTS_KEY, []));
		} catch {}
	}, []);

	const postulantIndex = useMemo(() => buildPostulantIndex(postulants), [postulants]);

	const handleFileImport = async (file) => {
		setMessage("");
		if (!file) return;

		try {
			const currentPostulants = getStoredJson(POSTULANTS_KEY, []);
			const freshIndex = buildPostulantIndex(currentPostulants);
			const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data, { type: "array" });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

			let imported = 0;
			let skipped = 0;
			const validRows = [];

			rows.forEach((row, index) => {
				const lookup = {};
				Object.keys(row).forEach((key) => {
					const normalized = normalizeHeader(key);
					lookup[normalized] = row[key];
				});

				const litho = normalizeMatchValue(getLookupValue(lookup, "LITHO"));
				const tema = normalizeMatchValue(getLookupValue(lookup, "TEMA"));
				const match = litho && tema ? freshIndex.get(`${litho}__${tema}`) : null;

				if (!match) {
					skipped += 1;
					return;
				}

				const answers = {};
				for (let i = 1; i <= 100; i += 1) {
					const questionKey = `PREG_${String(i).padStart(3, "0")}`;
					answers[questionKey] = parseAlternative(getLookupValue(lookup, questionKey));
				}

				validRows.push({
					id: Date.now() + index,
					litho,
					tema,
					postulantId: match.id,
					postulantName: match.names,
					answers,
				});
				imported += 1;
			});

			setResponses((current) => [...current, ...validRows]);
			setSelectedId(validRows[0]?.id ?? null);
				setMessage(
					`Importados ${imported} registro(s) válidos. Se omitieron ${skipped} fila(s) sin coincidencia de LITHO y TEMA.` +
					(skipped > 0
						? postulants.length === 0
							? " No hay postulantes cargados en la tabla de referencia."
							: " Revisa que los postulantes ya existan y que LITHO/TEMA coincidan exactamente."
						: "")
				);
		} catch (error) {
			console.error(error);
			setMessage("Error al importar el archivo. Verifica que exista 'xlsx' y que el Excel tenga LITHO, TEMA y PREG_001..PREG_100.");
		}
	};

	const handleDelete = (id) => {
		setResponses((current) => current.filter((item) => item.id !== id));
		if (selectedId === id) setSelectedId(null);
	};

	const handleClear = () => {
		setResponses([]);
		setMessage("");
		setSelectedId(null);
	};

	const selectedResponse = responses.find((item) => item.id === selectedId) || null;

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Importar respuestas de estudiantes</h1>
					<p className="text-light-emphasis mb-0">
						Solo se registran las filas que coinciden con un postulante existente por <strong>LITHO</strong> y <strong>TEMA</strong>.
						El Excel debe traer <strong>LITHO</strong> y <strong>PREG_001</strong>.. <strong>PREG_100</strong>.
					</p>
				</div>

				<div className="d-flex flex-wrap justify-content-end gap-2 mb-4">
					<label className="btn action-button action-button-secondary" style={{ cursor: "pointer" }}>
						Importar Excel
						<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileImport(e.target.files?.[0])} style={{ display: "none" }} />
					</label>
					<button type="button" className="btn action-button action-button-ghost" onClick={handleClear}>
						Limpiar
					</button>
				</div>

				{message && (
					<div className="mb-3">
						<span className="text-light-emphasis">{message}</span>
					</div>
				)}

				<div className="row g-4">
					<div className="col-12 col-lg-5">
						<div className="glass-card p-4 h-100">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h2 className="h5 mb-0">Respuestas registradas</h2>
								<span className="status-pill status-success">{responses.length}</span>
							</div>

							{responses.length === 0 ? (
								<p className="text-light-emphasis mb-0">Aún no hay respuestas importadas.</p>
							) : (
								<div className="d-grid gap-3">
									{responses.map((item) => (
										<article key={item.id} className="glass-card p-3">
											<div className="d-flex justify-content-between align-items-start gap-3">
												<div>
													<p className="section-kicker mb-1">{item.litho}</p>
													<h3 className="h6 mb-1">{item.postulantName}</h3>
													<p className="mb-0 text-light-emphasis">TEMA: {item.tema}</p>
												</div>
												<div className="d-flex flex-wrap gap-2">
													<button type="button" className="btn action-button action-button-secondary action-button-sm" onClick={() => setSelectedId(item.id)}>
														Ver
													</button>
													<button type="button" className="btn action-button action-button-danger action-button-sm" onClick={() => handleDelete(item.id)}>
														Eliminar
													</button>
												</div>
											</div>
										</article>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="col-12 col-lg-7">
						<div className="glass-card p-4 h-100">
							<h2 className="h5 mb-3">Detalle de respuestas</h2>
							{selectedResponse ? (
								<>
									<div className="mb-3">
										<p className="mb-1"><strong>Postulante:</strong> {selectedResponse.postulantName}</p>
										<p className="mb-1"><strong>LITHO:</strong> {selectedResponse.litho}</p>
										<p className="mb-0"><strong>TEMA:</strong> {selectedResponse.tema}</p>
									</div>
									<div style={{ overflowX: "auto" }}>
										<table className="table table-sm align-middle mb-0">
											<thead>
												<tr>
													<th>Pregunta</th>
													<th>Alternativa</th>
												</tr>
											</thead>
											<tbody>
												{Object.entries(selectedResponse.answers).map(([question, answer]) => (
													<tr key={question}>
														<td>{question}</td>
														<td>{answer || "-"}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</>
							) : (
								<p className="text-light-emphasis mb-0">Selecciona un registro para ver sus 100 respuestas.</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
