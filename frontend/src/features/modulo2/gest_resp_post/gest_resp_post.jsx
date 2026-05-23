import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useEffect, useRef, useState } from "react";

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



	const handleFileImport = async (file) => {
		setMessage("");
		if (!file) return;

		const ext = file.name.split('.').pop().toLowerCase();

		if (ext === 'xlsx' || ext === 'xls') {
			try {
				const currentPostulants = getStoredJson(POSTULANTS_KEY, []);
				const freshIndex = buildPostulantIndex(currentPostulants);
				const { read, utils } = await import('xlsx');
				const data = await file.arrayBuffer();
				const workbook = read(data, { type: 'array' });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const json = utils.sheet_to_json(sheet, { defval: '' });

				let imported = 0, skipped = 0;
				const validRows = [];
				json.forEach((row, index) => {
					const lookup = {};
					Object.keys(row).forEach((k) => (lookup[String(k).trim().toUpperCase()] = row[k]));
					const litho = normalizeMatchValue(lookup['LITHO'] ?? '');
					const tema = normalizeMatchValue(lookup['TEMA'] ?? '');
					const match = litho && tema ? freshIndex.get(`${litho}__${tema}`) : null;
					if (!match) { skipped++; return; }
					const answers = {};
					for (let i = 1; i <= 100; i++) {
						const q = `PREG_${String(i).padStart(3, '0')}`;
						answers[q] = parseAlternative(lookup[q] ?? '');
					}
					validRows.push({ id: Date.now() + index, litho, tema, postulantId: match.id, postulantName: match.names, answers });
					imported++;
				});
				setResponses((current) => [...current, ...validRows]);
				setSelectedId(validRows[0]?.id ?? null);
				setMessage(`Importados ${imported} registro(s) desde Excel. Omitidos: ${skipped}.`);
			} catch (err) {
				console.error(err);
				setMessage("Error al importar el Excel.");
			}
			return;
		}

		// Helper: simple DBF parser (browser-safe)
		const parseDbf = (arrayBuffer) => {
			const decoder = new TextDecoder('latin1');
			const view = new DataView(arrayBuffer);
			const recordCount = view.getUint32(4, true);
			const headerLength = view.getUint16(8, true);
			const recordLength = view.getUint16(10, true);
			let offset = 32;
			const fields = [];
			while (new Uint8Array(arrayBuffer, offset, 1)[0] !== 0x0D) {
				const nameBytes = new Uint8Array(arrayBuffer, offset, 11);
				const name = decoder.decode(nameBytes).replace(/\0/g, '').trim();
				const type = decoder.decode(new Uint8Array(arrayBuffer, offset + 11, 1));
				const length = new Uint8Array(arrayBuffer, offset + 16, 1)[0];
				const decimal = new Uint8Array(arrayBuffer, offset + 17, 1)[0];
				fields.push({ name, type, length, decimal });
				offset += 32;
			}

			const records = [];
			let recordStart = headerLength;
			for (let i = 0; i < recordCount; i++) {
				const recOffset = recordStart + i * recordLength;
				const deletionFlag = new Uint8Array(arrayBuffer, recOffset, 1)[0];
				if (deletionFlag === 0x2A) continue;
				let fieldOffset = recOffset + 1;
				const rec = {};
				for (const f of fields) {
					const raw = new Uint8Array(arrayBuffer, fieldOffset, f.length);
					const text = decoder.decode(raw).trim();
					switch (f.type) {
						case 'C':
							rec[f.name] = text;
							break;
						case 'N':
							rec[f.name] = text === '' ? null : Number(text.trim());
							break;
						case 'D':
							rec[f.name] = text.length === 8 ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}` : text;
							break;
						case 'L':
							rec[f.name] = ['Y', 'y', 'T', 't'].includes(text[0]);
							break;
						default:
							rec[f.name] = text;
					}
					fieldOffset += f.length;
				}
				records.push(rec);
			}
			return records;
		};

		try {
			const currentPostulants = getStoredJson(POSTULANTS_KEY, []);
			const freshIndex = buildPostulantIndex(currentPostulants);
			const data = await file.arrayBuffer();
			let rows = null;
			try {
				const lib = await import(/* webpackChunkName: "dbf" */ "dbf");
				if (lib) {
					if (typeof lib.parse === 'function') rows = lib.parse(data) || [];
					else if (typeof lib.default === 'function') rows = lib.default(data) || [];
				}
			} catch (e) {
				rows = null;
			}

			if (!rows) rows = parseDbf(data);

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
			setMessage("Error al importar el archivo. Usa un DBF válido o instala la dependencia 'dbf'.");
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
	const detalleRef = useRef(null);

	useEffect(() => {
		if (selectedId && detalleRef.current) {
			detalleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [selectedId]);

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
						Importar DBF / Excel
						<input type="file" accept=".dbf,.xlsx,.xls" onChange={(e) => handleFileImport(e.target.files?.[0])} style={{ display: "none" }} />
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
					<div className="col-12 col-lg-5 order-1 order-lg-0">
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

					<div className="col-12 col-lg-7 order-0 order-lg-1" ref={detalleRef}>
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
