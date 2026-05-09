import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../auth/login";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;