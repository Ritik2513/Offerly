import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Offers from "./pages/Offers";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import TrackingLinks from "./pages/TrackingLinks";
import Affiliates from "./pages/Affiliates";
import Conversions from "./pages/Conversions";
import Payouts from "./pages/Payouts";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/tracking-links" element={<TrackingLinks />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/conversions" element={<Conversions />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-right" duration={2500} />
    </>
  );
};

export default App;
