import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const condicionStyle = (condicion) => {
	switch (String(condicion).toUpperCase()) {
		case "INGRESO":         return { color: "#22c55e", fontWeight: 700 };
		case "NO_INGRESO":
		case "NO INGRESO":     return { color: "#ef4444" };
		case "LISTA_ESPERA":
		case "ESPERA":         return { color: "#eab308" };
		default:               return { color: "#94a3b8" };
	}
};

const nombreCompleto = (p) =>
	[p?.nombres, p?.apellidoPat, p?.apellidoMat].filter(Boolean).join(" ");

const formatFecha = (iso) => {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
	} catch { return iso; }
};

export default function GestResultadosAdmision() {
	const [procesos, setProcesos] = useState([]);
	const [resultados, setResultados] = useState([]);
	const [filtroProceso, setFiltroProceso] = useState("__TODOS__");
	const [filtroCondicion, setFiltroCondicion] = useState("__TODAS__");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updatingId, setUpdatingId] = useState(null);

	const loadResultados = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/resultado-admision");
			setResultados(data || []);
		} catch (err) {
			setError(err.message || "Error al cargar resultados");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		apiRequest("/api/proceso-admision").then(d => setProcesos(d || [])).catch(() => {});
		loadResultados();
	}, []);

	const resultadosFiltrados = useMemo(() => {
		let list = resultados;
		if (filtroProceso !== "__TODOS__") {
			list = list.filter(r => String(r.proceso?.id) === filtroProceso);
		}
		if (filtroCondicion !== "__TODAS__") {
			list = list.filter(r => String(r.condicion) === filtroCondicion);
		}
		return list.sort((a, b) => (a.ordenMerito ?? 9999) - (b.ordenMerito ?? 9999));
	}, [resultados, filtroProceso, filtroCondicion]);

	const condiciones = useMemo(() => {
		const set = new Set(resultados.map(r => r.condicion).filter(Boolean));
		return [...set];
	}, [resultados]);

	const togglePublicado = async (r) => {
		setUpdatingId(r.id);
		setError("");
		try {
			const payload = {
				proceso:          { id: r.proceso?.id },
				inscripcion:      { id: r.inscripcion?.id },
				calificacion:     { id: r.calificacion?.id },
				puntajeFinal:     r.puntajeFinal,
				ordenMerito:      r.ordenMerito,
				condicion:        r.condicion,
				vacanteAmpliada:  r.vacanteAmpliada,
				publicado:        !r.publicado,
				fechaPublicacion: !r.publicado ? new Date().toISOString() : null,
			};
			const updated = await apiRequest(`/api/resultado-admision/${r.id}`, {
				method: "PUT", body: JSON.stringify(payload),
			});
			setResultados(prev => prev.map(x => x.id === r.id ? updated : x));
		} catch (err) {
			setError(`Error al actualizar resultado ${r.id}: ${err.message}`);
		} finally {
			setUpdatingId(null);
		}
	};

	const ingresados  = resultadosFiltrados.filter(r => String(r.condicion).includes("INGRESO") && !String(r.condicion).includes("NO")).length;
	const publicados  = resultadosFiltrados.filter(r => r.publicado).length;

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">

				<div className="page-title mb-4">
					<span className="eyebrow">Calificación — BD</span>
					<h1 className="display-6 fw-bold mb-2">Resultados de admisión</h1>
					<p className="text-light-emphasis mb-0">
						Visualiza y publica los resultados oficiales almacenados en la base de datos.
					</p>
				</div>

				<div className="row g-3 mb-4">
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Total resultados</p>
							<h2 className="metric-value mb-0">{resultadosFiltrados.length}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Con ingreso</p>
							<h2 className="metric-value mb-0" style={{ color: "#22c55e" }}>{ingresados}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Publicados</p>
							<h2 className="metric-value mb-0" style={{ color: "#eab308" }}>{publicados}</h2>
						</div>
					</div>
					<div className="col-sm-3">
						<div className="glass-card p-4">
							<p className="metric-label mb-1">Sin publicar</p>
							<h2 className="metric-value mb-0" style={{ color: "#64748b" }}>
								{resultadosFiltrados.length - publicados}
							</h2>
						</div>
					</div>
				</div>

				{error && <div className="alert alert-danger mb-4">{error}</div>}

				<div className="glass-card p-0">
					<div className="d-flex flex-wrap align-items-center gap-3 px-4 py-3"
						style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
						<select
							className="form-select form-select-sm"
							style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 280 }}
							value={filtroProceso}
							onChange={e => setFiltroProceso(e.target.value)}
						>
							<option value="__TODOS__">— Todos los procesos —</option>
							{procesos.map(p => (
								<option key={p.id} value={p.id}>{p.codigo} — {p.periodo} {p.anio}</option>
							))}
						</select>
						<select
							className="form-select form-select-sm"
							style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc", maxWidth: 200 }}
							value={filtroCondicion}
							onChange={e => setFiltroCondicion(e.target.value)}
						>
							<option value="__TODAS__">— Todas las condiciones —</option>
							{condiciones.map(c => (
								<option key={c} value={c}>{c}</option>
							))}
						</select>
						<span style={{ color: "#64748b", fontSize: "0.82rem" }}>
							{resultadosFiltrados.length} resultado(s)
						</span>
					</div>

					<div className="table-responsive">
						<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
							<thead>
								<tr>
									<th style={{ textAlign: "center" }}>Mérito</th>
									<th>Postulante</th>
									<th>DNI</th>
									<th>Carrera</th>
									<th style={{ textAlign: "right" }}>Puntaje</th>
									<th style={{ textAlign: "center" }}>Condición</th>
									<th style={{ textAlign: "center" }}>Publicado</th>
									<th style={{ width: 100 }}>Fecha pub.</th>
								</tr>
							</thead>
							<tbody>
								{loading && (
									<tr><td colSpan="8" className="text-center text-light-emphasis py-4">Cargando...</td></tr>
								)}
								{!loading && resultadosFiltrados.length === 0 && (
									<tr>
										<td colSpan="8" className="text-center text-light-emphasis py-4">
											No hay resultados registrados en la base de datos.
										</td>
									</tr>
								)}
								{!loading && resultadosFiltrados.map(r => {
									const postulante = r.inscripcion?.postulante;
									const carrera = r.inscripcion?.carrera;
									const isUpdating = updatingId === r.id;
									return (
										<tr key={r.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
											<td style={{ textAlign: "center", fontFamily: "monospace", color: "#64748b" }}>
												{r.ordenMerito ?? "—"}
											</td>
											<td>
												<strong style={{ color: "#e2e8f0" }}>
													{nombreCompleto(postulante) || "—"}
												</strong>
											</td>
											<td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.85rem" }}>
												{postulante?.dni || "—"}
											</td>
											<td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
												{carrera?.nombre || "—"}
											</td>
											<td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#f8fafc" }}>
												{r.puntajeFinal != null ? Number(r.puntajeFinal).toFixed(4) : "—"}
											</td>
											<td style={{ textAlign: "center" }}>
												<span style={{ fontSize: "0.78rem", fontWeight: 600, ...condicionStyle(r.condicion) }}>
													{r.condicion || "—"}
												</span>
												{r.vacanteAmpliada && (
													<span style={{ color: "#eab308", fontSize: "0.68rem", display: "block" }}>ampliada</span>
												)}
											</td>
											<td style={{ textAlign: "center" }}>
												<button
													className={`btn btn-sm ${r.publicado ? "btn-success" : "btn-outline-secondary"}`}
													style={{
														fontSize: "0.72rem",
														padding: "2px 10px",
														borderColor: r.publicado ? "#22c55e" : "rgba(148,163,184,0.3)",
														color: r.publicado ? "#fff" : "#94a3b8",
													}}
													onClick={() => togglePublicado(r)}
													disabled={isUpdating}
													title={r.publicado ? "Despublicar" : "Publicar"}
												>
													{isUpdating ? "..." : r.publicado ? "Publicado" : "Publicar"}
												</button>
											</td>
											<td style={{ fontSize: "0.78rem", color: "#64748b" }}>
												{formatFecha(r.fechaPublicacion)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
}
