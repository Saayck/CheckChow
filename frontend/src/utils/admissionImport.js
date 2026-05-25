import { apiRequest } from "./api";

const OFFICIAL_KEY = "officialResultsData";

export const normalizeText = (value) =>
	String(value || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^A-Za-z0-9]+/g, " ")
		.trim()
		.replace(/\s+/g, " ")
		.toUpperCase();

const codeFromName = (prefix, name, used = new Set()) => {
	const words = normalizeText(name).split(" ").filter(Boolean);
	const initials = words.map((w) => w[0]).join("").slice(0, 7) || "GEN";
	let base = `${prefix}${initials}`.slice(0, 10);
	let code = base;
	let idx = 1;
	while (used.has(code)) {
		const suffix = String(idx++);
		code = `${base.slice(0, 10 - suffix.length)}${suffix}`;
	}
	used.add(code);
	return code;
};

export const saveOfficialResults = (data) => {
	try { localStorage.setItem(OFFICIAL_KEY, JSON.stringify(data)); } catch {}
};

export const getOfficialResults = () => {
	try { return JSON.parse(localStorage.getItem(OFFICIAL_KEY) || "[]"); } catch { return []; }
};

export const parseAdmissionMetadata = (lines) => {
	const text = lines.slice(0, 80).join(" ");
	const periodo = text.match(/\b(20\d{2})\s*[-–]\s*([IVX]{1,4})\b/i);
	const tipoLine = lines.find((l) => /CEPU|ORDINARIO|EXTRAORDINARIO|ADMISI[OÓ]N/i.test(l)) || "";
	let tipoProcesoAdmision = "";
	if (/CEPU/i.test(tipoLine)) tipoProcesoAdmision = "CEPU";
	else if (/EXTRAORDINARIO/i.test(tipoLine)) tipoProcesoAdmision = "EXTRAORDINARIO";
	else if (/ORDINARIO/i.test(tipoLine)) tipoProcesoAdmision = "ORDINARIO";
	return {
		periodo: periodo ? `${periodo[1]}-${periodo[2].toUpperCase()}` : "",
		anio: periodo ? Number(periodo[1]) : null,
		tipoProcesoAdmision,
	};
};

export const detectVacantes = (linea) => {
	const match = linea.match(/VACANTES?\s*[:-]?\s*(\d{1,4})/i) || linea.match(/\b(\d{1,4})\s+VACANTES?\b/i);
	return match ? Number(match[1]) : null;
};

export const upsertOfficialImport = async ({ resultados, metadata, procesoId, setMensaje }) => {
	if (!procesoId) throw new Error("Selecciona un proceso de admision antes de sincronizar.");

	const requestOptions = { redirectOnUnauthorized: false };
	const [facultadesRaw, carrerasRaw, vacantesRaw, procesosRaw] = await Promise.all([
		apiRequest("/api/facultad", requestOptions),
		apiRequest("/api/carrera", requestOptions),
		apiRequest("/api/vacante", requestOptions),
		apiRequest("/api/proceso-admision", requestOptions),
	]);

	const facultades = facultadesRaw || [];
	const carreras = carrerasRaw || [];
	const vacantes = vacantesRaw || [];
	const procesos = procesosRaw || [];
	const proceso = procesos.find((p) => String(p.id) === String(procesoId));
	if (!proceso) throw new Error("Proceso de admision no encontrado.");

	if (metadata?.tipoProcesoAdmision && proceso.tipoProcesoAdmision !== metadata.tipoProcesoAdmision) {
		await apiRequest(`/api/proceso-admision/${proceso.id}`, {
			method: "PUT",
			redirectOnUnauthorized: false,
			body: JSON.stringify({ ...proceso, tipoProcesoAdmision: metadata.tipoProcesoAdmision }),
		});
	}

	const usedFacCodes = new Set(facultades.map((f) => f.codigo));
	const usedCarCodes = new Set(carreras.map((c) => c.codigo));
	const facultadByName = new Map(facultades.map((f) => [normalizeText(f.nombre), f]));
	const carreraByName = new Map(carreras.map((c) => [normalizeText(c.nombre), c]));
	const vacanteByCarrera = new Map(
		vacantes
			.filter((v) => String(v.proceso?.id) === String(procesoId))
			.map((v) => [String(v.carrera?.id), v])
	);

	const grupos = new Map();
	resultados.forEach((r) => {
		const carreraNombre = r.carrera || "SIN CARRERA";
		if (!grupos.has(carreraNombre)) {
			grupos.set(carreraNombre, { carrera: carreraNombre, facultad: r.facultad || "SIN FACULTAD", total: 0, ingreso: 0, vacantesPdf: r.vacantesPdf || null });
		}
		const grupo = grupos.get(carreraNombre);
		grupo.total += 1;
		if (r.condicion === "INGRESO") grupo.ingreso += 1;
		if (r.vacantesPdf) grupo.vacantesPdf = r.vacantesPdf;
	});

	let facultadesCreadas = 0;
	let carrerasCreadas = 0;
	let vacantesGuardadas = 0;

	for (const grupo of grupos.values()) {
		const facKey = normalizeText(grupo.facultad);
		let facultad = facultadByName.get(facKey);
		if (!facultad) {
			facultad = await apiRequest("/api/facultad", {
				method: "POST",
				redirectOnUnauthorized: false,
				body: JSON.stringify({
					codigo: codeFromName("F", grupo.facultad, usedFacCodes),
					nombre: grupo.facultad,
					activo: true,
				}),
			});
			facultadByName.set(facKey, facultad);
			facultadesCreadas += 1;
		}

		const carKey = normalizeText(grupo.carrera);
		let carrera = carreraByName.get(carKey);
		if (!carrera) {
			carrera = await apiRequest("/api/carrera", {
				method: "POST",
				redirectOnUnauthorized: false,
				body: JSON.stringify({
					codigo: codeFromName("C", grupo.carrera, usedCarCodes),
					nombre: grupo.carrera,
					activo: true,
					facultad: { id: facultad.id },
				}),
			});
			carreraByName.set(carKey, carrera);
			carrerasCreadas += 1;
		}

		const vacantesCalculadas = grupo.vacantesPdf === null || grupo.vacantesPdf === undefined
			? grupo.ingreso
			: Number(grupo.vacantesPdf);
		if (vacantesCalculadas > 0) {
			const existente = vacanteByCarrera.get(String(carrera.id));
			const payload = {
				proceso: { id: Number(procesoId) },
				carrera: { id: carrera.id },
				vacantes: vacantesCalculadas,
				permiteAmpliacion: true,
			};
			if (existente) {
				await apiRequest(`/api/vacante/${existente.id}`, {
					method: "PUT",
					redirectOnUnauthorized: false,
					body: JSON.stringify(payload),
				});
			} else {
				await apiRequest("/api/vacante", {
					method: "POST",
					redirectOnUnauthorized: false,
					body: JSON.stringify(payload),
				});
			}
			vacantesGuardadas += 1;
		}

		if (setMensaje) {
			setMensaje(`Sincronizando ${vacantesGuardadas}/${grupos.size} carrera(s)...`);
		}
	}

	return {
		facultadesCreadas,
		carrerasCreadas,
		vacantesGuardadas,
		ingresantes: resultados.filter((r) => r.condicion === "INGRESO").length,
	};
};

export const importTemasFromDbf = async ({ file, procesoId }) => {
	if (!file) return { created: 0, skipped: 0 };
	if (!procesoId) throw new Error("Selecciona un proceso de admision antes de importar temas.");

	const arrayBuffer = await file.arrayBuffer();
	let records = null;
	try {
		const lib = await import(/* webpackChunkName: "dbf" */ "dbf");
		if (typeof lib.parse === "function") records = lib.parse(arrayBuffer) || [];
		else if (typeof lib.default === "function") records = lib.default(arrayBuffer) || [];
	} catch {
		records = null;
	}
	if (!records) {
		const decoder = new TextDecoder("latin1");
		const view = new DataView(arrayBuffer);
		const recordCount = view.getUint32(4, true);
		const headerLength = view.getUint16(8, true);
		const recordLength = view.getUint16(10, true);
		const fields = [];
		let offset = 32;
		while (new Uint8Array(arrayBuffer, offset, 1)[0] !== 0x0D) {
			const nameBytes = new Uint8Array(arrayBuffer, offset, 11);
			const name = decoder.decode(nameBytes).replace(/\0/g, "").trim();
			const length = new Uint8Array(arrayBuffer, offset + 16, 1)[0];
			fields.push({ name, length });
			offset += 32;
		}
		records = [];
		for (let i = 0; i < recordCount; i += 1) {
			let pos = headerLength + i * recordLength + 1;
			const row = {};
			fields.forEach((field) => {
				const bytes = new Uint8Array(arrayBuffer, pos, field.length);
				row[field.name] = decoder.decode(bytes).trim();
				pos += field.length;
			});
			records.push(row);
		}
	}
	const temas = new Set();

	(records || []).forEach((row) => {
		const raw = row.TEMA ?? row.Tema ?? row.tema ?? row.TIPOTEMA ?? row.TIPO_TEMA;
		const codigo = String(raw || "").trim().toUpperCase();
		if (codigo) temas.add(codigo.slice(0, 5));
	});

	const existentes = await apiRequest("/api/tema", { redirectOnUnauthorized: false });
	const existingCodes = new Set(
		(existentes || [])
			.filter((t) => String(t.proceso?.id) === String(procesoId))
			.map((t) => String(t.codigo).toUpperCase())
	);

	let created = 0;
	let skipped = 0;
	for (const codigo of temas) {
		if (existingCodes.has(codigo)) {
			skipped += 1;
			continue;
		}
		await apiRequest("/api/tema", {
			method: "POST",
			redirectOnUnauthorized: false,
			body: JSON.stringify({
				proceso: { id: Number(procesoId) },
				codigo,
				descripcion: `Importado desde ${file.name}`,
				totalPreguntas: 100,
				activo: true,
			}),
		});
		created += 1;
	}

	return { created, skipped };
};
