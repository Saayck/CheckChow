import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo } from "react";
import { getConfig } from "../configuracion_calificacion/configuracion_calificacion";

const getStored = (key) => {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const calcularPuntaje = (estudianteAnswers, claveAnswers, config) => {
	let total = 0;
	for (let i = 1; i <= 100; i++) {
		const q = `PREG_${String(i).padStart(3, "0")}`;
		const respEst = estudianteAnswers[q] || "";
		const respClave = claveAnswers[q] || "";

		if (!respClave) {
			// Clave vacía: pregunta anulada → puntos completos siempre
			total += config.correcta;
		} else if (respEst === "") {
			total += config.blanco;
		} else if (respEst === respClave) {
			total += config.correcta;
		} else {
			total += config.incorrecta;
		}
	}
	return Math.round(total * 1000) / 1000;
};

export default function GestResultados() {
	const config = useMemo(() => getConfig(), []);

	const resultados = useMemo(() => {
		const estudiantes = getStored("studentResponsesData");
		const claves = getStored("responsesData");
		if (claves.length === 0 || estudiantes.length === 0) return [];

		const claveIndex = new Map();
		claves.forEach((c) => claveIndex.set(String(c.tema).trim().toUpperCase(), c.answers));

		return estudiantes.map((est) => {
			const tema = String(est.tema).trim().toUpperCase();
			const clave = claveIndex.get(tema);
			if (!clave) return null;
			return { nombre: est.postulantName, puntaje: calcularPuntaje(est.answers, clave, config) };
		}).filter(Boolean);
	}, [config]);

	const stats = useMemo(() => {
		if (resultados.length === 0) return null;
		const puntajes = resultados.map((r) => r.puntaje);
		const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
		const max = Math.max(...puntajes);
		const min = Math.min(...puntajes);
		const total = puntajes.length;
		const maxPosible = config.correcta * 100;
		// Distribución proporcional al máximo posible
		const excelente = puntajes.filter((p) => p >= maxPosible * 0.80).length;
		const bueno = puntajes.filter((p) => p >= maxPosible * 0.50 && p < maxPosible * 0.80).length;
		const regular = puntajes.filter((p) => p >= 0 && p < maxPosible * 0.50).length;
		const critico = puntajes.filter((p) => p < 0).length;
		return {
			promedio: promedio.toFixed(3),
			max: max.toFixed(3),
			min: min.toFixed(3),
			maxPosible,
			total,
			excelente, bueno, regular, critico,
		};
	}, [resultados, config]);

	const statistics = stats
		? [
				{ label: "Promedio general", value: stats.promedio },
				{ label: "Puntaje máximo posible", value: stats.maxPosible.toFixed(0) },
				{ label: "Mayor puntaje", value: stats.max },
				{ label: "Menor puntaje", value: stats.min },
		  ]
		: [
				{ label: "Promedio general", value: "—" },
				{ label: "Puntaje máximo posible", value: (config.correcta * 100).toFixed(0) },
				{ label: "Mayor puntaje", value: "—" },
				{ label: "Menor puntaje", value: "—" },
		  ];

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de resultados</h1>
					<p className="text-light-emphasis mb-0">
						{stats
							? `${stats.total} postulante(s) | Correcta: +${config.correcta} | Incorrecta: ${config.incorrecta} | Sin respuesta: ${config.blanco} | Máx: ${config.correcta * 100} pts`
							: `Regla actual: Correcta +${config.correcta} | Incorrecta ${config.incorrecta} | Blanco ${config.blanco}. Carga datos en Módulo 2.`}
					</p>
				</div>

				<div className="row g-4 mb-4">
					{statistics.map((item) => (
						<div className="col-sm-6 col-xl-3" key={item.label}>
							<div className="glass-card p-4 h-100">
								<p className="metric-label mb-1">{item.label}</p>
								<h2 className="metric-value mb-0">{item.value}</h2>
							</div>
						</div>
					))}
				</div>

				<div className="glass-card p-4">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h2 className="h4 mb-0">Distribución de puntajes (sobre {config.correcta * 100})</h2>
						{stats && <span className="badge text-bg-success">{stats.total} postulantes</span>}
					</div>
					{stats ? (
						<div className="progress-group d-grid gap-3">
							<div>
								<div className="d-flex justify-content-between small mb-1">
									<span>Excelente (≥{(stats.maxPosible * 0.80).toFixed(0)})</span>
									<span>{((stats.excelente / stats.total) * 100).toFixed(0)}% ({stats.excelente})</span>
								</div>
								<div className="progress" style={{ height: "10px" }}>
									<div className="progress-bar bg-success" style={{ width: `${(stats.excelente / stats.total) * 100}%` }}></div>
								</div>
							</div>
							<div>
								<div className="d-flex justify-content-between small mb-1">
									<span>Bueno ({(stats.maxPosible * 0.50).toFixed(0)}–{(stats.maxPosible * 0.80 - 1).toFixed(0)})</span>
									<span>{((stats.bueno / stats.total) * 100).toFixed(0)}% ({stats.bueno})</span>
								</div>
								<div className="progress" style={{ height: "10px" }}>
									<div className="progress-bar bg-info" style={{ width: `${(stats.bueno / stats.total) * 100}%` }}></div>
								</div>
							</div>
							<div>
								<div className="d-flex justify-content-between small mb-1">
									<span>Regular (0–{(stats.maxPosible * 0.50 - 1).toFixed(0)})</span>
									<span>{((stats.regular / stats.total) * 100).toFixed(0)}% ({stats.regular})</span>
								</div>
								<div className="progress" style={{ height: "10px" }}>
									<div className="progress-bar bg-warning" style={{ width: `${(stats.regular / stats.total) * 100}%` }}></div>
								</div>
							</div>
							<div>
								<div className="d-flex justify-content-between small mb-1">
									<span>Crítico (&lt;0)</span>
									<span>{((stats.critico / stats.total) * 100).toFixed(0)}% ({stats.critico})</span>
								</div>
								<div className="progress" style={{ height: "10px" }}>
									<div className="progress-bar bg-danger" style={{ width: `${(stats.critico / stats.total) * 100}%` }}></div>
								</div>
							</div>
						</div>
					) : (
						<p className="text-light-emphasis mb-0">Sin datos. Importa respuestas y claves primero.</p>
					)}
				</div>
			</main>
		</div>
	);
}
