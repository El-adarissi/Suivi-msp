import Navbar from "./Components/Navbar";
import HeroSection from "./Components/HeroSection";
import FeaturesSection from "./Components/FeaturesSection";
import ServicesSection from "./Components/ServicesSection";
import Footer from "./Components/Footer";

function App() {
  return (
    <div
      className="
      min-h-screen
      bg-white dark:bg-[#020617]
      transition-all duration-500
      "
    >
      <Navbar />

      <main className="pt-20 md:pt-24">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
      </main>
      
      <Footer />
      
    </div>
  );
}

export default App;