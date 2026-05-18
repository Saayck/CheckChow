import { useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";

const initialUsers = [
	{ id: 1, name: "Andrea Paz", role: "Supervisión", email: "andrea.paz@checkchow.com", status: "Activo" },
	{ id: 2, name: "René Torres", role: "Operador OMR", email: "rene.torres@checkchow.com", status: "Activo" },
	{ id: 3, name: "Sofía León", role: "Auditor", email: "sofia.leon@checkchow.com", status: "Suspendido" },
	{ id: 4, name: "Kevin Flores", role: "Admisión", email: "kevin.flores@checkchow.com", status: "Activo" },
];

const roles = ["Supervisión", "Operador OMR", "Auditor", "Admisión", "Administrador"];
const statuses = ["Activo", "Suspendido"];

export default function GestUsuarios() {
	const [users, setUsers] = useState(initialUsers);
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({ name: "", role: "Supervisión", email: "", status: "Activo" });

	const handleOpenModal = () => {
		setFormData({ name: "", role: "Supervisión", email: "", status: "Activo" });
		setIsEditing(false);
		setShowModal(true);
	};

	const handleEditUser = (user) => {
		setFormData(user);
		setEditingId(user.id);
		setIsEditing(true);
		setShowModal(true);
	};

	const handleDeleteUser = (id) => {
		if (window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
			setUsers(users.filter(u => u.id !== id));
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formData.name || !formData.email) {
			alert("Por favor complete todos los campos");
			return;
		}
		if (isEditing) {
			setUsers(users.map(u => u.id === editingId ? { ...formData, id: editingId } : u));
		} else {
			const newUser = { ...formData, id: Math.max(...users.map(u => u.id), 0) + 1 };
			setUsers([...users, newUser]);
		}
		setShowModal(false);
		setFormData({ name: "", role: "Supervisión", email: "", status: "Activo" });
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setFormData({ name: "", role: "Supervisión", email: "", status: "Activo" });
	};

	const activeUsersCount = users.filter(u => u.status === "Activo").length;

	const modalStyles = `
		.custom-modal-backdrop {
			background: rgba(0, 0, 0, 0.64) !important;
			backdrop-filter: blur(8px);
		}
		.custom-modal-content {
			background: rgba(7, 12, 22, 0.95) !important;
			border: 1px solid rgba(148, 163, 184, 0.12) !important;
			border-radius: 28px !important;
		}
		.custom-modal-header {
			border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
			color: #f8fafc !important;
		}
		.custom-modal-footer {
			border-top: 1px solid rgba(148, 163, 184, 0.12) !important;
		}
		.form-label {
			color: #cbd5e1 !important;
			font-weight: 600;
			font-size: 0.92rem;
		}
		.form-control, .form-select {
			background: rgba(255, 255, 255, 0.04) !important;
			border: 1px solid rgba(148, 163, 184, 0.12) !important;
			color: #f8fafc !important;
		}
		.form-control::placeholder, .form-select option:not(:checked) {
			color: rgba(203, 213, 225, 0.5) !important;
		}
		.form-control:focus, .form-select:focus {
			background: rgba(255, 255, 255, 0.06) !important;
			border-color: rgba(134, 239, 172, 0.24) !important;
			box-shadow: 0 0 0 0.25rem rgba(34, 197, 94, 0.15) !important;
			color: #f8fafc !important;
		}
		.form-select option {
			background: #0f172a;
			color: #f8fafc;
		}
		.btn-glass {
			background: rgba(34, 197, 94, 0.14) !important;
			border: 1px solid rgba(134, 239, 172, 0.24) !important;
			color: #86efac !important;
			padding: 0.6rem 1.2rem !important;
			border-radius: 999px !important;
			font-weight: 600 !important;
			transition: all 0.2s ease !important;
		}
		.btn-glass:hover {
			background: rgba(34, 197, 94, 0.24) !important;
			border-color: rgba(134, 239, 172, 0.4) !important;
			color: #dcfce7 !important;
			transform: translateY(-2px) !important;
			box-shadow: 0 12px 24px rgba(34, 197, 94, 0.15) !important;
		}
	`;

	return (
		<>
			<style>{modalStyles}</style>
			<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4 d-flex justify-content-between align-items-start">
					<div>
						<span className="eyebrow">Módulo 1</span>
						<h1 className="display-6 fw-bold mb-2">Gestión de usuarios</h1>
						<p className="text-light-emphasis mb-0">Administra perfiles, permisos y estado de acceso de forma segura.</p>
					</div>
					<button 
						className="btn btn-glass" 
						onClick={handleOpenModal}
					>
						<i className="bi bi-plus-lg"></i> Nuevo usuario
					</button>
				</div>

				<div className="row g-4">
					<div className="col-lg-4">
						<div className="glass-card p-4 h-100">
							<p className="section-kicker mb-1">Resumen</p>
							<h2 className="h4 mb-3">Control de acceso</h2>
							<div className="d-grid gap-3">
								<div className="mini-stat"><span>Total de usuarios</span><strong>{users.length}</strong></div>
								<div className="mini-stat"><span>Usuarios activos</span><strong>{activeUsersCount}</strong></div>
								<div className="mini-stat"><span>Roles únicos</span><strong>{new Set(users.map(u => u.role)).size}</strong></div>
							</div>
						</div>
					</div>
					<div className="col-lg-8">
						<div className="glass-card p-4 h-100">
							<div className="table-responsive">
								<table className="table table-dark table-borderless align-middle dashboard-table mb-0">
									<thead>
										<tr>
											<th>Nombre</th>
											<th>Rol</th>
											<th>Correo</th>
											<th>Estado</th>
											<th style={{ width: "120px" }}>Acciones</th>
										</tr>
									</thead>
									<tbody>
										{users.map((user) => (
											<tr key={user.id}>
												<td>{user.name}</td>
												<td>{user.role}</td>
												<td>{user.email}</td>
												<td><span className={`status-pill ${user.status === "Activo" ? "status-success" : "status-danger"}`}>{user.status}</span></td>
												<td>
													<button 
														className="btn btn-sm btn-warning me-2"
														onClick={() => handleEditUser(user)}
														title="Editar"
													>
														<i className="bi bi-pencil"></i>
													</button>
													<button 
														className="btn btn-sm btn-danger"
														onClick={() => handleDeleteUser(user.id)}
														title="Eliminar"
													>
														<i className="bi bi-trash"></i>
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</main>

				{/* Ventana modal */}
			{showModal && (
				<div className="modal d-block custom-modal-backdrop">
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content custom-modal-content">
							<div className="modal-header custom-modal-header border-0 pb-3">
								<h5 className="modal-title fw-bold">{isEditing ? "Editar usuario" : "Crear nuevo usuario"}</h5>
								<button 
									type="button" 
									className="btn-close btn-close-white" 
									onClick={handleCloseModal}
								></button>
							</div>
							<form onSubmit={handleSubmit}>
								<div className="modal-body px-4 py-4">
									<div className="mb-3">
										<label className="form-label">Nombre</label>
										<input
											type="text"
											className="form-control"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder="Nombre completo"
										/>
									</div>
									<div className="mb-3">
										<label className="form-label">Correo electrónico</label>
										<input
											type="email"
											className="form-control"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											placeholder="correo@example.com"
										/>
									</div>
									<div className="mb-3">
										<label className="form-label">Rol</label>
										<select
											className="form-select"
											value={formData.role}
											onChange={(e) => setFormData({ ...formData, role: e.target.value })}
										>
											{roles.map(r => <option key={r} value={r}>{r}</option>)}
										</select>
									</div>
									<div className="mb-0">
										<label className="form-label">Estado</label>
										<select
											className="form-select"
											value={formData.status}
											onChange={(e) => setFormData({ ...formData, status: e.target.value })}
										>
											{statuses.map(s => <option key={s} value={s}>{s}</option>)}
										</select>
									</div>
								</div>
								<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
									<button 
										type="button" 
										className="btn btn-outline-secondary" 
										onClick={handleCloseModal}
										style={{ color: "#cbd5e1", borderColor: "rgba(148, 163, 184, 0.2)" }}
									>
										Cancelar
									</button>
									<button 
										type="submit" 
										className="btn btn-success"
										style={{ background: "#22c55e", borderColor: "#22c55e" }}
									>
										{isEditing ? "Guardar cambios" : "Crear usuario"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
		</>
	);
}
