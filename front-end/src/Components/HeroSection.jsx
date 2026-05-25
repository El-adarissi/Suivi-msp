import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, Database } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="
      relative min-h-screen
      overflow-hidden
      bg-white dark:bg-[#050816]
      transition-all duration-500
      scroll-mt-28
    "
    >
      {/* BACKGROUND EFFECTS */}
      <div
        className="
        absolute top-0 left-0 w-full h-full
        bg-linear-to-br
        from-yellow-200/40
        via-transparent
        to-yellow-500/20
        dark:from-yellow-500/10
        dark:to-yellow-700/20
      "
      />

      <div
        className="
        absolute top-20 -left-20
        w-72 h-72 rounded-full
        bg-yellow-400/30 blur-3xl
      "
      />

      <div
        className="
        absolute bottom-0 right-0
        w-96 h-96 rounded-full
        bg-yellow-500/20 blur-3xl
      "
      />

      {/* CONTENT */}
      <div
        className="
        relative z-10
        max-w-7xl mx-auto
        px-6 lg:px-10
        pt-36 pb-20
      "
      >
        <div
          className="
          grid lg:grid-cols-2
          gap-16 items-center
        "
        >
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-full
              bg-yellow-100 dark:bg-yellow-500/10
              border border-yellow-300 dark:border-yellow-500/20
              mb-6
            "
            >
              <ShieldCheck
                className="text-yellow-600 dark:text-yellow-400"
                size={18}
              />

              <span
                className="
                text-sm font-medium
                text-yellow-800 dark:text-yellow-300
              "
              >
                Suivi Intelligent MSP - CERMF
              </span>
            </motion.div>

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="
              text-5xl md:text-6xl lg:text-7xl
              font-black leading-tight
              text-gray-900 dark:text-white
            "
            >
              Gestion et
              <span
                className="
                block mt-2
                bg-linear-to-r
                from-yellow-500
                via-yellow-400
                to-amber-600
                bg-clip-text text-transparent
              "
              >
                Suivi MSP CERMF
              </span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="
              mt-8 text-lg md:text-xl
              text-gray-600 dark:text-gray-300
              leading-relaxed
              max-w-2xl
            "
            >
              Plateforme intelligente de suivi, gestion et supervision
              des activités MSP du CERMF avec visualisation des données,
              automatisation et monitoring en temps réel.
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="
              mt-10
              flex flex-col sm:flex-row
              gap-5
            "
            >
              {/* PRIMARY BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                px-8 py-4 rounded-2xl
                bg-linear-to-r
                from-yellow-500
                to-amber-600
                text-white font-semibold
                shadow-xl shadow-yellow-500/30
                flex items-center justify-center gap-3
                transition-all duration-300
              "
              >
                Commencer
                <ArrowRight size={20} />
              </motion.button>

              {/* SECONDARY BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                px-8 py-4 rounded-2xl
                border border-yellow-400/40
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                text-gray-900 dark:text-white
                font-semibold
                hover:bg-yellow-50 dark:hover:bg-yellow-500/10
                transition-all duration-300
              "
              >
                Découvrir Plus
              </motion.button>
            </motion.div>

            {/* FEATURES */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="
              mt-14
              grid sm:grid-cols-3 gap-5
            "
            >
              {/* CARD 1 */}
              <div
                className="
                p-5 rounded-2xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                border border-gray-200 dark:border-white/10
                shadow-lg
              "
              >
                <Activity
                  className="text-yellow-500 mb-3"
                  size={28}
                />

                <h3
                  className="
                  text-lg font-bold
                  text-gray-900 dark:text-white
                "
                >
                  Monitoring
                </h3>

                <p
                  className="
                  mt-2 text-sm
                  text-gray-600 dark:text-gray-300
                "
                >
                  Surveillance en temps réel des activités MSP.
                </p>
              </div>

              {/* CARD 2 */}
              <div
                className="
                p-5 rounded-2xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                border border-gray-200 dark:border-white/10
                shadow-lg
              "
              >
                <Database
                  className="text-yellow-500 mb-3"
                  size={28}
                />

                <h3
                  className="
                  text-lg font-bold
                  text-gray-900 dark:text-white
                "
                >
                  Données
                </h3>

                <p
                  className="
                  mt-2 text-sm
                  text-gray-600 dark:text-gray-300
                "
                >
                  Centralisation et analyse des données CERMF.
                </p>
              </div>

              {/* CARD 3 */}
              <div
                className="
                p-5 rounded-2xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                border border-gray-200 dark:border-white/10
                shadow-lg
              "
              >
                <ShieldCheck
                  className="text-yellow-500 mb-3"
                  size={28}
                />

                <h3
                  className="
                  text-lg font-bold
                  text-gray-900 dark:text-white
                "
                >
                  Sécurité
                </h3>

                <p
                  className="
                  mt-2 text-sm
                  text-gray-600 dark:text-gray-300
                "
                >
                  Protection et accès sécurisé des informations.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* MAIN CARD */}
            <div
              className="
              relative
              rounded-4xl
              bg-white/70 dark:bg-white/5
              backdrop-blur-2xl
              border border-white/20
              shadow-2xl
              p-8
            "
            >
              {/* TOP BAR */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <div className="w-4 h-4 rounded-full bg-green-400" />
              </div>

              {/* DASHBOARD */}
              <div className="space-y-6">
                {/* BOX */}
                <div
                  className="
                  h-28 rounded-2xl
                  bg-linear-to-r
                  from-yellow-400
                  to-amber-500
                  shadow-xl
                "
                />

                <div className="grid grid-cols-2 gap-5">
                  <div
                    className="
                    h-40 rounded-2xl
                    bg-white dark:bg-[#101828]
                    shadow-lg
                  "
                  />

                  <div
                    className="
                    h-40 rounded-2xl
                    bg-white dark:bg-[#101828]
                    shadow-lg
                  "
                  />
                </div>

                <div
                  className="
                  h-24 rounded-2xl
                  bg-white dark:bg-[#101828]
                  shadow-lg
                "
                />
              </div>

              {/* FLOATING CARD */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                }}
                className="
                absolute -right-6 -bottom-6
                px-6 py-4 rounded-2xl
                bg-yellow-500
                text-white
                shadow-2xl
              "
              >
                <p className="text-sm opacity-80">
                  Activité MSP
                </p>

                <h3 className="text-2xl font-bold">
                  +98%
                </h3>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}