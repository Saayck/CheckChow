import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { apiRequest } from "../../../utils/api";

const roles = ["ADMIN", "SUPERVISOR", "CALIFICADOR", "CONSULTA"];
const statuses = ["Activo", "Suspendido"];

const emptyForm = { name: "", role: "ADMIN", email: "", password: "", status: "Activo" };

const toViewUser = (user) => ({
	id: user.id,
	name: user.nombreCompleto || "",
	role: user.rol || "ADMIN",
	email: user.email || "",
	status: user.activo === false ? "Suspendido" : "Activo",
});

export default function GestUsuarios() {
	const [users, setUsers] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState(emptyForm);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const loadUsers = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiRequest("/api/usuarios");
			setUsers((data || []).map(toViewUser));
		} catch (err) {
			setError(err.message || "No se pudieron cargar los usuarios");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
	}, []);

	const handleOpenModal = () => {
		setFormData(emptyForm);
		setIsEditing(false);
		setEditingId(null);
		setShowModal(true);
	};

	const handleEditUser = (user) => {
		setFormData({ ...user, password: "" });
		setEditingId(user.id);
		setIsEditing(true);
		setShowModal(true);
	};

	const handleDeleteUser = async (id) => {
		if (!window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
			return;
		}

		setError("");
		try {
			await apiRequest(`/api/usuarios/${id}`, { method: "DELETE" });
			setUsers((current) => current.filter((user) => user.id !== id));
		} catch (err) {
			setError(err.message || "No se pudo eliminar el usuario");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const name = formData.name.trim();
		const email = formData.email.trim().toLowerCase();
		const password = formData.password;

		if (!name || !email || (!isEditing && !password)) {
			setError("Complete nombre, correo y contraseña");
			return;
		}

		const payload = {
			nombreCompleto: name,
			email,
			rol: formData.role,
			activo: formData.status === "Activo",
			...(password ? { password } : {}),
		};

		setSaving(true);
		setError("");
		try {
			if (isEditing) {
				await apiRequest(`/api/usuarios/${editingId}`, {
					method: "PUT",
					body: JSON.stringify(payload),
				});
			} else {
				await apiRequest("/api/usuarios", {
					method: "POST",
					body: JSON.stringify(payload),
				});
			}
			setShowModal(false);
			setFormData(emptyForm);
			await loadUsers();
		} catch (err) {
			setError(err.message || "No se pudo guardar el usuario");
		} finally {
			setSaving(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setFormData(emptyForm);
	};

	const activeUsersCount = users.filter((user) => user.status === "Activo").length;
	const uniqueRolesCount = useMemo(() => new Set(users.map((user) => user.role)).size, [users]);

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
						<button className="btn btn-glass" onClick={handleOpenModal}>
							<i className="bi bi-plus-lg"></i> Nuevo usuario
						</button>
					</div>

					{error && <div className="alert alert-danger">{error}</div>}

					<div className="row g-4">
						<div className="col-lg-4">
							<div className="glass-card p-4 h-100">
								<p className="section-kicker mb-1">Resumen</p>
								<h2 className="h4 mb-3">Control de acceso</h2>
								<div className="d-grid gap-3">
									<div className="mini-stat"><span>Total de usuarios</span><strong>{users.length}</strong></div>
									<div className="mini-stat"><span>Usuarios activos</span><strong>{activeUsersCount}</strong></div>
									<div className="mini-stat"><span>Roles únicos</span><strong>{uniqueRolesCount}</strong></div>
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
											{loading && (
												<tr><td colSpan="5" className="text-center text-light-emphasis">Cargando usuarios...</td></tr>
											)}
											{!loading && users.length === 0 && (
												<tr><td colSpan="5" className="text-center text-light-emphasis">No hay usuarios registrados.</td></tr>
											)}
											{!loading && users.map((user) => (
												<tr key={user.id}>
													<td>{user.name}</td>
													<td>{user.role}</td>
													<td>{user.email}</td>
													<td><span className={`status-pill ${user.status === "Activo" ? "status-success" : "status-danger"}`}>{user.status}</span></td>
													<td>
														<button className="btn btn-sm btn-warning me-2" onClick={() => handleEditUser(user)} title="Editar">
															<i className="bi bi-pencil"></i>
														</button>
														<button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user.id)} title="Eliminar">
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

				{showModal && (
					<div className="modal d-block custom-modal-backdrop">
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content custom-modal-content">
								<div className="modal-header custom-modal-header border-0 pb-3">
									<h5 className="modal-title fw-bold">{isEditing ? "Editar usuario" : "Crear nuevo usuario"}</h5>
									<button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
								</div>
								<form onSubmit={handleSubmit}>
									<div className="modal-body px-4 py-4">
										<div className="mb-3">
											<label className="form-label">Nombre</label>
											<input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre completo" />
										</div>
										<div className="mb-3">
											<label className="form-label">Correo electrónico</label>
											<input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="correo@example.com" />
										</div>
										<div className="mb-3">
											<label className="form-label">Contraseña {isEditing && <span className="text-light-emphasis">(opcional)</span>}</label>
											<input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={isEditing ? "Dejar vacío para mantenerla" : "Contraseña inicial"} />
										</div>
										<div className="mb-3">
											<label className="form-label">Rol</label>
											<select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
												{roles.map((role) => <option key={role} value={role}>{role}</option>)}
											</select>
										</div>
										<div className="mb-0">
											<label className="form-label">Estado</label>
											<select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
												{statuses.map((status) => <option key={status} value={status}>{status}</option>)}
											</select>
										</div>
									</div>
									<div className="modal-footer custom-modal-footer border-0 pt-3 gap-2">
										<button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal} style={{ color: "#cbd5e1", borderColor: "rgba(148, 163, 184, 0.2)" }}>
											Cancelar
										</button>
										<button type="submit" className="btn btn-success" disabled={saving} style={{ background: "#22c55e", borderColor: "#22c55e" }}>
											{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
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
