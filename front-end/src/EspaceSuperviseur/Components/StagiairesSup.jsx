/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

export function StagiairesSup() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_URL}/api/stagiaires`,
        {
          headers: authHeaders()
        }
      );

      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Répertoire des Stagiaires
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Suivi des stagiaires affectés.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            Chargement...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-slate-700 dark:text-slate-300">
                  Stagiaire
                </th>

                <th className="px-6 py-3 text-slate-700 dark:text-slate-300">
                  Email
                </th>

                <th className="px-6 py-3 text-slate-700 dark:text-slate-300">
                  Établissement
                </th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {item.nom}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {item.email}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {item.etablissement || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    Aucun stagiaire trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}