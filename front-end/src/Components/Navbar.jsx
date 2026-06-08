import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(saved);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const links = ["Home", "Features", "Services", "About", "Contact"];

  const getHref = (label) => `#${label.toLowerCase()}`;

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className="
      fixed top-0 left-0 w-full z-50
      backdrop-blur-xl
      bg-yellow-400
      border-b border-yellow-300
      shadow-lg
      "
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-black text-black cursor-pointer"
            >
              QuickMSP
            </motion.h1>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">

            {links.map((link, index) => (
              <motion.a
                key={index}
                href={getHref(link)}
                whileHover={{ y: -2 }}
                className="relative text-black font-semibold group"
              >
                {link}

                <span
                  className="
                  absolute left-0 -bottom-1
                  h-0.5 w-0
                  bg-black
                  transition-all duration-300
                  group-hover:w-full
                  "
                />
              </motion.a>
            ))}

            {/* DARK MODE + LOGIN */}
            <div className="flex items-center gap-4">

              {/* DARK MODE TOGGLE */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full transition hover:scale-110"
              >
                {darkMode ? (
                  <Sun size={22} />
                ) : (
                  <Moon size={22} />
                )}
              </button>

              {/* LOGIN BUTTON */}
              <Link to="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    px-6 py-2 rounded-full
                    bg-black text-white font-semibold
                    shadow-lg
                  "
                >
                  Connexion
                </motion.button>
              </Link>
            </div>
          </div>

          {/* MOBILE BUTTONS */}
          <div className="md:hidden flex items-center gap-3">

            {/* DARK MODE MOBILE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-black"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-black"
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />

            {/* PANEL */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="
                fixed top-0 right-0
                h-screen w-72
                bg-white shadow-2xl
                z-50 p-6 md:hidden
              "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-10">

                <h2 className="text-2xl font-black">Menu</h2>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                  </button>

                  <button onClick={closeMenu}>
                    <X size={30} />
                  </button>
                </div>
              </div>

              {/* LINKS */}
              <div className="flex flex-col gap-6">

                {links.map((link, index) => (
                  <a
                    key={index}
                    href={getHref(link)}
                    onClick={closeMenu}
                    className="
                      text-lg font-semibold
                      text-gray-800
                      hover:text-yellow-500
                    "
                  >
                    {link}
                  </a>
                ))}

                {/* LOGIN */}
                <Link to="/signin" onClick={closeMenu}>
                  <button
                    className="
                      w-full mt-4
                      py-3 rounded-2xl
                      bg-black text-white font-bold
                    "
                  >
                    Connexion
                  </button>
                </Link>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}