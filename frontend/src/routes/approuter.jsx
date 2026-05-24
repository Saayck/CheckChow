import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "../auth/login";
import DashboardPage from "../pages";
import GestUsuarios from "../features/modulo1/gest_usuarios/gest_usuarios";
import GestCarreras from "../features/modulo1/gest_carreras/gest_carreras";
import GestProcesos from "../features/modulo1/gest_procesos/gest_procesos";
import GestTemas from "../features/modulo1/gest_temas/gest_temas";
import GestClavesRespuesta from "../features/modulo1/gest_claves_respuesta/gest_claves_respuesta";
import GestVacantes from "../features/modulo1/gest_vacantes/gest_vacantes";
import GestInscripciones from "../features/modulo2/gest_inscripciones/gest_inscripciones";
import GestResultadosAdmision from "../features/modulo3/gest_resultados_admision/gest_resultados_admision";
import Auditoria from "../features/modulo1/auditoria/auditoria";
import GestRespPost from "../features/modulo2/gest_resp_post/gest_resp_post";
import GestPostulantes from "../features/modulo2/gest_postulantes/gest_postulantes";
import Omr from "../features/modulo2/omr/omr";
import GestResultados from "../features/modulo3/gest_resultados/gest_resultados";
import Resultados from "../features/modulo3/resultados/resultados";
import ConfiguracionCalificacion from "../features/modulo3/configuracion_calificacion/configuracion_calificacion";
import ExportarResultados from "../features/modulo3/exportar_resultados/exportar_resultados";
import ResultadosOficiales from "../features/modulo3/resultados_oficiales/resultados_oficiales";
import Plazas from "../features/modulo3/plazas/plazas";

const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("checkchow_session") || "null");
  } catch {
    return null;
  }
};

function ProtectedRoute({ children }) {
  const session = getSession();
  if (!session?.token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><GestUsuarios /></ProtectedRoute>} />
        <Route path="/carreras" element={<ProtectedRoute><GestCarreras /></ProtectedRoute>} />
        <Route path="/procesos" element={<ProtectedRoute><GestProcesos /></ProtectedRoute>} />
        <Route path="/temas" element={<ProtectedRoute><GestTemas /></ProtectedRoute>} />
        <Route path="/vacantes" element={<ProtectedRoute><GestVacantes /></ProtectedRoute>} />
        <Route path="/auditoria" element={<ProtectedRoute><Auditoria /></ProtectedRoute>} />
        <Route path="/gest-claves" element={<ProtectedRoute><GestClavesRespuesta /></ProtectedRoute>} />
        <Route path="/inscripciones" element={<ProtectedRoute><GestInscripciones /></ProtectedRoute>} />
        <Route path="/resultados-bd" element={<ProtectedRoute><GestResultadosAdmision /></ProtectedRoute>} />
        <Route path="/respuestas_postulantes" element={<ProtectedRoute><GestRespPost /></ProtectedRoute>} />
        <Route path="/postulantes" element={<ProtectedRoute><GestPostulantes /></ProtectedRoute>} />
        <Route path="/omr" element={<ProtectedRoute><Omr /></ProtectedRoute>} />
        <Route path="/gestion-resultados" element={<ProtectedRoute><GestResultados /></ProtectedRoute>} />
        <Route path="/resultados" element={<ProtectedRoute><Resultados /></ProtectedRoute>} />
        <Route path="/configuracion-calificacion" element={<ProtectedRoute><ConfiguracionCalificacion /></ProtectedRoute>} />
        <Route path="/exportar-resultados" element={<ProtectedRoute><ExportarResultados /></ProtectedRoute>} />
        <Route path="/resultados-oficiales" element={<ProtectedRoute><ResultadosOficiales /></ProtectedRoute>} />
        <Route path="/plazas" element={<ProtectedRoute><Plazas /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
