import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import ServicesSection from "./components/ServicesSection";
import Footer from "./components/Footer";
import DashboardLayout from "./EspaceAdmin/Components/DashboardLayout";
import { Etablissements } from "./EspaceAdmin/Components/Etablissements";
import { Stagiaires } from "./EspaceAdmin/Components/Stagiaires";
import { Superviseurs } from "./EspaceAdmin/Components/Superviseurs";
import { Reclamations } from "./EspaceAdmin/Components/Reclamations";
import SignIn from "./pages/SignIn";
import { EtablissementsSup } from "./EspaceSuperviseur/Components/EtablissementsSup";
import { StagiairesSup } from "./EspaceSuperviseur/Components/Stagiaires";
import { SuperviseursSup } from "./EspaceSuperviseur/Components/Superviseurs";
import { ReclamationsSup } from "./EspaceSuperviseur/Components/Reclamations";

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="bg-white dark:bg-[#020617] min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Dashboard Admin */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default view when opening /dashboard directly */}
          <Route index element={<Etablissements />} />

          {/* Nested Sub-routes */}
          <Route path="etablissements" element={<Etablissements />} />
          <Route path="stagiaires" element={<Stagiaires />} />
          <Route path="superviseurs" element={<Superviseurs />} />
          <Route path="reclamations" element={<Reclamations />} />
        </Route>

        {/* Fallback redirect for old URL case-sensitivity issues */}
        <Route
          path="/DashboardLayout"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Dashboard Parent Route Layout */}
        <Route path="/dashboardsup" element={<DashboardLayout />}>
          {/* Default view when opening /dashboard directly */}
          <Route index element={<Etablissements />} />

          {/* Nested Sub-routes */}
          <Route path="etablissementssup" element={<EtablissementsSup />} />
          <Route path="stagiairessup" element={<StagiairesSup />} />
          <Route path="superviseurssup" element={<SuperviseursSup />} />
          <Route path="reclamationssup" element={<ReclamationsSup />} />
        </Route>

        {/* Fallback redirect for old URL case-sensitivity issues */}
        <Route
          path="/DashboardLayoutSup"
          element={<Navigate to="/dashboardsup" replace />}
        />
      </Routes>
    </div>
  );
}
