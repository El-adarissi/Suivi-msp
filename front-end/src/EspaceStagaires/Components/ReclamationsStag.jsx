/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import axios from "axios";

export function ReclamationsStag() {
  // --- États du Formulaire ---
  const [type, setType] = useState("changement_etablissement");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [etablissementDepart, setEtablissementDepart] = useState("");
  const [etablissementCible, setEtablissementCible] = useState("");
  const [stagiaireCible, setStagiaireCible] = useState("");

  // --- États des Données ---
  const [reclamations, setReclamations] = useState([]);
  const [reclamationsRecues, setReclamationsRecues] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Récupération Session Utilisateur ---
  const storedUserStr = localStorage.getItem("user");
  const loggedInUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const stagiaireId = loggedInUser
    ? loggedInUser.Id_Stagiaire || loggedInUser.id
    : null;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- Rafraîchissement des Listes ---
  const refreshReclamationsData = () => {
    if (stagiaireId && stagiaireId !== "null") {
      fetchMesReclamations();
      fetchDemandesRecues();
    }
  };

  useEffect(() => {
    fetchStagiaires();
    fetchEtablissements();
    refreshReclamationsData();
  }, [stagiaireId]);

  // --- Appels API HTTP ---
  const fetchStagiaires = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stagiairesrec`);
      const listeFiltree = (res.data || []).filter(
        (s) => String(s.Id_Stagiaire) !== String(stagiaireId),
      );
      setStagiaires(listeFiltree);
    } catch (err) {
      console.error("Erreur lors de la récupération des stagiaires :", err);
    }
  };

  const fetchEtablissements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/etablissements`);
      setEtablissements(res.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des établissements :", err);
    }
  };

  const fetchMesReclamations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/reclamations/stagiaire/${stagiaireId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReclamations(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des réclamations émises :", err);
    }
  };

  const fetchDemandesRecues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/reclamations/recues/${stagiaireId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReclamationsRecues(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des réclamations reçues :", err);
    }
  };

  // --- Actions Échanges (Accepter / Refuser par le Binôme) ---
  const handleReponseDemande = async (idReclamation, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/reclamations/${idReclamation}/repondre`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(
        `Vous avez ${action === "acceptee" ? "accepté" : "refusé"} cette demande.`,
      );
      refreshReclamationsData();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors du traitement de votre réponse.");
    }
  };

  // --- Soumission du Formulaire ---
  const submitReclamation = async (e) => {
    e.preventDefault();

    if (!stagiaireId) {
      alert("Erreur : Votre session a expiré. Veuillez vous reconnecter.");
      return;
    }

    if (!objet || !description) {
      alert(
        "Veuillez remplir tous les champs obligatoires (Objet et Description).",
      );
      return;
    }

    if (type === "echange_etablissement") {
      if (!etablissementDepart) {
        alert("Veuillez sélectionner votre établissement actuel.");
        return;
      }
      if (!stagiaireCible) {
        alert(
          "Veuillez sélectionner le stagiaire binôme pour procéder à l'échange.",
        );
        return;
      }
      if (!etablissementCible) {
        alert("Veuillez sélectionner l'établissement actuel de votre binôme.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        Id_Stagiaire: stagiaireId,
        type,
        objet,
        description,
        id_etablissement_depart:
          type === "echange_etablissement" ? etablissementDepart : null,
        id_etablissement_cible:
          type === "echange_etablissement" ? etablissementCible : null,
        stagiaire_cible_id:
          type === "echange_etablissement" ? stagiaireCible : null,
      };

      await axios.post(`${API_URL}/api/reclamations`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setObjet("");
      setDescription("");
      setStagiaireCible("");
      setEtablissementDepart("");
      setEtablissementCible("");

      refreshReclamationsData();
      alert("Votre demande a été transmise avec succès.");
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi de la réclamation.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers de Style UI ---
  const getStatusColor = (status) => {
    switch (status) {
      case "acceptee":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900";
      case "refusee":
        return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900";
      case "attente_confirmation":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900";
      case "accord_binome":
        return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900";
      default:
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "acceptee":
        return "Validée définitivement (Admin)"; // Statut final unique
      case "refusee":
        return "Refusée";
      case "attente_confirmation":
        return "En attente du binôme";
      case "accord_binome":
        return "Validé par le binôme ➔ En attente de l'Admin"; // Changé ici pour éviter la confusion
      default:
        return "En attente d'étude";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in text-slate-900 dark:text-slate-100">
      {/* ================= PANNEAU DE FORMULATION ================= */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">
          Déposer une Réclamation
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Formulez une demande officielle de réajustement d'affectation ou une
          permutation de poste de stage.
        </p>

        <form className="space-y-5" onSubmit={submitReclamation}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Type de réclamation
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setEtablissementDepart("");
                setEtablissementCible("");
                setStagiaireCible("");
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            >
              <option value="changement_etablissement">
                Changement d'établissement (Simple)
              </option>
              <option value="echange_etablissement">
                Échange réciproque (Permutation avec binôme)
              </option>
            </select>
          </div>

          {type === "changement_etablissement" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs border border-blue-200 dark:border-blue-900/60 leading-relaxed">
              ℹ️ <strong>Note administrative :</strong> Pour une demande de
              changement simple, vous n'avez pas à choisir l'établissement
              d'accueil. Votre dossier sera instruit directement par votre Administration
            </div>
          )}

          {type === "echange_etablissement" && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Configuration des structures de l'échange
              </h3>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Votre établissement actuel{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={etablissementDepart}
                  onChange={(e) => setEtablissementDepart(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none transition text-sm text-slate-900 dark:text-white"
                >
                  <option value="">
                    -- Sélectionnez votre structure actuelle --
                  </option>
                  {etablissements.map((e) => (
                    <option key={e.Id_Etablissement} value={e.Id_Etablissement}>
                      {e.NomEtab}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Stagiaire ciblé pour l'échange{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={stagiaireCible}
                  onChange={(e) => setStagiaireCible(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none transition text-sm text-slate-900 dark:text-white"
                >
                  <option value="">-- Choisir le profil du binôme --</option>
                  {stagiaires.map((s) => (
                    <option key={s.Id_Stagiaire} value={s.Id_Stagiaire}>
                      {s.PrenomStag || s.Prenom} {s.NomStag || s.Nom} (
                      {s.NomEtab || "Affecté(e)"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Établissement actuel de votre binôme{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={etablissementCible}
                  onChange={(e) => setEtablissementCible(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none transition text-sm text-slate-900 dark:text-white"
                >
                  <option value="">
                    -- Confirmer l'établissement d'arrivée (Binôme) --
                  </option>
                  {etablissements.map((e) => (
                    <option key={e.Id_Etablissement} value={e.Id_Etablissement}>
                      {e.NomEtab}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Objet de la demande
            </label>
            <input
              type="text"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder="Ex: Demande de rapprochement familial ou permutation réciproque"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Motifs & Justifications détaillés
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explicitez ici de façon claire les raisons impératives qui motivent votre demande..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Traitement de l'envoi..." : "Soumettre la réclamation"}
          </button>
        </form>
      </div>

      {/* ================= BARRETTE LATÉRALE DROITE ================= */}
      <div className="space-y-6">
        {/* SECTION A : PERMUTATIONS REÇUES */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            Invitations à permuter reçues
          </h3>

          <div className="space-y-4">
            {reclamationsRecues.length > 0 ? (
              reclamationsRecues.map((rec) => (
                <div
                  key={rec.Id_Reclamation}
                  className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      De : {rec.PrenomStag || rec.Prenom}{" "}
                      {rec.NomStag || rec.Nom}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(rec.statut)}`}
                    >
                      {getStatusLabel(rec.statut)}
                    </span>
                  </div>

                  {/* Bloc Structures Géographiques Textuelles */}
                  <div className="my-2 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-md border border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed">
                    <div className="text-slate-500 dark:text-slate-400">
                      🏢{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Établissement du binôme :
                      </span>
                      <div className="font-semibold text-rose-600 dark:text-rose-400 pl-4">
                        {rec.NomEtabCible || "Non spécifié"}
                      </div>
                    </div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>➔ Souhaite venir vers :</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {rec.NomEtabDepart || "Votre établissement"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    {rec.objet}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
                    {rec.description}
                  </p>

                  {/* Actions de réponse dynamique */}
                  {rec.statut === "attente_confirmation" ? (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-2.5 mt-2">
                      <button
                        onClick={() =>
                          handleReponseDemande(rec.Id_Reclamation, "refusee")
                        }
                        className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900 transition-colors"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() =>
                          handleReponseDemande(rec.Id_Reclamation, "acceptee")
                        }
                        className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded transition-colors"
                      >
                        Accepter l'échange
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 text-right border-t border-slate-100 dark:border-slate-800/60 pt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 italic">
                      Dossier transmis au comité d'administration.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-950/20">
                Aucune invitation de binôme en attente.
              </div>
            )}
          </div>
        </div>

        {/* SECTION B : HISTORIQUE PERSONNEL (ÉMISES) */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
            Mes Réclamations Soumises
          </h3>

          <div className="space-y-4">
            {reclamations.length > 0 ? (
              reclamations.map((rec) => (
                <div
                  key={rec.Id_Reclamation}
                  className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {rec.objet}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusColor(rec.statut)}`}
                    >
                      {getStatusLabel(rec.statut)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>
                      {rec.type === "echange_etablissement"
                        ? "Type: Permutation"
                        : "Type: Réaffectation simple"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-950/20">
                Aucun dossier déposé à ce jour.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
