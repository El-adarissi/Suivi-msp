import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SIGNUP
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // SAVE USER TEMPORARILY
    localStorage.setItem(
      "user",
      JSON.stringify(formData)
    );

    // REDIRECT TO HOME PAGE
    navigate("/");
  };

  return (
    <section
      className="
      min-h-screen
      flex items-center justify-center
      bg-gray-100
      dark:bg-[#020617]
      px-6
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
        {/* TITLE */}
        <div className="text-center">
          <h1
            className="
            text-4xl font-black
            text-black dark:text-white
            "
          >
            Create Account
          </h1>

          <p
            className="
            mt-3
            text-gray-600 dark:text-gray-300
            "
          >
            Plateforme MSP CRMEF
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* FULL NAME */}
          <input
            type="text"
            name="fullname"
            placeholder="Nom complet"
            onChange={handleChange}
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black dark:text-white
            "
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
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
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black dark:text-white
            "
          />

          {/* ROLE SELECT */}
          <select
            name="role"
            onChange={handleChange}
            required
            className="
            w-full p-4 rounded-2xl
            bg-gray-100 dark:bg-white/10
            border border-gray-200 dark:border-white/10
            outline-none
            text-black dark:text-white
            "
          >
            <option value="">
              Sélectionner un rôle
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

          {/* BUTTON */}
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
            Create Account
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

        {/* LINK */}
        <p
          className="
          mt-6 text-center
          text-gray-600 dark:text-gray-300
          "
        >
          Already have an account?{" "}

          <Link
            to="/signin"
            className="text-yellow-500 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}