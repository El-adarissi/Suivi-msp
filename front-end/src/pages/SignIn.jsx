import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function SignIn() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !role) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password, role }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "responsable_crmef":
          navigate("/dashboard");
          break;
        case "superviseur":
          navigate("/dashboard/superviseur");
          break;
        case "stagiaire":
          navigate("/dashboard/stagiaire");
          break;
        case "etablissement":
          navigate("/dashboard/etablissement");
          break;
          case "etablissementetab":
            navigate("/dashboardetab/etablissementsetab");
            break;
          case "stagiairesetab":
            navigate("/dashboardetab/stagiairesetab");
            break;
          case "stagiairestag":
            navigate("/dashboardstag/stagiairestag");
            break;
          
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#020617] px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl transition-all">

        {/* BACK */}
        <Link to="/" className="text-yellow-500 font-semibold hover:underline">
          ← Retour à l'accueil
        </Link>

        {/* TITLE */}
        <div className="text-center mt-4">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Connexion MSP CRMEF
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full p-4 rounded-2xl
              bg-gray-100 dark:bg-white/10
              text-gray-900 dark:text-white
              border border-gray-200 dark:border-white/10
              outline-none focus:ring-2 focus:ring-yellow-400
              transition
            "
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full p-4 rounded-2xl
              bg-gray-100 dark:bg-white/10
              text-gray-900 dark:text-white
              border border-gray-200 dark:border-white/10
              outline-none focus:ring-2 focus:ring-yellow-400
              transition
            "
          />

          {/* ROLE */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              w-full p-4 rounded-2xl
              bg-gray-100 dark:bg-white/10
              text-gray-900 dark:text-white
              border border-gray-200 dark:border-white/10
              outline-none focus:ring-2 focus:ring-yellow-400
              transition
            "
          >
            <option value="">Sélectionner votre rôle</option>
            <option value="responsable_crmef">Admin CRMEF</option>
            <option value="stagiairestag">Stagiaire</option>
            <option value="superviseur">Superviseur</option>
            <option value="etablissementetab">Admin Établissement</option>
          </select>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-2xl
              bg-yellow-400 hover:bg-yellow-500
              disabled:opacity-50 disabled:cursor-not-allowed
              text-black font-bold
              transition
            "
          >
            {loading ? "Connexion..." : "Sign In"}
          </button>

        </form>
      </div>
    </section>
  );
}
