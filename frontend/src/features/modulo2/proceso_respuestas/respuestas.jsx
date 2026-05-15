import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useState, useEffect } from "react";

const STORAGE_KEY = "responsesData";

export default function Respuestas() {
	const [items, setItems] = useState(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	});
	const [message, setMessage] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(null);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {}
	}, [items]);

	const parseAnswer = (raw) => {
		if (raw == null) return "";
		const s = String(raw).trim();
		if (s === "") return "";
		// Accept only alternatives A-E (case-insensitive). Examples: "C", "C,1", "C - 1" -> "C"
		const m = s.match(/[A-Ea-e]/);
		return m ? m[0].toUpperCase() : "";
	};

	const handleFileImport = async (file) => {
		setMessage("");
		if (!file) return;
		try {
			const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data, { type: "array" });
			const firstSheet = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheet];
			const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

			// Each row expected to have: TEMA and PREG_001..PREG_100 (or similar)
			const parsed = rows.map((row, idx) => {
				// normalize keys: if header is like "TEMA,C,1" or "PREG_001,C,1",
				// take the first token before commas/semicolons and uppercase it
				const lookup = {};
				Object.keys(row).forEach((k) => {
					const rawKey = String(k || "").trim();
					const key = rawKey.split(/[,;]+/)[0].trim().toUpperCase();
					lookup[key] = row[k];
				});

				const rawTema = lookup["TEMA"] || lookup["TEMAS"] || lookup["TOPIC"] || "";
				const answers = {};
				for (let i = 1; i <= 100; i++) {
					const q = `PREG_${String(i).padStart(3, "0")}`;
					const val = lookup[q] ?? lookup[q.replace("PREG_", "P")] ?? "";
					answers[q] = parseAnswer(val);
				}

				const tema = String(rawTema).trim().toUpperCase();
				return { id: Date.now() + idx, tema, answers };
			});

			setItems((cur) => [...cur, ...parsed]);
			setMessage(`Importados ${parsed.length} filas con hasta 100 respuestas cada una.`);
		} catch (err) {
			console.error(err);
			setMessage("Error al importar. Asegúrate de instalar 'xlsx' y usar un formato válido.");
		}
	};

	const handleDelete = (id) => {
		setItems((cur) => cur.filter((it) => it.id !== id));
		if (selectedIndex != null && items[selectedIndex]?.id === id) setSelectedIndex(null);
	};

	const exportJSON = (entry) => {
		const blob = new Blob([JSON.stringify(entry, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = (entry.tema || "respuestas") + ".json";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Importar respuestas (clave)</h1>
					<p className="text-light-emphasis mb-0">Importa un archivo Excel con columnas TEMA y PREG_001..PREG_100. Cada celda puede contener la alternativa correcta (ej. "C" o "C,1").</p>
				</div>

				<div className="d-flex justify-content-end mb-4">
					<div className="d-flex gap-2">
						<label className="btn action-button action-button-secondary" style={{ cursor: "pointer" }}>
							Importar Excel
							<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileImport(e.target.files?.[0])} style={{ display: "none" }} />
						</label>
						<button className="btn action-button action-button-ghost" onClick={() => { setItems([]); setMessage(""); }}>
							Limpiar
						</button>
					</div>
				</div>

				{message && <div className="mb-3"><span className="text-light-emphasis">{message}</span></div>}

				<div className="row g-3">
					{items.length === 0 && (
						<div className="col-12">
							<article className="glass-card p-4">No hay claves importadas aún. Usa el botón "Importar Excel".</article>
						</div>
					)}

					{items.map((it, idx) => (
						<div className="col-12" key={it.id}>
							<article className="glass-card p-3 d-flex justify-content-between align-items-start">
								<div>
									<h3 className="h6 mb-1">{(it.tema && String(it.tema).toUpperCase()) || `Clave ${idx + 1}`}</h3>
									<p className="mb-0 text-light-emphasis">Respuestas no vacías: {Object.values(it.answers).filter(Boolean).length} / 100</p>
								</div>
								<div className="d-flex gap-2">
									<button className="btn action-button action-button-secondary action-button-sm" onClick={() => setSelectedIndex(idx)}>
										Ver detalle
									</button>
									<button className="btn action-button action-button-ghost action-button-sm" onClick={() => exportJSON(it)}>
										Exportar JSON
									</button>
									<button className="btn action-button action-button-danger action-button-sm" onClick={() => handleDelete(it.id)}>
										Eliminar
									</button>
								</div>
							</article>
						</div>
					))}
				</div>

				{selectedIndex != null && items[selectedIndex] && (
					<div className="glass-card p-3 mt-4">
						<h4 className="h6">Detalle: {(items[selectedIndex].tema && String(items[selectedIndex].tema).toUpperCase()) || `Clave ${selectedIndex + 1}`}</h4>
						<div style={{ overflowX: "auto", fontFamily: "monospace", fontSize: 13 }}>
							{Object.entries(items[selectedIndex].answers).map(([q, a]) => (
								<div key={q} style={{ display: "inline-block", minWidth: 110, padding: 6 }}>
									<strong>{q}</strong>: {a || "-"}
								</div>
							))}
						</div>
						<div className="mt-3">
							<button className="btn action-button action-button-ghost" onClick={() => setSelectedIndex(null)}>Cerrar detalle</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
