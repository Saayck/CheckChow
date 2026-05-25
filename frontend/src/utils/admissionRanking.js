export const puntajesIguales = (a, b) => Math.abs(Number(a) - Number(b)) < 0.0005;

export const aplicarVacantesPorPuntaje = (grupo, vacantes, permiteAmpliacion = true, puntajeKey = "puntajeFinal") => {
	const totalVacantes = Number(vacantes) || 0;
	const ordenados = [...grupo].sort((a, b) => Number(b[puntajeKey] || 0) - Number(a[puntajeKey] || 0));
	if (totalVacantes <= 0) {
		ordenados.forEach((item) => {
			item.condicion = "NO INGRESO";
			item.vacanteAmpliada = false;
		});
		return ordenados;
	}

	const puntajeCorte = ordenados[Math.min(totalVacantes, ordenados.length) - 1]?.[puntajeKey];
	ordenados.forEach((item, idx) => {
		const dentroVacante = idx < totalVacantes;
		const empatadoEnCorte = permiteAmpliacion && idx >= totalVacantes && puntajesIguales(item[puntajeKey], puntajeCorte);
		item.condicion = dentroVacante || empatadoEnCorte ? "INGRESO" : "NO INGRESO";
		item.vacanteAmpliada = empatadoEnCorte;
	});
	return ordenados;
};

export const contarVacantesEfectivas = (grupo, vacantes, permiteAmpliacion = true, puntajeKey = "puntajeFinal") => {
	const ordenados = aplicarVacantesPorPuntaje(
		grupo.map((item) => ({ ...item })),
		vacantes,
		permiteAmpliacion,
		puntajeKey
	);
	const ingresos = ordenados.filter((item) => item.condicion === "INGRESO").length;
	const ampliadas = ordenados.filter((item) => item.vacanteAmpliada).length;
	return { ingresos, ampliadas, efectivas: (Number(vacantes) || 0) + ampliadas };
};
