import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const steps = [
	{ title: "Carga OMR", detail: "Se reciben hojas digitalizadas y se validan lotes." },
	{ title: "Lectura", detail: "Se interpretan marcas, omisiones y correcciones." },
	{ title: "Calificación", detail: "Se comparan respuestas con la clave oficial." },
	{ title: "Publicación", detail: "Se generan reportes y distribución de resultados." },
];

export default function ProcesoAdmision() {
	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Proceso de admisión</h1>
					<p className="text-light-emphasis mb-0">Simulación del flujo OMR desde la carga de archivos hasta la publicación final.</p>
				</div>

				<div className="row g-4">
					{steps.map((step, index) => (
						<div className="col-md-6 col-xl-3" key={step.title}>
							<article className="glass-card p-4 h-100">
								<div className="step-number mb-3">0{index + 1}</div>
								<h2 className="h5 mb-2">{step.title}</h2>
								<p className="mb-0 text-light-emphasis">{step.detail}</p>
							</article>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
