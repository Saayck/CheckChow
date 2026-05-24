import { useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const formatValue = (value) => {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	return String(value);
};

export default function Omr() {
	const [lithocode, setLithocode] = useState("");
	const [union, setUnion] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const runRequest = async (method) => {
		const code = lithocode.trim();
		if (!code) {
			setMessage("Ingrese un lithocode para consultar o crear la unión OMR.");
			return;
		}

		setLoading(true);
		setMessage("");
		try {
			const data = await apiRequest(`/api/omr/union/${encodeURIComponent(code)}`, { method });
			setUnion(data);
			setMessage(method === "POST" ? "Unión OMR creada correctamente." : "Unión OMR encontrada.");
		} catch (err) {
			setUnion(null);
			setMessage(err.message || "No se pudo procesar la unión OMR.");
		} finally {
			setLoading(false);
		}
	};

	const fields = union ? Object.entries(union) : [];

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Unión OMR</h1>
					<p className="text-light-emphasis mb-0">Consulta y crea uniones OMR usando el controller del backend.</p>
				</div>

				<div className="row g-4">
					<div className="col-lg-4">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Búsqueda</p>
							<h2 className="h4 mb-3">Lithocode</h2>
							<div className="d-grid gap-3">
								<input
									className="form-control"
									value={lithocode}
									onChange={(event) => setLithocode(event.target.value)}
									placeholder="Ingrese lithocode"
								/>
								<div className="d-flex gap-2 flex-wrap">
									<button className="btn btn-success" disabled={loading} onClick={() => runRequest("GET")}>
										<i className="bi bi-search"></i> Buscar
									</button>
									<button className="btn btn-glass" disabled={loading} onClick={() => runRequest("POST")}>
										<i className="bi bi-plus-lg"></i> Crear
									</button>
								</div>
								{message && <div className="text-light-emphasis">{message}</div>}
							</div>
						</div>
					</div>

					<div className="col-lg-8">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Campo</th>
											<th>Valor</th>
										</tr>
									</thead>
									<tbody>
										{loading && (
											<tr><td colSpan="2" className="text-center text-light-emphasis">Procesando OMR...</td></tr>
										)}
										{!loading && fields.length === 0 && (
											<tr><td colSpan="2" className="text-center text-light-emphasis">No hay datos para mostrar.</td></tr>
										)}
										{!loading && fields.map(([key, value]) => (
											<tr key={key}>
												<td>{key}</td>
												<td style={{ wordBreak: "break-word" }}>{formatValue(value)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
