import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState, useEffect, useRef } from "react";
import { readFirstSheetRows } from "../../../utils/excel";
import { apiRequest } from "../../../utils/api";
import { getOfficialResults, normalizeText } from "../../../utils/admissionImport";

const initialPostulants = [];

export default function GestPostulantes() {
	const getInitialPostulants = () => {
		try {
			const stored = localStorage.getItem("postulantsData");
			return stored ? JSON.parse(stored) : initialPostulants;
		} catch {
			return initialPostulants;
		}
	};

	const [postulants, setPostulants] = useState(getInitialPostulants);
	const [editingId, setEditingId] = useState(null);
	const [formVisible, setFormVisible] = useState(false);
	const emptyForm = useMemo(() => ({ names: "", dni: "", litho: "", tema: "", carrera: "", apellidoPat: "", apellidoMat: "" }), []);
	const [formData, setFormData] = useState(emptyForm);
	const [importMessage, setImportMessage] = useState("");
	const [dbSaveResult, setDbSaveResult] = useState(null);
	const [carreras, setCarreras] = useState([]);
	const formRef = useRef(null);

	useEffect(() => {
		apiRequest("/api/carrera").then(d => setCarreras(d || [])).catch(() => {});
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem("postulantsData", JSON.stringify(postulants));
		} catch {}
	}, [postulants]);

	useEffect(() => {
		if (formVisible && formRef.current) {
			formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [formVisible, editingId]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
	};

	const resetForm = () => {
		setFormData(emptyForm);
		setEditingId(null);
		setFormVisible(false);
	};

	const handleAddClick = () => {
		setFormData(emptyForm);
		setEditingId(null);
		setFormVisible(true);
	};

	const handleEditClick = (postulant) => {
		setFormData({ names: postulant.names, dni: postulant.dni, litho: postulant.litho || "", tema: postulant.tema || "", carrera: postulant.carrera || "", apellidoPat: postulant.apellidoPat || "", apellidoMat: postulant.apellidoMat || "" });
		setEditingId(postulant.id);
		setFormVisible(true);
	};

	const handleDeleteClick = (dni) => {
		setPostulants((current) => {
			const target = current.find((postulant) => postulant.dni === dni);
			if (target?.id === editingId) {
				resetForm();
			}
			return current.filter((postulant) => postulant.dni !== dni);
		});
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (editingId) {
			setPostulants((current) => current.map((postulant) => (postulant.id === editingId ? { ...postulant, ...formData } : postulant)));
		} else {
			setPostulants((current) => [
				...current,
				{
					...formData,
					id: Date.now(),
				},
			]);
		}

		resetForm();
	};

	// Separa "APELLIDO1 APELLIDO2, NOMBRES" → { nombres, apellidoPat, apellidoMat }
	const splitNombre = (nombreCompleto) => {
		if (!nombreCompleto) return { nombres: "", apellidoPat: "", apellidoMat: "" };
		if (nombreCompleto.includes(",")) {
			const [apellidos, nms] = nombreCompleto.split(",", 2);
			const parts = apellidos.trim().split(/\s+/);
			return {
				nombres:    nms.trim(),
				apellidoPat: parts[0] || "",
				apellidoMat: parts[1] || "",
			};
		}
		const parts = nombreCompleto.trim().split(/\s+/);
		return {
			apellidoPat: parts[0] || "",
			apellidoMat: parts[1] || "",
			nombres:     parts.slice(2).join(" "),
		};
	};

	// Intenta encontrar la carrera más parecida
	const matchCarrera = (rawValue) => {
		if (!rawValue) return null;
		const v = normalizeText(rawValue);
		return carreras.find(c =>
			normalizeText(c.codigo) === v ||
			normalizeText(c.nombre) === v ||
			normalizeText(c.nombre).includes(v) ||
			v.includes(normalizeText(c.nombre))
		) || null;
	};

	const normalizeDni = (dni) => String(dni || "").replace(/\s+/g, "").trim().toUpperCase();

	const enrichWithOfficialPdf = (rows) => {
		const oficiales = getOfficialResults();
		console.log("[enrichWithOfficialPdf] Datos oficiales:", oficiales.length, oficiales.slice(0, 2));
		if (!oficiales.length) {
			setImportMessage("⚠ No hay datos del PDF oficial cargados. Primero carga el PDF en Módulo 3 → Resultados oficiales.");
			return { rows, enriched: 0 };
		}

		// Crear mapa con DNI normalizado
		const byDni = new Map();
		oficiales.forEach((item) => {
			const dniKey = normalizeDni(item.dni);
			byDni.set(dniKey, item);
			console.log("[enrichWithOfficialPdf] Agregando DNI:", dniKey, "nombre:", item.nombre, "carrera:", item.carrera);
		});

		let enriched = 0;
		const updated = rows.map((row) => {
			const dniKey = normalizeDni(row.dni);
			const oficial = byDni.get(dniKey);
			console.log("[enrichWithOfficialPdf] Buscando:", dniKey, "encontrado:", !!oficial);
			if (!oficial) return row;

			let cambios = 0;
			const result = { ...row };

			// Rellenar carrera (siempre si existe en oficial)
			if (oficial.carrera && (!result.carrera || result.carrera === "")) {
				result.carrera = oficial.carrera;
				cambios += 1;
				console.log("[enrichWithOfficialPdf] Rellenando carrera:", oficial.carrera);
			}

			// Rellenar nombre (siempre si existe en oficial)
			if (oficial.nombre && (!result.names || result.names === "")) {
				result.names = oficial.nombre;
				cambios += 1;
				console.log("[enrichWithOfficialPdf] Rellenando nombre:", oficial.nombre);
			}

			// Rellenar apellidos separando del nombre oficial
			if (oficial.nombre && (!result.apellidoPat || result.apellidoPat === "")) {
				const split = splitNombre(oficial.nombre);
				if (split.apellidoPat) {
					result.apellidoPat = split.apellidoPat;
					cambios += 1;
				}
			}

			if (oficial.nombre && (!result.apellidoMat || result.apellidoMat === "")) {
				const split = splitNombre(oficial.nombre);
				if (split.apellidoMat) {
					result.apellidoMat = split.apellidoMat;
					cambios += 1;
				}
			}

			if (cambios > 0) enriched += 1;
			return result;
		});

		console.log("[enrichWithOfficialPdf] Total enriquecidos:", enriched);
		return { rows: updated, enriched };
	};

	const handleCompletarDesdePdf = async () => {
		const oficiales = getOfficialResults();
		console.log("=== DEPURACIÓN ===");
		console.log("Postulantes importados:", postulants.slice(0, 3));
		console.log("Datos oficiales:", oficiales.slice(0, 3));
		
		const { rows, enriched } = enrichWithOfficialPdf(postulants);
		
		if (!enriched) {
			setImportMessage("No se encontraron datos faltantes para completar desde el PDF oficial.");
			return;
		}
		setPostulants(rows);
		setImportMessage(`✓ Se completaron ${enriched} registro(s) desde el PDF oficial.`);
		await saveToDb(rows);
	};

	const saveToDb = async (rows) => {
		setDbSaveResult(null);
		const sinCarrera = new Set();
		const payload = rows
			.filter(r => r.dni)
			.map(r => {
				const matched = matchCarrera(r.carrera);
				if (r.carrera && !matched) sinCarrera.add(r.carrera);
				// Usar apellidos del fichero si existen; si no, separar del nombre completo
				const hasAp = r.apellidoPat || r.apellidoMat;
				const split = hasAp ? null : splitNombre(r.names);
				return {
					dni:         r.dni,
					nombres:     hasAp ? r.names      : split.nombres,
					apellidoPat: hasAp ? r.apellidoPat : split.apellidoPat,
					apellidoMat: hasAp ? r.apellidoMat : split.apellidoMat,
					carrera:     matched ? matched.codigo : (r.carrera || ""),
					litho:       r.litho,
					tema:        r.tema,
				};
			});
		try {
			const saved = await apiRequest("/api/postulante/import", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setDbSaveResult({
				ok: true,
				saved: saved?.length ?? 0,
				total: rows.length,
				sinCarrera: [...sinCarrera],
			});
		} catch (err) {
			setDbSaveResult({ ok: false, msg: err.message });
		}
	};

	const handleFileImport = async (file) => {
		setImportMessage("");
		setDbSaveResult(null);
		if (!file) return;

		const ext = file.name.split('.').pop().toLowerCase();

		if (ext === 'xls') {
			setImportMessage("El formato .xls no está soportado. Usa un archivo .xlsx o .dbf.");
			return;
		}

		if (ext === 'xlsx') {
			try {
				const json = await readFirstSheetRows(file);
				const rows = json.map((row, idx) => {
					const lookup = {};
					Object.keys(row).forEach((k) => (lookup[String(k).trim().toUpperCase()] = row[k]));
					const str = (key) => String(lookup[key] ?? '').trim();
					return {
						id:          Date.now() + idx,
						dni:         str('DNI'),
						names:       str('NOMBRE') || str('NOMBRES') || str('NAME'),
						apellidoPat: str('APELLIDO_PAT') || str('AP_PAT') || str('APELLIDO1'),
						apellidoMat: str('APELLIDO_MAT') || str('AP_MAT') || str('APELLIDO2'),
						litho:       str('LITHO') || str('LITHOCODIGO') || str('LITHO_CODIGO') || str('CODIGO') || str('COD_POSTULANTE'),
						tema:        str('TEMA'),
						carrera:     str('CARRERA') || str('ESCUELA') || str('ESPEC') || str('ESCOLA') || str('ESPECIALIDAD'),
					};
				});
				const enriched = enrichWithOfficialPdf(rows);
				setPostulants((current) => [...current, ...enriched.rows]);
				setImportMessage(`Importados ${rows.length} registros desde Excel.${enriched.enriched ? ` Carreras completadas desde PDF: ${enriched.enriched}.` : ""}`);
				await saveToDb(enriched.rows);
			} catch (err) {
				console.error(err);
				setImportMessage("Error al importar el Excel.");
			}
			return;
		}

		// Helper: simple DBF parser (browser-safe) as fallback
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
				if (deletionFlag === 0x2A) continue; // deleted
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
			const data = await file.arrayBuffer();
			let json = null;
			try {
				const lib = await import(/* webpackChunkName: "dbf" */ "dbf");
				if (lib) {
					// attempt common APIs, otherwise fallback
					if (typeof lib.parse === 'function') {
						json = lib.parse(data) || [];
					} else if (typeof lib.default === 'function') {
						json = lib.default(data) || [];
					}
				}
			} catch (e) {
				// library not available or failed to parse; use fallback
				json = null;
			}

			if (!json) {
				json = parseDbf(data);
			}

			// Normalizar campos: DNI, NOMBRE, APELLIDOS, LITHO, TEMA, CARRERA
			const rows = json.map((row, idx) => {
				const keys = Object.keys(row || {});
				const mapKey = (k) => (k ? k.toString().trim().toUpperCase() : '');
				const lookup = {};
				keys.forEach((k) => (lookup[mapKey(k)] = row[k]));
				const get = (...ks) => { for (const k of ks) { if (lookup[k]) return String(lookup[k]).trim(); } return ''; };

				return {
					id:          Date.now() + idx,
					dni:         get('DNI', 'CODIGO'),
					names:       get('NOMBRE', 'NOMBRES', 'NAME'),
					apellidoPat: get('APELLIDO_PAT', 'AP_PAT', 'APELLIDO1'),
					apellidoMat: get('APELLIDO_MAT', 'AP_MAT', 'APELLIDO2'),
					litho:       get('LITHO', 'LITHOCODIGO', 'LITHO_CODIGO', 'COD_POSTULANTE'),
					tema:        get('TEMA'),
					carrera:     get('CARRERA', 'ESCUELA', 'ESPEC', 'ESCOLA', 'ESPECIALIDAD', 'COD_ESC'),
				};
			});

			const enriched = enrichWithOfficialPdf(rows);
			setPostulants((current) => [...current, ...enriched.rows]);
			setImportMessage(`Importados ${rows.length} registros correctamente.${enriched.enriched ? ` Carreras completadas desde PDF: ${enriched.enriched}.` : ""}`);
			await saveToDb(enriched.rows);
		} catch (err) {
			console.error(err);
			setImportMessage("Error al importar el archivo. Usa un DBF válido o instala la dependencia 'dbf'.");
		}
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Ficha de postulantes universitarios</h1>
					<p className="text-light-emphasis mb-0">Gestiona postulantes: DNI, NOMBRE, APELLIDOS, LITHO y TEMA.</p>
				</div>

				<div className="d-flex justify-content-end mb-4">
					<div className="d-flex gap-2">
						<button type="button" className="btn action-button action-button-primary" onClick={handleAddClick}>
							Añadir postulante
						</button>
						<label className="btn action-button action-button-secondary" style={{ cursor: 'pointer' }}>
							Importar DBF / Excel
							<input type="file" accept=".dbf,.xlsx" onChange={(e) => handleFileImport(e.target.files?.[0])} style={{ display: 'none' }} />
						</label>
						<button type="button" className="btn action-button action-button-secondary" onClick={handleCompletarDesdePdf}>
							Completar datos desde PDF
						</button>
						<button type="button" className="btn action-button action-button-ghost" onClick={() => { setPostulants([]); setImportMessage(""); }}>
							Limpiar
						</button>
					</div>
				</div>

				{formVisible && (
					<div className="glass-card postulant-form-card p-4 mb-4" ref={formRef}>
						<div className="d-flex justify-content-between align-items-start gap-3 mb-3">
							<div>
								<p className="section-kicker mb-1">{editingId ? "Editar postulante" : "Nuevo postulante"}</p>
								<h2 className="h5 mb-0">Datos de la ficha</h2>
							</div>
							<button type="button" className="btn action-button action-button-ghost action-button-sm" onClick={resetForm}>
								Cerrar
							</button>
						</div>

						<form className="row g-3 postulant-form" onSubmit={handleSubmit}>
							<div className="col-md-6">
								<label className="form-label">Nombres</label>
								<input className="form-control" name="names" value={formData.names} onChange={handleChange} placeholder="Ej: Juan Carlos" required />
							</div>
							<div className="col-md-3">
								<label className="form-label">DNI</label>
								<input className="form-control" name="dni" value={formData.dni} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">LITHO</label>
								<input className="form-control" name="litho" value={formData.litho} onChange={handleChange} />
							</div>
							<div className="col-md-4">
								<label className="form-label">Apellido paterno</label>
								<input className="form-control" name="apellidoPat" value={formData.apellidoPat} onChange={handleChange} placeholder="Ej: García" />
							</div>
							<div className="col-md-4">
								<label className="form-label">Apellido materno</label>
								<input className="form-control" name="apellidoMat" value={formData.apellidoMat} onChange={handleChange} placeholder="Ej: López" />
							</div>

							<div className="col-md-4">
								<label className="form-label">TEMA</label>
								<input className="form-control" name="tema" value={formData.tema} onChange={handleChange} />
							</div>

							<div className="col-12">
								<label className="form-label">Carrera / Escuela profesional</label>
								<input className="form-control" name="carrera" value={formData.carrera} onChange={handleChange} placeholder="Ej: Ingeniería de Sistemas" />
							</div>

							<div className="col-12 d-flex gap-2 justify-content-end">
								<button type="button" className="btn action-button action-button-ghost" onClick={resetForm}>
									Cancelar
								</button>
								<button type="submit" className="btn action-button action-button-primary action-button-success">
									{editingId ? "Guardar cambios" : "Agregar postulante"}
								</button>
							</div>
						</form>
					</div>
				)}

				{importMessage && (
					<div className="mb-2 d-flex align-items-center gap-2">
						<span className="text-light-emphasis">{importMessage}</span>
					</div>
				)}
				{dbSaveResult && (
					<div className={`alert alert-${dbSaveResult.ok ? (dbSaveResult.saved === dbSaveResult.total ? "success" : "warning") : "danger"} mb-3 py-2`}
						style={{ fontSize: "0.85rem" }}>
						{dbSaveResult.ok ? (
							<>
								<i className={`bi ${dbSaveResult.saved === dbSaveResult.total ? "bi-check-circle" : "bi-exclamation-triangle"} me-2`}></i>
								<strong>{dbSaveResult.saved} de {dbSaveResult.total}</strong> postulantes guardados en BD.
								{dbSaveResult.sinCarrera?.length > 0 && (
									<>
										{" "}Los postulantes omitidos tienen carreras que no coinciden en la BD:{" "}
										{dbSaveResult.sinCarrera.map(c => (
											<span key={c} className="badge bg-secondary me-1">{c}</span>
										))}.
										{" "}Regístralas en <strong>Administración → Carreras</strong> con esos mismos códigos/nombres.
									</>
								)}
								{dbSaveResult.saved < dbSaveResult.total && !dbSaveResult.sinCarrera?.length && (
									<> Los demás ya existían (DNI duplicado).</>
								)}
							</>
						) : (
							<><i className="bi bi-x-circle me-2"></i>Error al guardar en BD: {dbSaveResult.msg}</>
						)}
					</div>
				)}

				<div className="d-flex justify-content-between align-items-center mb-2 px-1">
					<span style={{ color: "#64748b", fontSize: "0.85rem" }}>{postulants.length} postulante(s) registrado(s)</span>
				</div>

				<div className="glass-card p-0">
					{postulants.length === 0 ? (
						<p className="text-light-emphasis p-4 mb-0">No hay postulantes registrados.</p>
					) : (
						<div className="table-responsive">
							<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
								<thead>
									<tr>
										<th>#</th>
										<th>Nombres</th>
										<th>Ap. Paterno</th>
										<th>Ap. Materno</th>
										<th>DNI</th>
										<th>LITHO</th>
										<th>TEMA</th>
										<th>Carrera</th>
										<th style={{ width: 120 }}>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{postulants.map((postulant, idx) => (
										<tr key={postulant.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
											<td style={{ color: "#64748b" }}>{idx + 1}</td>
											<td><strong>{postulant.names?.includes(",") ? postulant.names.split(",")[1].trim() : postulant.names}</strong></td>
											<td style={{ fontSize: "0.9rem" }}>{postulant.apellidoPat || <span style={{ color: "#475569" }}>—</span>}</td>
											<td style={{ fontSize: "0.9rem" }}>{postulant.apellidoMat || <span style={{ color: "#475569" }}>—</span>}</td>
											<td style={{ fontFamily: "monospace" }}>{postulant.dni}</td>
											<td>{postulant.litho || <span style={{ color: "#475569" }}>—</span>}</td>
											<td>{postulant.tema || <span style={{ color: "#475569" }}>—</span>}</td>
											<td style={{ fontSize: "0.82rem" }}>{postulant.carrera || <span style={{ color: "#475569" }}>—</span>}</td>
											<td>
												<div className="d-flex gap-2">
													<button
														type="button"
														className="btn action-button action-button-secondary action-button-sm"
														onClick={() => handleEditClick(postulant)}
													>
														Editar
													</button>
													<button
														type="button"
														className="btn action-button action-button-danger action-button-sm"
														onClick={() => handleDeleteClick(postulant.dni)}
													>
														Eliminar
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
