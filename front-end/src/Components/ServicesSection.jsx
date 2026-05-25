import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaFileAlt,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";

export default function ServicesSection() {
  const services = [
    {
      icon: <FaUserGraduate />,
      title: "Gestion des Stagiaires",
      description:
        "Suivi intelligent des stagiaires et gestion des informations personnelles.",
    },

    {
      icon: <FaChalkboardTeacher />,
      title: "Gestion des Superviseurs",
      description:
        "Attribution des superviseurs et suivi des encadrements MSP.",
    },

    {
      icon: <FaSchool />,
      title: "Gestion des Établissements",
      description:
        "Organisation des établissements et affectation des stagiaires.",
    },

    {
      icon: <FaFileAlt />,
      title: "Gestion des Rapports",
      description:
        "Création, stockage et consultation des rapports des stagiaires.",
    },

    {
      icon: <FaSignInAlt />,
      title: "Connexion & Inscription",
      description:
        "Authentification sécurisée avec système de login et signup.",
    },

    {
      icon: <FaLock />,
      title: "Sécurité des Données",
      description:
        "Protection des données et vérification des accès utilisateurs.",
    },
  ];

  return (
    <section
      id="services"
      className="
      py-24
      bg-gray-50
      dark:bg-[#0B1120]
      "
    >
      <div
        className="
        max-w-7xl mx-auto
        px-6 lg:px-10
        "
      >
        {/* TITLE */}
        <div className="text-center mb-16">
          <p
            className="
            text-yellow-500
            font-bold
            uppercase
            tracking-widest
            "
          >
            SERVICES
          </p>

          <h2
            className="
            mt-4
            text-4xl md:text-5xl
            font-black
            text-black dark:text-white
            "
          >
            Services de l’Application MSP
          </h2>

          <p
            className="
            mt-6
            max-w-2xl mx-auto
            text-gray-600 dark:text-gray-300
            "
          >
            Plateforme intelligente de suivi MSP
            pour la gestion des stagiaires,
            superviseurs et établissements du CRMEF.
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
          {services.map((service, index) => (
            <div
              key={index}
              className="
              group
              p-8 rounded-3xl
              bg-white
              dark:bg-white/5
              border border-gray-200
              dark:border-white/10
              shadow-lg
              hover:-translate-y-2
              hover:shadow-2xl
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
                group-hover:scale-110
                transition-all duration-300
                "
              >
                {service.icon}
              </div>

              {/* TITLE */}
              <h3
                className="
                text-2xl font-bold
                text-black dark:text-white
                "
              >
                {service.title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className="
                mt-4
                text-gray-600 dark:text-gray-300
                leading-relaxed
                "
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}