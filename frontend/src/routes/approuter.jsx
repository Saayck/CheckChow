import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "../auth/login";
import DashboardPage from "../pages";
import GestUsuarios from "../features/modulo1/gest_usuarios/gest_usuarios";
import Auditoria from "../features/modulo1/auditoria/auditoria";
import GestRespPost from "../features/modulo2/gest_resp_post/gest_resp_post";
import GestPostulantes from "../features/modulo2/gest_postulantes/gest_postulantes";
import Respuestas from "../features/modulo2/proceso_respuestas/respuestas";
import GestResultados from "../features/modulo3/gest_resultados/gest_resultados";
import Resultados from "../features/modulo3/resultados/resultados";
import ConfiguracionCalificacion from "../features/modulo3/configuracion_calificacion/configuracion_calificacion";
import ExportarResultados from "../features/modulo3/exportar_resultados/exportar_resultados";
import ResultadosOficiales from "../features/modulo3/resultados_oficiales/resultados_oficiales";
import Plazas from "../features/modulo3/plazas/plazas";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<DashboardPage />} />
        <Route path="/usuarios" element={<GestUsuarios />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/respuestas_postulantes" element={<GestRespPost />} />
        <Route path="/postulantes" element={<GestPostulantes />} />
        <Route path="/respuestas" element={<Respuestas />} />
        <Route path="/gestion-resultados" element={<GestResultados />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/configuracion-calificacion" element={<ConfiguracionCalificacion />} />
        <Route path="/exportar-resultados" element={<ExportarResultados />} />
        <Route path="/resultados-oficiales" element={<ResultadosOficiales />} />
        <Route path="/plazas" element={<Plazas />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;