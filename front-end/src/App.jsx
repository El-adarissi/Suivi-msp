import {Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import ServicesSection from "./components/ServicesSection";
import Footer from "./components/Footer";

import SignIn from "./pages/SignIn";

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

        </Routes>
      </div>
  );
}