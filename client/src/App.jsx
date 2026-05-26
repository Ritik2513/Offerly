import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Offers from "./pages/Offers";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import TrackingLinks from "./pages/TrackingLinks";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/tracking-links" element={<TrackingLinks />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" duration={2500} />
    </>
  );
};

export default App;
