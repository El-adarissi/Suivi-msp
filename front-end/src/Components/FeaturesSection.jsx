import {
  FaDatabase,
  FaShieldAlt,
  FaChartBar,
  FaBell,
  FaRobot,
} from "react-icons/fa";

import { MdMonitor } from "react-icons/md";

export default function FeaturesSection() {
  const features = [
    {
      icon: <MdMonitor />,
      title: "Monitoring",
      text: "Suivi MSP en temps réel.",
    },

    {
      icon: <FaDatabase />,
      title: "Données",
      text: "Gestion intelligente des données.",
    },

    {
      icon: <FaShieldAlt />,
      title: "Sécurité",
      text: "Protection des informations.",
    },

    {
      icon: <FaChartBar />,
      title: "Analytics",
      text: "Statistiques et visualisation.",
    },

    {
      icon: <FaBell />,
      title: "Notifications",
      text: "Alertes automatiques instantanées.",
    },

    {
      icon: <FaRobot />,
      title: "Automation",
      text: "Optimisation des processus.",
    },
  ];

  return (
    <section
      id="features"
      className="
      py-24
      bg-white
      dark:bg-[#020617]
      scroll-mt-28
      "
    >
      <div
        className="
        max-w-7xl mx-auto
        px-6
        "
      >
        {/* TITLE */}
        <div className="text-center mb-16">
          <h2
            className="
            text-4xl md:text-5xl
            font-black
            text-black dark:text-white
            "
          >
            Features
          </h2>

          <p
            className="
            mt-5
            text-gray-600 dark:text-gray-300
            max-w-2xl mx-auto
            "
          >
            Plateforme intelligente de suivi MSP
            pour le CERMF.
          </p>
        </div>

        {/* GRID */}
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-8
          "
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="
              p-8 rounded-3xl
              bg-gray-50
              dark:bg-white/5
              border border-gray-200
              dark:border-white/10
              hover:-translate-y-2
              hover:shadow-xl
              transition-all duration-300
              "
            >
              {/* ICON */}
              <div
                className="
                w-16 h-16
                rounded-2xl
                bg-yellow-400
                text-white
                flex items-center justify-center
                text-2xl
                mb-6
                "
              >
                {feature.icon}
              </div>

              {/* TITLE */}
              <h3
                className="
                text-2xl font-bold
                text-black dark:text-white
                "
              >
                {feature.title}
              </h3>

              {/* TEXT */}
              <p
                className="
                mt-4
                text-gray-600 dark:text-gray-300
                "
              >
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}