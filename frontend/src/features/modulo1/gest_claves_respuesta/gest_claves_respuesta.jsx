import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";
import { readFirstSheetRows } from "../../../utils/excel";

const OPCIONES = ["A", "B", "C", "D", "E"];

const selStyle = {
	background: "rgba(255,255,255,0.04)",
	border: "1px solid rgba(148,163,184,0.15)",
	color: "#f8fafc",
};

// Mantiene responsesData en localStorage para que resultados.jsx siga funcionando
const syncLocalStorage = (temaCode, answers) => {
	try {
		const stored = JSON.parse(localStorage.getItem("responsesData") || "[]");
		const rest = stored.filter(x => String(x.tema).toUpperCase() !== temaCode.toUpperCase());
		localStorage.setItem("responsesData", JSON.stringify([
			...rest,
			{ id: Date.now(), tema: temaCode.toUpperCase(), answers },
		]));
	} catch {}
};

const parseAnswer = (raw) => {
	if (raw == null) return "";
	const m = String(raw).trim().match(/[A-Ea-e]/);
	return m ? m[0].toUpperCase() : "";
};

const parseDbf = (arrayBuffer) => {
	const decoder = new TextDecoder("latin1");
	const view = new DataView(arrayBuffer);
	const recordCount = view.getUint32(4, true);
	const headerLength = view.getUint16(8, true);
	const recordLength = view.getUint16(10, true);
	let offset = 32;
	const fields = [];
	while (new Uint8Array(arrayBuffer, offset, 1)[0] !== 0x0D) {
		const name = decoder.decode(new Uint8Array(arrayBuffer, offset, 11)).replace(/\0/g, "").trim();
		const type = decoder.decode(new Uint8Array(arrayBuffer, offset + 11, 1));
		const length = new Uint8Array(arrayBuffer, offset + 16, 1)[0];
		fields.push({ name, type, length });
		offset += 32;
	}
	const records = [];
	for (let i = 0; i < recordCount; i++) {
		const recOffset = headerLength + i * recordLength;
		if (new Uint8Array(arrayBuffer, recOffset, 1)[0] === 0x2A) continue;
		let fOffset = recOffset + 1;
		const rec = {};
		for (const f of fields) {
			rec[f.name] = decoder.decode(new Uint8Array(arrayBuffer, fOffset, f.length)).trim();
			fOffset += f.length;
		}
		records.push(rec);
	}
	return records;
};

const rowToAnswers = (row) => {
	const lookup = {};
	Object.keys(row).forEach(k => {
		const key = String(k).split(/[,;]+/)[0].trim().toUpperCase();
		lookup[key] = row[k];
	});
	const tema = String(lookup["TEMA"] || lookup["TEMAS"] || "").trim().toUpperCase();
	const answers = {};
	for (let i = 1; i <= 100; i++) {
		const q = `PREG_${String(i).padStart(3, "0")}`;
		answers[q] = parseAnswer(lookup[q] ?? lookup[q.replace("PREG_", "P")] ?? "");
	}
	return { tema, answers };
};

export default function GestClavesRespuesta() {
	const [procesos, setProcesos] = useState([]);
	const [temas, setTemas] = useState([]);
	const [claves, setClaves] = useState([]);
	const [selectedProceso, setSelectedProceso] = useState("");
	const [selectedTema, setSelectedTema] = useState("");
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(null);
	const [importing, setImporting] = useState(false);
	const [error, setError] = useState("");
	const [importMsgs, setImportMsgs] = useState([]);

	useEffect(() => {
		apiRequest("/api/proceso-admision").then(d => setProcesos(d || [])).catch(() => {});
		apiRequest("/api/tema").then(d => setTemas(d || [])).catch(() => {});
	}, []);

	const temasFiltrados = useMemo(
		() => temas.filter(t => String(t.proceso?.id) === selectedProceso),
		[temas, selectedProceso]
	);

	const handleSelectProceso = async (id) => {
		setSelectedProceso(id);
		setSelectedTema("");
		setClaves([]);
		setError("");
		setImportMsgs([]);
		if (!id) return;
		setLoading(true);
		try {
			const data = await apiRequest("/api/clave-respuesta");
			const temaIds = new Set(
				temas.filter(t => String(t.proceso?.id) === id).map(t => String(t.id))
			);
			setClaves((data || []).filter(c => temaIds.has(String(c.tema?.id))));
		} catch (err) {
			setError(err.message || "Error al cargar claves");
		} finally {
			setLoading(false);
		}
	};

	// Mapa: temaId → { nroPregunta → clave }
	const clavesByTema = useMemo(() => {
		const m = {};
		claves.forEach(c => {
			const tid = String(c.tema?.id);
			if (!m[tid]) m[tid] = {};
			m[tid][c.nroPregunta] = c;
		});
		return m;
	}, [claves]);

	const claveMap = useMemo(
		() => (selectedTema ? clavesByTema[selectedTema] || {} : {}),
		[clavesByTema, selectedTema]
	);

	const temaObj = useMemo(() => temas.find(t => String(t.id) === selectedTema), [temas, selectedTema]);
	const totalPreguntas = temaObj?.totalPreguntas || 100;
	const questions = useMemo(() => Array.from({ length: totalPreguntas }, (_, i) => i + 1), [totalPreguntas]);

	// ── IMPORTACIÓN MASIVA ──────────────────────────────────────────────────────
	const handleFileImport = async (file) => {
		if (!file || !selectedProceso) return;
		setImporting(true);
		setError("");
		setImportMsgs([]);

		// 1. Parsear archivo
		let rows = [];
		const ext = file.name.split(".").pop().toLowerCase();
		try {
			if (ext === "xlsx" || ext === "xls") {
				const json = await readFirstSheetRows(file);
				rows = json.map(rowToAnswers);
			} else {
				const data = await file.arrayBuffer();
				rows = parseDbf(data).map(rowToAnswers);
			}
		} catch (err) {
			setError("Error al leer el archivo: " + (err.message || ""));
			setImporting(false);
			return;
		}

		// 2. Para cada fila, buscar el tema en BD y guardar claves
		const msgs = [];
		let allNewClaves = [...claves];
		const currentTemas = temas.filter(t => String(t.proceso?.id) === selectedProceso);

		for (const row of rows) {
			if (!row.tema) continue;
			let temaEntity = currentTemas.find(t => t.codigo.toUpperCase() === row.tema);

			if (!temaEntity) {
				// Auto-crear el tema en BD
				try {
					const nonEmpty = Object.values(row.answers).filter(v => v !== "").length;
					const created = await apiRequest("/api/tema", {
						method: "POST",
						body: JSON.stringify({
							proceso: { id: Number(selectedProceso) },
							codigo: row.tema,
							descripcion: `Tema ${row.tema}`,
							totalPreguntas: nonEmpty > 0 ? nonEmpty : 100,
							activo: true,
						}),
					});
					temaEntity = created;
					currentTemas.push(created);
					setTemas(prev => [...prev, created]);
					msgs.push({
						status: "success",
						text: `Tema "${row.tema}" creado automáticamente en la BD.`,
					});
				} catch (err) {
					syncLocalStorage(row.tema, row.answers);
					msgs.push({
						status: "warning",
						text: `Tema "${row.tema}" no se pudo crear en BD (${err.message}). Guardado solo localmente.`,
					});
					continue;
				}
			}

			const existingMap = clavesByTema[String(temaEntity.id)] || {};
			const entries = Object.entries(row.answers).filter(([, v]) => v !== "");

			// 3. Guardar en paralelo (POST o PUT)
			const promises = entries.map(([q, respuesta]) => {
				const nroPregunta = parseInt(q.replace("PREG_", ""));
				const existing = existingMap[nroPregunta];
				const payload = {
					tema: { id: temaEntity.id },
					nroPregunta,
					respuestaCorrecta: respuesta,
					formula: false,
				};
				if (existing) {
					return apiRequest(`/api/clave-respuesta/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) });
				}
				return apiRequest("/api/clave-respuesta", { method: "POST", body: JSON.stringify(payload) });
			});

			const results = await Promise.allSettled(promises);
			const saved = results.filter(r => r.status === "fulfilled").length;
			const failed = results.filter(r => r.status === "rejected").length;
			const newClavesForTema = results.filter(r => r.status === "fulfilled").map(r => r.value);

			// Actualizar lista local de claves
			allNewClaves = [
				...allNewClaves.filter(c => String(c.tema?.id) !== String(temaEntity.id)),
				...newClavesForTema,
			];

			syncLocalStorage(row.tema, row.answers);

			msgs.push({
				status: failed === 0 ? "success" : "partial",
				text: `Tema "${row.tema}": ${saved}/${entries.length} claves guardadas en BD${failed > 0 ? ` (${failed} fallaron)` : ""}. localStorage actualizado.`,
			});
		}

		setClaves(allNewClaves);
		setImportMsgs(msgs);
		setImporting(false);
	};

	// ── EDICIÓN MANUAL ──────────────────────────────────────────────────────────
	const persist = async (nroPregunta, respuestaCorrecta, formula) => {
		if (!respuestaCorrecta && !formula) return;
		const existing = claveMap[nroPregunta];
		const payload = {
			tema: { id: Number(selectedTema) },
			nroPregunta,
			respuestaCorrecta: formula ? (existing?.respuestaCorrecta || "A") : respuestaCorrecta,
			formula,
		};
		setSaving(nroPregunta);
		setError("");
		try {
			let saved;
			if (existing) {
				saved = await apiRequest(`/api/clave-respuesta/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) });
			} else {
				saved = await apiRequest("/api/clave-respuesta", { method: "POST", body: JSON.stringify(payload) });
			}
			setClaves(prev => {
				const updated = prev.findIndex(c => c.nroPregunta === nroPregunta && String(c.tema?.id) === selectedTema) >= 0
					? prev.map(c => (c.nroPregunta === nroPregunta && String(c.tema?.id) === selectedTema) ? saved : c)
					: [...prev, saved];
				// Sync localStorage con el estado actualizado de este tema
				if (temaObj?.codigo) {
					const group = {};
					updated.filter(c => String(c.tema?.id) === selectedTema).forEach(c => { group[c.nroPregunta] = c; });
					const answers = {};
					for (let i = 1; i <= 100; i++) {
						const q = `PREG_${String(i).padStart(3, "0")}`;
						answers[q] = group[i]?.respuestaCorrecta || "";
					}
					syncLocalStorage(temaObj.codigo, answers);
				}
				return updated;
			});
		} catch (err) {
			setError(`Pregunta ${nroPregunta}: ${err.message || "Error al guardar"}`);
		} finally {
			setSaving(null);
		}
	};

	const handleRespuesta = (n, value) => { if (value) persist(n, value, claveMap[n]?.formula || false); };
	const handleFormula = (n, value) => persist(n, claveMap[n]?.respuestaCorrecta || "A", value);

	const handleDeleteClave = async (n) => {
		const existing = claveMap[n];
		if (!existing) return;
		setSaving(n);
		try {
			await apiRequest(`/api/clave-respuesta/${existing.id}`, { method: "DELETE" });
			setClaves(prev => prev.filter(c => !(c.nroPregunta === n && String(c.tema?.id) === selectedTema)));
		} catch (err) {
			setError(`Error al limpiar pregunta ${n}: ${err.message}`);
		} finally {
			setSaving(null);
		}
	};

	const handleLimpiarTema = async () => {
		const clavesDelTema = claves.filter(c => String(c.tema?.id) === selectedTema);
		if (clavesDelTema.length === 0) return;
		if (!window.confirm(`¿Eliminar las ${clavesDelTema.length} claves del Tema ${temaObj?.codigo}?`)) return;
		setError("");
		setSaving("bulk");
		try {
			await Promise.allSettled(
				clavesDelTema.map(c => apiRequest(`/api/clave-respuesta/${c.id}`, { method: "DELETE" }))
			);
			setClaves(prev => prev.filter(c => String(c.tema?.id) !== selectedTema));
			if (temaObj?.codigo) syncLocalStorage(temaObj.codigo, {});
		} catch (err) {
			setError(`Error al limpiar tema: ${err.message}`);
		} finally {
			setSaving(null);
		}
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

				<div className="page-title mb-4">
					<span className="eyebrow">Examen</span>
					<h1 className="display-6 fw-bold mb-2">Claves de respuesta</h1>
					<p className="text-light-emphasis mb-0">
						Importa CLAVES.DBF o Excel del OMR (guarda en BD + local), o edita manualmente pregunta a pregunta.
					</p>
				</div>

				{/* ── SELECTOR + IMPORTAR ── */}
				<div className="glass-card p-4 mb-4">
					<div className="row g-3 align-items-end">
						<div className="col-md-6">
							<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>
								Proceso de admisión
							</label>
							<select className="form-select" style={selStyle}
								value={selectedProceso} onChange={e => handleSelectProceso(e.target.value)}>
								<option value="">— Seleccionar proceso —</option>
								{procesos.map(p => (
									<option key={p.id} value={p.id}>{p.codigo} — {p.periodo} {p.anio}</option>
								))}
							</select>
						</div>
						<div className="col-md-6">
							<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>
								Importar desde OMR
								<span style={{ color: "#64748b", fontWeight: 400, marginLeft: 6, fontSize: "0.82rem" }}>
									(requiere proceso seleccionado)
								</span>
							</label>
							<label className={`btn btn-glass w-100 ${!selectedProceso || importing ? "disabled" : ""}`}
								style={{ cursor: selectedProceso && !importing ? "pointer" : "default" }}>
								{importing
									? <><span className="spinner-border spinner-border-sm me-2"></span>Importando...</>
									: <><i className="bi bi-upload me-2"></i>Importar DBF / Excel</>
								}
								<input type="file" accept=".dbf,.xls,.xlsx" style={{ display: "none" }}
									disabled={!selectedProceso || importing}
									onChange={e => { handleFileImport(e.target.files?.[0]); e.target.value = ""; }} />
							</label>
						</div>
					</div>
				</div>

				{/* ── MENSAJES DE IMPORTACIÓN ── */}
				{importMsgs.length > 0 && (
					<div className="mb-4">
						{importMsgs.map((m, i) => (
							<div key={i} className={`alert alert-${m.status === "warning" ? "warning" : m.status === "partial" ? "warning" : "success"} mb-2 py-2`}
								style={{ fontSize: "0.85rem" }}>
								{m.text}
							</div>
						))}
					</div>
				)}

				{error && <div className="alert alert-danger mb-4">{error}</div>}

				{/* ── TARJETAS DE TEMAS ── */}
				{!selectedProceso && !loading && (
					<div className="glass-card p-4 text-center">
						<p className="text-light-emphasis mb-0">
							<i className="bi bi-key-fill me-2" style={{ color: "#64748b" }}></i>
							Selecciona un proceso para ver y gestionar sus claves.
						</p>
					</div>
				)}

				{selectedProceso && !loading && temasFiltrados.length === 0 && (
					<div className="glass-card p-4 mb-4 text-center">
						<p className="text-light-emphasis mb-0">
							<i className="bi bi-info-circle me-2"></i>
							No hay temas para este proceso.{" "}
							Ve a <strong style={{ color: "#cbd5e1" }}>Administración → Temas</strong> para crearlos.
						</p>
					</div>
				)}

				{loading && <p className="text-center text-light-emphasis py-4">Cargando claves...</p>}

				{selectedProceso && temasFiltrados.length > 0 && !loading && (
					<div className="row g-3 mb-4">
						{temasFiltrados.map(t => {
							const group = clavesByTema[String(t.id)] || {};
							const count = Object.keys(group).length;
							const anuladas = Object.values(group).filter(c => c.formula).length;
							const isSelected = selectedTema === String(t.id);
							return (
								<div className="col-sm-6 col-lg-3" key={t.id}>
									<div
										className="glass-card p-3 h-100"
										style={{
											cursor: "pointer",
											border: isSelected
												? "1px solid rgba(34,197,94,0.45)"
												: "1px solid rgba(148,163,184,0.08)",
											transition: "border 0.15s",
										}}
										onClick={() => setSelectedTema(prev => prev === String(t.id) ? "" : String(t.id))}
									>
										<div className="d-flex justify-content-between align-items-start">
											<div>
												<p className="metric-label mb-1" style={{ fontSize: "0.7rem" }}>TEMA</p>
												<h3 className="h4 mb-1" style={{ color: "#f8fafc", fontFamily: "monospace" }}>{t.codigo}</h3>
												{t.descripcion && <p className="mb-1" style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.descripcion}</p>}
												<p className="mb-0" style={{ fontSize: "0.78rem", color: "#64748b" }}>
													{count}/{t.totalPreguntas} claves
													{anuladas > 0 && <span style={{ color: "#a78bfa", marginLeft: 6 }}>{anuladas} anuladas</span>}
												</p>
											</div>
											<div>
												{count >= t.totalPreguntas
													? <i className="bi bi-check-circle-fill" style={{ color: "#22c55e" }}></i>
													: count > 0
														? <i className="bi bi-clock-fill" style={{ color: "#eab308" }}></i>
														: <i className="bi bi-dash-circle" style={{ color: "#475569" }}></i>
												}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* ── GRILLA DE EDICIÓN MANUAL ── */}
				{selectedTema && (
					<div className="glass-card p-0">
						<div className="px-4 py-3 d-flex justify-content-between align-items-center"
							style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
							<span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
								Edición manual — Tema{" "}
								<strong style={{ color: "#f8fafc" }}>{temaObj?.codigo}</strong>
								<span style={{ color: "#64748b", marginLeft: 12, fontSize: "0.78rem" }}>
									{Object.keys(claveMap).length}/{totalPreguntas} preguntas con clave
								</span>
							</span>
							<div className="d-flex align-items-center gap-3">
								<span style={{ color: "#64748b", fontSize: "0.75rem" }}>
									<i className="bi bi-info-circle me-1"></i>Los cambios se guardan al instante
								</span>
								{Object.keys(claveMap).length > 0 && (
									<button
										className="btn btn-sm btn-outline-danger"
										onClick={handleLimpiarTema}
										disabled={saving === "bulk"}
										style={{ fontSize: "0.75rem", padding: "2px 10px", borderColor: "rgba(239,68,68,0.4)", color: "#ef4444" }}
									>
										{saving === "bulk"
											? <><span className="spinner-border spinner-border-sm me-1"></span>Limpiando...</>
											: <><i className="bi bi-trash me-1"></i>Limpiar tema</>
										}
									</button>
								)}
							</div>
						</div>
						<div className="table-responsive" style={{ maxHeight: 520, overflowY: "auto" }}>
							<table className="table table-dark table-borderless align-middle mb-0" style={{ fontSize: "0.84rem" }}>
								<thead style={{ position: "sticky", top: 0, background: "#0f172a", zIndex: 1 }}>
									<tr>
										<th style={{ color: "#64748b" }}>Pregunta</th>
										<th>Respuesta correcta</th>
										<th style={{ textAlign: "center" }}>Anulada</th>
										<th style={{ width: 60 }}></th>
									</tr>
								</thead>
								<tbody>
									{questions.map(n => {
										const c = claveMap[n];
										const isSaving = saving === n;
										return (
											<tr key={n} style={{ borderBottom: "1px solid rgba(148,163,184,0.04)" }}>
												<td style={{ color: "#64748b", fontFamily: "monospace", fontSize: "0.8rem" }}>
													PREG_{String(n).padStart(3, "0")}
													{isSaving && <span style={{ color: "#94a3b8", marginLeft: 8, fontSize: "0.7rem" }}>guardando…</span>}
												</td>
												<td>
													{c?.formula ? (
														<span style={{ color: "#a78bfa", fontSize: "0.78rem" }}>—</span>
													) : (
														<select className="form-select form-select-sm"
															style={{ ...selStyle, maxWidth: 90, color: c?.respuestaCorrecta ? "#f8fafc" : "#475569" }}
															value={c?.respuestaCorrecta || ""}
															onChange={e => handleRespuesta(n, e.target.value)}
															disabled={isSaving}>
															<option value="">—</option>
															{OPCIONES.map(o => <option key={o} value={o}>{o}</option>)}
														</select>
													)}
												</td>
												<td style={{ textAlign: "center" }}>
													<input type="checkbox" checked={c?.formula || false}
														onChange={e => handleFormula(n, e.target.checked)}
														disabled={isSaving}
														style={{ accentColor: "#a78bfa", width: 16, height: 16, cursor: "pointer" }} />
												</td>
												<td>
													{c && !isSaving && (
														<button className="btn btn-sm btn-danger" onClick={() => handleDeleteClave(n)} title="Limpiar">
															<i className="bi bi-x"></i>
														</button>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
