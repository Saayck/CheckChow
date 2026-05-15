import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState } from "react";

const facultyList = ["Ingeniería", "Humanidades", "Salud", "Empresariales"];

const getCareersByFaculty = (faculty) => {
	const stored = localStorage.getItem("careersData");
	if (stored) {
		try {
			const allCareers = JSON.parse(stored);
			return allCareers.filter((c) => c.faculty === faculty).map((c) => c.name);
		} catch {
			return [];
		}
	}
	return [];
};

const initialPostulants = [
	{
		id: 1,
		names: "Juan Carlos Pérez Gómez",
		dni: "12345678",
		birthDate: "15/08/2007",
		address: "Av. Los Álamos 123",
		phone: "987654321",
		email: "juanperez@gmail.com",
		school: "I.E. San Martín",
		graduationYear: "2025",
		admissionMode: "Examen Ordinario",
		career: "Ingeniería de Sistemas",
		faculty: "Ingeniería",
		guardian: "Carlos Pérez",
		contactPhone: "999888777",
	},
];

export default function GestPostulantes() {
	const [postulants, setPostulants] = useState(initialPostulants);
	const [editingId, setEditingId] = useState(null);
	const [formVisible, setFormVisible] = useState(false);
	const emptyForm = useMemo(() => ({
		names: "",
		dni: "",
		birthDate: "",
		address: "",
		phone: "",
		email: "",
		school: "",
		graduationYear: "",
		admissionMode: "",
		career: "",
		faculty: "",
		guardian: "",
		contactPhone: "",
	}), []);
	const [formData, setFormData] = useState(emptyForm);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
	};

	const handleFacultyChange = (event) => {
		const { value } = event.target;
		setFormData((current) => ({
			...current,
			faculty: value,
			career: "",
		}));
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
		setFormData({
			names: postulant.names,
			dni: postulant.dni,
			birthDate: postulant.birthDate,
			address: postulant.address,
			phone: postulant.phone,
			email: postulant.email,
			school: postulant.school,
			graduationYear: postulant.graduationYear,
			admissionMode: postulant.admissionMode,
			career: postulant.career,
			faculty: postulant.faculty,
			guardian: postulant.guardian,
			contactPhone: postulant.contactPhone,
		});
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

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Ficha de postulantes universitarios</h1>
					<p className="text-light-emphasis mb-0">Registra, edita y elimina la información personal, académica, profesional y familiar de cada postulante.</p>
				</div>

				<div className="d-flex justify-content-end mb-4">
					<button type="button" className="btn action-button action-button-primary" onClick={handleAddClick}>
						Añadir postulante
					</button>
				</div>

				{formVisible && (
					<div className="glass-card postulant-form-card p-4 mb-4">
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
								<label className="form-label">Nombres y apellidos</label>
								<input className="form-control" name="names" value={formData.names} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">DNI</label>
								<input className="form-control" name="dni" value={formData.dni} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">Fecha de nacimiento</label>
								<input className="form-control" name="birthDate" value={formData.birthDate} onChange={handleChange} placeholder="dd/mm/aaaa" required />
							</div>

							<div className="col-md-6">
								<label className="form-label">Dirección</label>
								<input className="form-control" name="address" value={formData.address} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">Teléfono</label>
								<input className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">Correo</label>
								<input className="form-control" name="email" type="email" value={formData.email} onChange={handleChange} required />
							</div>

							<div className="col-md-6">
								<label className="form-label">Colegio de procedencia</label>
								<input className="form-control" name="school" value={formData.school} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">Año de egreso</label>
								<input className="form-control" name="graduationYear" value={formData.graduationYear} onChange={handleChange} required />
							</div>
							<div className="col-md-3">
								<label className="form-label">Modalidad de ingreso</label>
								<input className="form-control" name="admissionMode" value={formData.admissionMode} onChange={handleChange} required />
							</div>

							<div className="col-md-6">
								<label className="form-label">Facultad</label>
								<select className="form-select" name="faculty" value={formData.faculty} onChange={handleFacultyChange} required>
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
								<select className="form-select" name="career" value={formData.career} onChange={handleChange} disabled={!formData.faculty} required>
									<option value="">Selecciona una carrera</option>
									{getCareersByFaculty(formData.faculty).map((career) => (
										<option key={career} value={career}>
											{career}
										</option>
									))}
								</select>
							</div>

							<div className="col-md-6">
								<label className="form-label">Padre o tutor</label>
								<input className="form-control" name="guardian" value={formData.guardian} onChange={handleChange} required />
							</div>
							<div className="col-md-6">
								<label className="form-label">Teléfono de contacto</label>
								<input className="form-control" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
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

				<div className="row g-4">
					{postulants.map((postulant) => (
						<div className="col-12" key={postulant.id}>
							<article className="glass-card p-4 h-100">
								<div className="d-flex justify-content-between align-items-start gap-3 mb-3">
									<div>
										<p className="section-kicker mb-1">FICHA DE POSTULANTE UNIVERSITARIO</p>
										<h2 className="h4 mb-1">{postulant.names}</h2>
										<p className="mb-0 text-light-emphasis">DNI: {postulant.dni}</p>
									</div>
									<div className="d-flex flex-wrap gap-2">
										<button type="button" className="btn action-button action-button-secondary action-button-sm" onClick={() => handleEditClick(postulant)}>
											Editar
										</button>
										<button type="button" className="btn action-button action-button-danger action-button-sm" onClick={() => handleDeleteClick(postulant.dni)}>
											Eliminar
										</button>
									</div>
								</div>

								<div className="row g-3">
									<div className="col-lg-4">
										<div className="glass-card p-3 h-100">
											<h3 className="h6 mb-3">Datos Personales</h3>
											<ul className="list-unstyled mb-0 small">
												<li><strong>Nombres y apellidos:</strong> {postulant.names}</li>
												<li><strong>DNI:</strong> {postulant.dni}</li>
												<li><strong>Fecha de nacimiento:</strong> {postulant.birthDate}</li>
												<li><strong>Dirección:</strong> {postulant.address}</li>
												<li><strong>Teléfono:</strong> {postulant.phone}</li>
												<li><strong>Correo:</strong> {postulant.email}</li>
											</ul>
										</div>
									</div>

									<div className="col-lg-4">
										<div className="glass-card p-3 h-100">
											<h3 className="h6 mb-3">Información Académica</h3>
											<ul className="list-unstyled mb-0 small">
												<li><strong>Colegio de procedencia:</strong> {postulant.school}</li>
												<li><strong>Año de egreso:</strong> {postulant.graduationYear}</li>
												<li><strong>Modalidad de ingreso:</strong> {postulant.admissionMode}</li>
											</ul>
										</div>
									</div>

									<div className="col-lg-4">
										<div className="glass-card p-3 h-100">
											<h3 className="h6 mb-3">Carrera y Familia</h3>
											<ul className="list-unstyled mb-0 small">
												<li><strong>Carrera profesional:</strong> {postulant.career}</li>
												<li><strong>Facultad:</strong> {postulant.faculty}</li>
												<li><strong>Padre o tutor:</strong> {postulant.guardian}</li>
												<li><strong>Teléfono de contacto:</strong> {postulant.contactPhone}</li>
											</ul>
										</div>
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
