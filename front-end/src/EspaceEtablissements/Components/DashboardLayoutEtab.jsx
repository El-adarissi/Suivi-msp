import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom"; // <-- Crucial Imports!
import { useNavigate } from "react-router-dom";
export default function DashboardLayoutEtab() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Items path matches exactly what we defined in App.jsx
  const navigationItems = [
    { id: "etablissementsetab", label: "Informations Établissement" },
    { id: "stagiairesetab", label: "Stagiaires Enregistrés" },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-200">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 h-16 border-b border-slate-200 dark:border-slate-800 px-6">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">M</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Espace Etablissement</h2>
        </div>

        {/* Dynamic NavLinks instead of buttons */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/dashboardetab/${item.id}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {/* Logout — left side */}
        </nav>
        {/* Bouton déconnexion — épinglé en bas */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Container Window */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar Controls */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
          <div className="flex items-center">
            <button
              className="p-2 mr-3 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <span className="text-xs uppercase tracking-widest font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Espace Etablissement
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:outline-none transition-colors"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Dynamic Route Slot */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}