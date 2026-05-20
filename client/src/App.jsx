import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Offers from "./pages/Offers";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" duration={2500} />
    </>
  );
};

export default App;
