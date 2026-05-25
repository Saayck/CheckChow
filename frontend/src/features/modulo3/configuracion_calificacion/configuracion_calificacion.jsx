import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useState, useEffect } from "react";

export const CONFIG_KEY = "scoringConfig";

export const DEFAULT_CONFIG = {
	correcta: 20,
	incorrecta: -1.125,
	blanco: 0,
};

export const getConfig = () => {
	try {
		const raw = localStorage.getItem(CONFIG_KEY);
		return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
	} catch {
		return { ...DEFAULT_CONFIG };
	}
};

export default function ConfiguracionCalificacion() {
	const [config, setConfig] = useState(getConfig);
	const [saved, setSaved] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		setSaved(false);
	}, [config]);

	const validateConfig = (updatedConfig) => {
		const newErrors = {};

		// Validar respuesta correcta: positivo y mayor que 1
		if (updatedConfig.correcta <= 1) {
			newErrors.correcta = "Debe ser positivo y mayor que 1";
		}

		// Validar respuesta incorrecta: negativo
		if (updatedConfig.incorrecta >= 0) {
			newErrors.incorrecta = "Debe ser negativo";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (field, value) => {
		const num = parseFloat(value);
		const newConfig = { ...config, [field]: isNaN(num) ? 0 : num };
		validateConfig(newConfig);
		setConfig(newConfig);
	};

	const handleSave = (e) => {
		e.preventDefault();
		if (validateConfig(config)) {
			localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
			setSaved(true);
		}
	};

	const handleReset = () => {
		setConfig({ ...DEFAULT_CONFIG });
		localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
		setSaved(true);
	};

	const maxPosible = config.correcta * 100;

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 3</span>
					<h1 className="display-6 fw-bold mb-2">Configuración de calificación</h1>
					<p className="text-light-emphasis mb-0">
						Define cómo se calcula el puntaje de cada postulante. Los resultados se actualizan automáticamente al guardar.
					</p>
				</div>

				<div className="row g-4">
					{/* Formulario de configuración */}
					<div className="col-lg-6">
						<div className="glass-card p-4">
							<p className="section-kicker mb-1">Reglas de puntaje</p>
							<h2 className="h5 mb-4">Parámetros por pregunta</h2>

							<form onSubmit={handleSave}>
								<div className="mb-4">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>
										Respuesta correcta (puntos)
									</label>
									<input
										type="number"
										step="any"
										className="form-control"
										value={config.correcta}
										onChange={(e) => handleChange("correcta", e.target.value)}
										style={{ 
											background: "rgba(255,255,255,0.04)", 
											border: errors.correcta ? "1px solid #ef4444" : "1px solid rgba(148,163,184,0.2)", 
											color: "#f8fafc" 
										}}
									/>
									{errors.correcta ? (
									<small style={{ color: "#ef4444" }}>{errors.correcta}</small>
								) : (
									<small style={{ color: "#22c55e" }}>Se suma este valor cuando el alumno acierta.</small>
									)}
								</div>

								<div className="mb-4">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>
										Respuesta incorrecta (puntos)
									</label>
									<input
										type="number"
										step="any"
										className="form-control"
										value={config.incorrecta}
										onChange={(e) => handleChange("incorrecta", e.target.value)}
										style={{ 
											background: "rgba(255,255,255,0.04)", 
											border: errors.incorrecta ? "1px solid #ef4444" : "1px solid rgba(148,163,184,0.2)", 
											color: "#f8fafc" 
										}}
									/>
									{errors.incorrecta ? (
									<small style={{ color: "#ef4444" }}>{errors.incorrecta}</small>
									) : (
										<small style={{ color: "#ef4444" }}>Se suma este valor (negativo = descuento) cuando el alumno marca mal.</small>
									)}
								</div>

								<div className="mb-4">
									<label className="form-label" style={{ color: "#cbd5e1", fontWeight: 600 }}>
										Sin respuesta (puntos)
									</label>
									<input
										type="number"
										step="any"
										className="form-control"
										value={config.blanco}
										onChange={(e) => handleChange("blanco", e.target.value)}
										style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", color: "#f8fafc" }}
									/>
									<small style={{ color: "#94a3b8" }}>Puntaje cuando el alumno deja la pregunta en blanco.</small>
								</div>

								<div className="d-flex gap-2">
									<button type="submit" className="btn action-button action-button-primary action-button-success">
										Guardar configuración
									</button>
									<button type="button" className="btn action-button action-button-ghost" onClick={handleReset}>
										Restaurar por defecto
									</button>
								</div>

								{saved && (
									<div className="mt-3">
										<span style={{ color: "#22c55e", fontWeight: 600 }}>
											Configuración guardada. Los resultados usarán estos valores.
										</span>
									</div>
								)}
							</form>
						</div>
					</div>

					{/* Vista previa del puntaje */}
					<div className="col-lg-6">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Vista previa</p>
							<h2 className="h5 mb-4">Cómo se calcularía un examen</h2>

							<div className="d-grid gap-3 mb-4">
								<div className="mini-stat">
									<span>Puntaje máximo posible (100 correctas)</span>
									<strong style={{ color: "#22c55e" }}>{maxPosible.toFixed(3)}</strong>
								</div>
								<div className="mini-stat">
									<span>Puntaje mínimo posible (100 incorrectas)</span>
									<strong style={{ color: "#ef4444" }}>{(config.incorrecta * 100).toFixed(3)}</strong>
								</div>
								<div className="mini-stat">
									<span>Puntaje si todo en blanco</span>
									<strong style={{ color: "#94a3b8" }}>{(config.blanco * 100).toFixed(3)}</strong>
								</div>
							</div>

							<p className="section-kicker mb-2">Ejemplo de cálculo</p>
							<div className="glass-card p-3">
								{[
									{ label: "60 correctas", pts: (config.correcta * 60).toFixed(3) },
									{ label: "30 incorrectas", pts: (config.incorrecta * 30).toFixed(3) },
									{ label: "10 en blanco", pts: (config.blanco * 10).toFixed(3) },
								].map((row) => (
									<div key={row.label} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
										<span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>{row.label}</span>
										<strong style={{ color: "#f8fafc" }}>{parseFloat(row.pts) >= 0 ? `+${row.pts}` : row.pts}</strong>
									</div>
								))}
								<div className="d-flex justify-content-between align-items-center pt-2 mt-1">
									<strong style={{ color: "#f8fafc" }}>Total</strong>
									<strong style={{ color: "#22c55e", fontSize: "1.1rem" }}>
										{(config.correcta * 60 + config.incorrecta * 30 + config.blanco * 10).toFixed(3)}
									</strong>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
