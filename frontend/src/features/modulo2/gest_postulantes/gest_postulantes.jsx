import Header from "../../../components/header";
import "../../../styles/dashboard.css";
import { useMemo, useState, useEffect } from "react";

const initialPostulants = [
	{ id: 1, dni: "12345678", names: "Juan Carlos Pérez Gómez", litho: "", tema: "" },
];

export default function GestPostulantes() {
	const getInitialPostulants = () => {
		try {
			const stored = localStorage.getItem("postulantsData");
			return stored ? JSON.parse(stored) : initialPostulants;
		} catch {
			return initialPostulants;
		}
	};

	const [postulants, setPostulants] = useState(getInitialPostulants);
	const [editingId, setEditingId] = useState(null);
	const [formVisible, setFormVisible] = useState(false);
	const emptyForm = useMemo(() => ({ names: "", dni: "", litho: "", tema: "" }), []);
	const [formData, setFormData] = useState(emptyForm);
	const [importMessage, setImportMessage] = useState("");

	// Persiste postulantes.
	useEffect(() => {
		try {
			localStorage.setItem("postulantsData", JSON.stringify(postulants));
		} catch {}
	}, [postulants]);

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

	const handleEditClick = (postulant) => {
		setFormData({ names: postulant.names, dni: postulant.dni, litho: postulant.litho || "", tema: postulant.tema || "" });
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

	const handleFileImport = async (file) => {
		setImportMessage("");
		if (!file) return;
		try {
			const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data, { type: "array" });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

			// Se esperan las columnas: DNI, NOMBRE, LITHO, TEMA, sin distinguir mayusculas.
			const rows = json.map((row, idx) => {
				const keys = Object.keys(row);
				const mapKey = (k) => {
					if (!k) return "";
					return k.toString().trim().toUpperCase();
				};
				const lookup = {};
				keys.forEach((k) => (lookup[mapKey(k)] = row[k]));

				return {
					id: Date.now() + idx,
					dni: lookup["DNI"] ? String(lookup["DNI"]).trim() : "",
					names: lookup["NOMBRE"] ? String(lookup["NOMBRE"]).trim() : "",
					litho: lookup["LITHO"] ? String(lookup["LITHO"]).trim() : "",
					tema: lookup["TEMA"] ? String(lookup["TEMA"]).trim() : "",
				};
			});

			setPostulants((current) => [...current, ...rows]);
			setImportMessage(`Importados ${rows.length} registros correctamente.`);
		} catch (err) {
			console.error(err);
			setImportMessage("Error al importar el archivo. Instala la dependencia 'xlsx' o revisa el formato.");
		}
	};

	return (
		<div className="dashboard-shell">
			<Header />
			<main className="container-fluid px-3 px-lg-4 py-4 py-lg-5">
				<div className="page-title mb-4">
					<span className="eyebrow">Módulo 2</span>
					<h1 className="display-6 fw-bold mb-2">Ficha de postulantes universitarios</h1>
					<p className="text-light-emphasis mb-0">Gestiona postulantes: DNI, NOMBRE, LITHO y TEMA.</p>
				</div>

				<div className="d-flex justify-content-end mb-4">
					<div className="d-flex gap-2">
						<button type="button" className="btn action-button action-button-primary" onClick={handleAddClick}>
							Añadir postulante
						</button>
						<label className="btn action-button action-button-secondary" style={{ cursor: 'pointer' }}>
							Importar Excel
							<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileImport(e.target.files?.[0])} style={{ display: 'none' }} />
						</label>
						<button type="button" className="btn action-button action-button-ghost" onClick={() => { setPostulants([]); setImportMessage(""); }}>
							Limpiar
						</button>
					</div>
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
								<label className="form-label">LITHO</label>
								<input className="form-control" name="litho" value={formData.litho} onChange={handleChange} />
							</div>

							<div className="col-12">
								<label className="form-label">TEMA</label>
								<input className="form-control" name="tema" value={formData.tema} onChange={handleChange} />
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

				{importMessage && (
					<div className="mb-3">
						<span className="text-light-emphasis">{importMessage}</span>
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

								<div className="p-3">
									<ul className="list-unstyled mb-0">
										<li><strong>DNI:</strong> {postulant.dni}</li>
										<li><strong>Nombres:</strong> {postulant.names}</li>
										<li><strong>LITHO:</strong> {postulant.litho}</li>
										<li><strong>TEMA:</strong> {postulant.tema}</li>
									</ul>
								</div>
							</article>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
