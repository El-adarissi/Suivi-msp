import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";

export default function SignIn() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("ROLE :", role);

    navigate("/");
  };

  return (
    <section
      className="
      min-h-screen
      flex items-center justify-center
      bg-gray-100
      dark:bg-[#020617]
      px-6 py-10
      "
    >
      <div
        className="
        w-full max-w-md
        p-8 rounded-3xl
        bg-white
        dark:bg-white/5
        border border-gray-200
        dark:border-white/10
        shadow-2xl
        "
      >
        {/* BACK HOME */}
        <Link
          to="/"
          className="
          inline-block mb-6
          text-yellow-500
          font-semibold
          hover:translate-x-1
          transition-all duration-300
          "
        >
          ← Retour à l'accueil
        </Link>

        {/* TITLE */}
        <div className="text-center">
          <h1
            className="
            text-4xl font-black
            text-black dark:text-white
            "
          >
            Sign In
          </h1>

          <p
            className="
            mt-3
            text-gray-600 dark:text-gray-300
            "
          >
            Connexion MSP CRMEF
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black dark:text-white
            "
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black dark:text-white
            "
          />

          {/* ROLE */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black 
            "
          >
            <option value="">
              Sélectionner votre rôle
            </option>

            <option value="admin_crmef">
              Admin CRMEF
            </option>

            <option value="stagiaire">
              Stagiaire
            </option>

            <option value="supervisor">
              Superviseur
            </option>

            <option value="admin_etablissement">
              Admin Établissement
            </option>
          </select>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="
            w-full py-4 rounded-2xl
            bg-yellow-400
            hover:bg-yellow-500
            text-white font-bold
            transition-all duration-300
            "
          >
            Sign In
          </button>
        </form>

        {/* GOOGLE */}
        <button
          className="
          w-full mt-5
          py-4 rounded-2xl
          border border-gray-300
          dark:border-white/10
          flex items-center justify-center gap-3
          text-black dark:text-white
          hover:bg-gray-100
          dark:hover:bg-white/5
          transition-all duration-300
          "
        >
          <FaGoogle />

          Continue with Google
        </button>

      </div>
    </section>
  );
}