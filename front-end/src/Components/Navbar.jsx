import { useState } from "react";
import { Menu, X} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    "Home",
    "Features",
    "Services",
    "About",
    "Contact",
  ];

  const getHref = (label) => `#${label.toLowerCase()}`;

  return (
    <nav
      className="
      fixed top-0 left-0 w-full z-50
      backdrop-blur-xl
      bg-yellow-400
      border-b border-yellow-300 dark:border-yellow-700
      shadow-lg
    "
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">

          {/* LOGO */}
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="
            text-3xl font-black
            bg-linear-to-r from-black to-yellow-900
            dark:from-white dark:to-yellow-100
            bg-clip-text text-transparent
            cursor-pointer
          "
          >
            QuickMSP
          </motion.h1>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <motion.a
                key={index}
                href={getHref(link)}
                whileHover={{ y: -2 }}
                className="
                relative
                text-black dark:text-white
                font-semibold
                hover:text-yellow-900 dark:hover:text-yellow-200
                transition-all duration-300
                group
              "
              >
                {link}

                <span
                  className="
                  absolute left-0 -bottom-1
                  h-0.5 w-0
                  bg-black dark:bg-white
                  transition-all duration-300
                  group-hover:w-full
                "
                />
              </motion.a>
            ))}

            {/* CONNEXION BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
              px-6 py-2 rounded-full
              bg-black dark:bg-white
              text-white dark:text-black
              font-semibold
              shadow-lg
              hover:scale-105
              transition-all duration-300
            "
            >
              Connexion
            </motion.button>
          </div>

          {/* MOBILE MENU BUTTONS */}
          <div className="flex md:hidden items-center gap-3">

            {/* MENU */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black dark:text-white"
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="
            md:hidden
            bg-yellow-300 dark:bg-yellow-700
            px-6 py-6
            space-y-5
          "
          >
            {links.map((link, index) => (
              <a
                key={index}
                href={getHref(link)}
                className="
                block
                text-black dark:text-white
                font-medium
              "
              >
                {link}
              </a>
            ))}

            {/* MOBILE CONNEXION BUTTON */}
            <button
              className="
              w-full py-3 rounded-xl
              bg-black dark:bg-white
              text-white dark:text-black
              font-semibold
              shadow-lg
            "
            >
              Connexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}