import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

import {
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";

export default function Footer() {
  return (
    <footer
      className="
      relative
      bg-linear-to-br
      from-yellow-400
      via-amber-400
      to-yellow-500

      dark:from-[#0f172a]
      dark:via-[#111827]
      dark:to-[#020617]

      text-black dark:text-white
      overflow-hidden
      "
    >
      {/* BLUR EFFECT */}
      <div
        className="
        absolute top-0 left-0
        w-72 h-72
        bg-white/20
        rounded-full
        blur-3xl
        "
      />

      <div
        className="
        relative z-10
        max-w-7xl mx-auto
        px-6 lg:px-10
        py-16
        "
      >
        {/* MAIN */}
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-12
          "
        >
          {/* BRAND */}
          <div id="about" className="scroll-mt-28">
            <h1
              className="
              text-4xl font-black
              mb-5
              "
            >
              QuickMSP
            </h1>

            <p
              className="
              text-black/70
              dark:text-gray-300
              leading-relaxed
              "
            >
              Modern MSP management platform for
              CERMF with responsive dashboard,
              monitoring and analytics.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mt-6">
              {[
                FaFacebookF,
                FaInstagram,
                FaLinkedinIn,
                FaGithub,
              ].map((Icon, index) => (
                <button
                  key={index}
                  className="
                  w-11 h-11
                  rounded-full
                  bg-black/10
                  dark:bg-white/10
                  backdrop-blur-xl
                  flex items-center justify-center
                  hover:scale-110
                  transition-all duration-300
                  "
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Navigation
            </h2>

            <div className="space-y-4">
              {[
                "Home",
                "Features",
                "Services",
                "About",
                "Contact",
              ].map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="
                  block
                  hover:translate-x-1
                  transition-all duration-300
                  text-black/80
                  dark:text-gray-300
                  hover:text-black
                  dark:hover:text-yellow-400
                  "
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div id="services" className="scroll-mt-28">
            <h2 className="text-2xl font-bold mb-6">
              Services
            </h2>

            <div className="space-y-4">
              {[
                "Monitoring",
                "Analytics",
                "Dashboard",
                "Automation",
                "Security",
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="
                  block
                  hover:translate-x-1
                  transition-all duration-300
                  text-black/80
                  dark:text-gray-300
                  hover:text-black
                  dark:hover:text-yellow-400
                  "
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div id="contact" className="scroll-mt-28">
            <h2 className="text-2xl font-bold mb-6">
              Contact
            </h2>

            <div className="space-y-5">
              <div className="flex gap-4">
                <HiOutlineMail size={22} />

                <div>
                  <p className="font-semibold">
                    Email
                  </p>

                  <p className="text-black/70 dark:text-gray-300">
                    contact@QuickMSP.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <HiOutlineLocationMarker size={22} />

                <div>
                  <p className="font-semibold">
                    Adresse
                  </p>

                  <p className="text-black/70 dark:text-gray-300">
                    CERMF - Maroc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
          mt-14 pt-6
          border-t border-black/10
          dark:border-white/10
          flex flex-col md:flex-row
          items-center justify-between
          gap-4
          "
        >
          <p
            className="
            text-sm
            text-black/70
            dark:text-gray-400
            "
          >
            © 2026 QuickMSP. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="
              hover:text-black
              dark:hover:text-yellow-400
              transition
              "
            >
              Privacy
            </a>

            <a
              href="#"
              className="
              hover:text-black
              dark:hover:text-yellow-400
              transition
              "
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}