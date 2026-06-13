/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Send, Eye } from "lucide-react"; 

export function Reclamations() {
  const [reclamations, setReclamations] = useState([]);
  const [etablissements, setEtablissements] = useState([]); 
  const [selectedEtab, setSelectedEtab] = useState({}); 
  const [filterType, setFilterType] = useState("tous");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchReclamations();
    fetchEtablissements(); 
  }, []);

  const fetchEtablissements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/etablissements`);
      setEtablissements(res.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des établissements :", err);
    }
  };

  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/reclamations`);
      setReclamations(res.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeEtab = async (idReclamation) => {
    const etabId = selectedEtab[idReclamation];
    if (!etabId) {
      alert("Veuillez sélectionner un établissement dans la liste.");
      return;
    }
    try {
      await axios.put(`${API_URL}/api/admin/reclamations/${idReclamation}/proposer`, {
        Id_Etablissement: etabId
      });
      alert("Proposition transmise à l'établissement avec succès.");
      fetchReclamations();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la soumission.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/reclamations/${id}/accepter`);
      alert("Demande validée définitivement par l'administration.");
      fetchReclamations();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation.");
    }
  };

  const handleRefuse = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/reclamations/${id}/refuser`);
      alert("Demande refusée.");
      fetchReclamations();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du refus.");
    }
  };

  const filteredReclamations = reclamations.filter((rec) => {
    if (filterType === "echange_valide") {
      return rec.type === "echange_etablissement" && String(rec.statut) === "accord_binome";
    }
    if (filterType === "changement") {
      return rec.type === "changement_etablissement";
    }
    if (filterType === "en_attente") {
      return (
        rec.statut === "en_attente" ||
        rec.statut === "attente_confirmation" ||
        rec.statut === "accord_binome" ||
        rec.statut === "attente_etablissement"
      );
    }
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "acceptee":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "refusee":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
      case "attente_confirmation":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "accord_binome":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
      case "attente_etablissement":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "acceptee": return "Validé définitif";
      case "refusee": return "Refusé";
      case "attente_confirmation": return "Attente Binôme";
      case "accord_binome": return "Accord Binôme / À valider";
      case "attente_etablissement": return "Attente validation Établissement";
      default: return "En attente Admin";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Gestion des Réclamations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Traitez les demandes de changement et de permutation de stages.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/60">
          {filteredReclamations.length} Affichée(s)
        </span>
      </div>

      {/* Onglets Filtrage */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <button onClick={() => setFilterType("tous")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${filterType === "tous" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
          Toutes ({reclamations.length})
        </button>
        <button onClick={() => setFilterType("echange_valide")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${filterType === "echange_valide" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
          Prêts pour Validation ({reclamations.filter((r) => String(r.statut) === "accord_binome").length})
        </button>
        <button onClick={() => setFilterType("changement")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${filterType === "changement" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
          Changements Simples
        </button>
        <button onClick={() => setFilterType("en_attente")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${filterType === "en_attente" ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
          En attente de traitement
        </button>
      </div>

      {/* Tableau principal */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">Chargement des dossiers...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-700 dark:text-slate-300 min-w-200">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-left text-xs uppercase tracking-wider">
                <th className="py-3 font-semibold">Nature</th>
                <th className="py-3 font-semibold">Demandeur</th>
                <th className="py-3 font-semibold">Cible</th>
                <th className="py-3 font-semibold">Motif</th>
                <th className="py-3 font-semibold">Statut</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredReclamations.map((rec) => (
                <tr key={rec.Id_Reclamation} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${rec.type === "echange_etablissement" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"}`}>
                      {rec.type === "echange_etablissement" ? "Permutation" : "Réaffectation"}
                    </span>
                  </td>

                  <td className="py-4 font-semibold text-slate-900 dark:text-white">{rec.stagiaire_nom}</td>

                  <td className="py-4 text-xs">
                    {rec.type === "echange_etablissement" ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-200">🤝 Binôme: {rec.stagiaire_cible_nom || "Non spécifié"}</span>
                        {rec.statut === "accord_binome" && <span className="text-[10px] text-indigo-500 font-bold">✨ Co-signé</span>}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-slate-600 dark:text-slate-400">🏢 {rec.etablissement_cible_nom || "Non spécifiée"}</span>
                        {rec.statut === "attente_etablissement" && <span className="text-[10px] text-purple-500 font-medium animate-pulse">⏳ Envoyé à l'établissement</span>}
                      </div>
                    )}
                  </td>

                  <td className="py-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={rec.description}>{rec.description}</td>

                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(rec.statut)}`}>
                      {getStatusLabel(rec.statut)}
                    </span>
                  </td>

                  {/* CELLULE D'ACTIONS DE TRAITEMENT */}
                  <td className="py-4 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      
                      {filterType === "en_attente" && rec.statut === "attente_etablissement" ? (
                        <div className="p-1 text-purple-400" title="Dossier en cours d'examen par l'établissement">
                          <Eye size={16} />
                        </div>
                      ) : filterType === "en_attente" ? (
                        <div className="p-1 text-slate-400" title="Consultation seule">
                          <Eye size={16} />
                        </div>
                      ) : rec.type === "changement_etablissement" && rec.statut === "en_attente" ? (
                        <>
                          <select
                            value={selectedEtab[rec.Id_Reclamation] || ""}
                            onChange={(e) => setSelectedEtab({ ...selectedEtab, [rec.Id_Reclamation]: e.target.value })}
                            className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none"
                          >
                            <option value="">-- Choisir Établissement --</option>
                            {etablissements.map((etab) => (
                              <option key={etab.Id_Etablissement} value={etab.Id_Etablissement}>
                                {etab.NomEtab} ({etab.Ville})
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => handleProposeEtab(rec.Id_Reclamation)}
                            className="p-1.5 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
                            title="Proposer à cet établissement"
                          >
                            <Send size={14} />
                          </button>

                          <button
                            onClick={() => handleRefuse(rec.Id_Reclamation)}
                            className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 transition"
                            title="Refuser directement la réclamation"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRefuse(rec.Id_Reclamation)}
                            disabled={rec.statut === "refusee" || rec.statut === "attente_etablissement"}
                            className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Refuser"
                          >
                            <X size={14} />
                          </button>

                          {/* Pas d'icône Check du tout pour le changement d'établissement simple */}
                          {rec.type !== "changement_etablissement" && (
                            <button
                              onClick={() => handleAccept(rec.Id_Reclamation)}
                              disabled={
                                rec.statut === "acceptee" ||
                                rec.statut === "attente_confirmation" ||
                                rec.statut === "attente_etablissement"
                              }
                              className="p-1.5 rounded text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title={rec.statut === "attente_etablissement" ? "En attente de la réponse de l'établissement" : "Accepter définitivement"}
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}