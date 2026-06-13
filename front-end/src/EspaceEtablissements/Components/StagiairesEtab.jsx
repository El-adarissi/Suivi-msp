import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export function StagiairesEtab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [filiereOptions, setFiliereOptions] = useState([]);

  const fetchAssignedTrainees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/etablissement/assigned-stagiaires`, { 
        headers: authHeaders() 
      });
      
      const trainees = res.data.data || [];
      setData(trainees);

      const filieres = [...new Set(trainees.map(t => t.Filiere).filter(Boolean))];
      setFiliereOptions(filieres);
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement de la liste des affectations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignedTrainees();
  }, []);

  // Action : Accepter (is_active = 1)
  const handleAccepter = async (id) => {
    try {
      await axios.put(`${API_URL}/api/etablissement/stagiaires/${id}/accepter`, {}, {
        headers: authHeaders()
      });
      // Mise à jour de l'état local instantanément
      setData(prev => prev.map(item => item.Id_Stagiaire === id ? { ...item, is_active: 1 } : item));
    } catch (err) {
      console.error(err);
      alert("Impossible de valider ce stagiaire.");
    }
  };

  // Action : Refuser (Retirer de la liste des affectés)
  const handleRefuser = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser ou retirer ce stagiaire ?")) return;
    try {
      await axios.put(`${API_URL}/api/etablissement/stagiaires/${id}/refuser`, {}, {
        headers: authHeaders()
      });
      // Supprimer de la liste puisqu'il n'est plus affecté à ce stage
      setData(prev => prev.filter(item => item.Id_Stagiaire !== id));
    } catch (err) {
      console.error(err);
      alert("Impossible de modifier l'affectation.");
    }
  };

  const filteredData = data.filter((item) => {
    const fullName = `${item.PrenomStag} ${item.NomStag}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          item.Email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFiliere = selectedFiliere === "" || item.Filiere === selectedFiliere;

    return matchesSearch && matchesFiliere;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Suivi des Affectations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Répertoire des stagiaires actuellement affectés.</p>
      </div>

      {/* Barre de Filtres unique */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Rechercher</label>
          <input
            type="text"
            placeholder="Nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Filière</label>
          <select
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          >
            <option value="">Toutes les filières</option>
            {filiereOptions.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau principal */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <svg className="w-6 h-6 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Chargement...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-rose-500 text-sm">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">Aucun stagiaire trouvé.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Stagiaire</th>
                  <th className="px-6 py-3.5 font-medium">Filière</th>
                  <th className="px-6 py-3.5 font-medium">Statut</th>
                  <th className="px-6 py-3.5 font-medium text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredData.map((item) => (
                  <tr key={item.Id_Stagiaire} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                          {item.PrenomStag[0]}{item.NomStag[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.PrenomStag} {item.NomStag}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">{item.Email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{item.Filiere || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {item.is_active ? 'Actif' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Bouton Accepter (Affiché uniquement si pas encore actif) */}
                        {!item.is_active ? (
                          <button
                            onClick={() => handleAccepter(item.Id_Stagiaire)}
                            title="Accepter le stagiaire"
                            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                        ) : (
                          <span className="w-8 h-5" /> /* Espacement structurel */
                        )}

                        {/* Bouton Refuser / Retirer */}
                        <button
                          onClick={() => handleRefuser(item.Id_Stagiaire)}
                          title="Refuser ou retirer le stagiaire"
                          className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}