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
import DashboardHome from "./EspaceAdmin/Components/DashboardHome";
import DashboardLayoutEtab from "./EspaceEtablissements/Components/DashboardLayoutEtab";
import { EtablissementsEtab } from "./EspaceEtablissements/Components/EtablissementsEtab";
import { StagiairesEtab } from "./EspaceEtablissements/Components/StagiairesEtab";
import { SuperviseursEtab } from "./EspaceEtablissements/Components/SuperviseursEtab";
import { ReclamationsEtab } from "./EspaceEtablissements/Components/ReclamationsEtab";
import DashboardLayoutStag from "./EspaceStagaires/Components/DashboardLayoutStag";
import { EtablissementsStag } from "./EspaceStagaires/Components/EtablissementsStag";
import { ReclamationsStag } from "./EspaceStagaires/Components/ReclamationsStag";
import StagiairesStag from "./EspaceStagaires/Components/StagiairesStag";
import {RapportsStagiaire} from "./EspaceStagaires/Components/RapportsStagiaire";

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
          <Route index element={<DashboardHome />} />

          {/* Nested Sub-routes */}
          <Route path="etablissements" element={<Etablissements />} />
          <Route path="stagiaires" element={<Stagiaires />} />
          <Route path="superviseurs" element={<Superviseurs />} />
          <Route path="reclamations" element={<Reclamations />} />
        </Route>

        <Route
          path="/DashboardLayout"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Dashboard Superviseur */}
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


        {/* Dashboard Etablissement */}
         <Route path="/dashboardetab" element={<DashboardLayoutEtab />}>
          <Route index element={<EtablissementsEtab />} />
          <Route path="etablissementsetab" element={<EtablissementsEtab />} />
          <Route path="stagiairesetab" element={<StagiairesEtab />} />
          <Route path="superviseursetab" element={<SuperviseursEtab />} />
          <Route path="reclamationsetab" element={<ReclamationsEtab />} />
        </Route> 



        {/* Dashboard Etablissement */}
         <Route path="/dashboardstag" element={<DashboardLayoutStag />}>
          <Route index element={<DashboardLayoutStag />} />
          <Route path="rapports" element={<RapportsStagiaire />} />
          <Route path="etablissementstag" element={<EtablissementsStag />} />
          <Route path="stagiairestag" element={<StagiairesStag />} />
          <Route path="reclamationstag" element={<ReclamationsStag />} />
        </Route> 
        
      </Routes>
    </div>
  );
}
