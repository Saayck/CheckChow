import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "../auth/login";
import DashboardPage from "../pages";
import GestUsuarios from "../features/modulo1/gest_usuarios/gest_usuarios";
import Auditoria from "../features/modulo1/auditoria/auditoria";
import GestCarreras from "../features/modulo2/gest_carreras/gest_carreras";
import GestPostulantes from "../features/modulo2/gest_postulantes/gest_postulantes";
import Respuestas from "../features/modulo2/proceso_respuestas/respuestas";
import GestResultados from "../features/modulo3/gest_resultados/gest_resultados";
import Resultados from "../features/modulo3/resultados/resultados";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<DashboardPage />} />
        <Route path="/usuarios" element={<GestUsuarios />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/carreras" element={<GestCarreras />} />
        <Route path="/postulantes" element={<GestPostulantes />} />
        <Route path="/respuestas" element={<Respuestas />} />
        <Route path="/gestion-resultados" element={<GestResultados />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;