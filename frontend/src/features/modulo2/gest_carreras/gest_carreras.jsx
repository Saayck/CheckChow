import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState, useEffect } from "react";

const facultyList = ["Ingeniería", "Humanidades", "Salud", "Empresariales"];

const initialCareers = [
	{ id: 1, faculty: "Ingeniería", name: "Ingeniería de Sistemas", seats: 120, applicants: 96, status: "Abierta" },
	{ id: 2, faculty: "Salud", name: "Enfermería", seats: 80, applicants: 84, status: "Llena" },
	{ id: 3, faculty: "Ingeniería", name: "Ingeniería Civil", seats: 60, applicants: 52, status: "Abierta" },
	{ id: 4, faculty: "Empresariales", name: "Administración", seats: 100, applicants: 74, status: "Abierta" },
];

export default function GestCarreras() {
	const getInitialCareers = () => {
		try {
			const stored = localStorage.getItem("careersData");
			return stored ? JSON.parse(stored) : initialCareers;
		} catch {
			return initialCareers;
		}
	};

	const [careers, setCareers] = useState(getInitialCareers);
	const [editingId, setEditingId] = useState(null);
	const [formVisible, setFormVisible] = useState(false);
	const emptyForm = useMemo(() => ({
		faculty: "",
		name: "",
		seats: "",
		status: "Abierta",
	}), []);
	const [formData, setFormData] = useState(emptyForm);

	// Guardar en localStorage cada vez que careers cambia
	useEffect(() => {
		localStorage.setItem("careersData", JSON.stringify(careers));
	}, [careers]);

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

	const handleEditClick = (career) => {
		setFormData({
			faculty: career.faculty,
			name: career.name,
			seats: career.seats.toString(),
			status: career.status,
		});
		setEditingId(career.id);
		setFormVisible(true);
	};

	const handleDeleteClick = (id) => {
		setCareers((current) => {
			const target = current.find((career) => career.id === id);
			if (target?.id === editingId) {
				resetForm();
			}
			return current.filter((career) => career.id !== id);
		});
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (editingId) {
			setCareers((current) =>
				current.map((career) =>
					career.id === editingId
						? {
								...career,
								faculty: formData.faculty,
								name: formData.name,
								seats: parseInt(formData.seats, 10),
								status: formData.status,
						  }
						: career
				)
			);
		} else {
			setCareers((current) => [
				...current,
				{
					...formData,
					id: Date.now(),
					seats: parseInt(formData.seats, 10),
					applicants: 0,
				},
			]);
		}

		resetForm();
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Gestión de carreras</h1>
					<p className="text-light-emphasis mb-0">Configura cupos, demanda y estado de apertura de cada carrera.</p>
				</div>

				<div className="d-flex justify-content-end mb-4">
					<button type="button" className="btn action-button action-button-primary" onClick={handleAddClick}>
						Añadir carrera
					</button>
				</div>

				{formVisible && (
					<div className="glass-card postulant-form-card p-4 mb-4">
						<div className="d-flex justify-content-between align-items-start gap-3 mb-3">
							<div>
								<p className="section-kicker mb-1">{editingId ? "Editar carrera" : "Nueva carrera"}</p>
								<h2 className="h5 mb-0">Configuración del programa</h2>
							</div>
							<button type="button" className="btn action-button action-button-ghost action-button-sm" onClick={resetForm}>
								Cerrar
							</button>
						</div>

						<form className="row g-3 postulant-form" onSubmit={handleSubmit}>
							<div className="col-md-6">
								<label className="form-label">Facultad</label>
								<select className="form-select" name="faculty" value={formData.faculty} onChange={handleChange} required>
									<option value="">Selecciona una facultad</option>
									{facultyList.map((faculty) => (
										<option key={faculty} value={faculty}>
											{faculty}
										</option>
									))}
								</select>
							</div>
							<div className="col-md-6">
								<label className="form-label">Carrera profesional</label>
								<input className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Ingeniería de Sistemas" required />
							</div>

							<div className="col-md-6">
								<label className="form-label">Cupos disponibles</label>
								<input className="form-control" type="number" name="seats" value={formData.seats} onChange={handleChange} placeholder="120" min="1" required />
							</div>
							<div className="col-md-6">
								<label className="form-label">Estado de apertura</label>
								<select className="form-select" name="status" value={formData.status} onChange={handleChange} required>
									<option value="Abierta">Abierta</option>
									<option value="Llena">Llena</option>
									<option value="Cerrada">Cerrada</option>
								</select>
							</div>

							<div className="col-12 d-flex gap-2 justify-content-end">
								<button type="button" className="btn action-button action-button-ghost" onClick={resetForm}>
									Cancelar
								</button>
								<button type="submit" className="btn action-button action-button-primary action-button-success">
									{editingId ? "Guardar cambios" : "Agregar carrera"}
								</button>
							</div>
						</form>
					</div>
				)}

				<div className="row g-4">
					{careers.map((career) => (
						<div className="col-md-6 col-xl-3" key={career.id}>
							<article className="glass-card p-4 h-100">
								<p className="section-kicker mb-1">{career.faculty}</p>
								<h2 className="h5 mb-3">{career.name}</h2>
								<div className="mini-stat mb-3"><span>Cupos</span><strong>{career.seats}</strong></div>
								<div className="mini-stat mb-3"><span>Postulantes</span><strong>{career.applicants}</strong></div>
								<div className="d-flex gap-2 align-items-center justify-content-between">
									<span className={`status-pill ${career.status === "Abierta" ? "status-success" : career.status === "Llena" ? "status-warning" : "status-danger"}`}>{career.status}</span>
									<div className="d-flex gap-2">
										<button type="button" className="btn action-button action-button-secondary action-button-sm" onClick={() => handleEditClick(career)}>
											Editar
										</button>
										<button type="button" className="btn action-button action-button-danger action-button-sm" onClick={() => handleDeleteClick(career.id)}>
											Eliminar
										</button>
									</div>
								</div>
							</article>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
