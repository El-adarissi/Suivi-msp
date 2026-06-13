import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  File,
  Download,
  Eye,
  Save,
  X,
  User,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white shadow-xl flex items-center gap-2 animate-fade-in
      ${type === "success" ? "bg-emerald-600 dark:bg-emerald-500" : "bg-red-600 dark:bg-red-500"}`}
    >
      {type === "success" ? (
        <CheckCircle size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 text-slate-800 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}

function getFileTypeConfig(type) {
  switch (type) {
    case "pdf":
      return {
        label: "PDF",
        colorClass:
          "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 dark:border-red-900/50",
        icon: <FileText className="text-red-500 dark:text-red-400" size={32} />,
      };
    case "doc":
    case "docx":
      return {
        label: "WORD",
        colorClass:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50",
        icon: (
          <FileText className="text-blue-500 dark:text-blue-400" size={32} />
        ),
      };
    default:
      return {
        label: "TEXTE",
        colorClass:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50",
        icon: (
          <File className="text-emerald-500 dark:text-emerald-400" size={32} />
        ),
      };
  }
}

export function RapportsstagSup() {
  const [rapports, setRapports] = useState([]);
  const [toast, setToast] = useState(null);
  const [apercuRapport, setApercuRapport] = useState(null);

  // Track open comment panels
  const [openComments, setOpenComments] = useState({});

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("all");

  const notify = (message, type = "success") => setToast({ message, type });

  const fetchRapports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/superviseur/rapports`, {
        headers: authHeaders(),
      });
      setRapports(res.data.data || []);
    } catch (err) {
      console.error(err);
      notify("Erreur chargement rapports", "error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRapports();
  }, []);

  const saveComment = async (rapportId, commentaire) => {
    try {
      await axios.put(
        `${API_URL}/api/superviseur/rapports/${rapportId}/commentaire`,
        { commentaire },
        { headers: authHeaders() },
      );
      notify("Commentaire enregistré et notification envoyée");

      // 1. Mettre à jour l'état local pour refléter le nouveau commentaire
      setRapports((prev) =>
        prev.map((r) =>
          r.Id_Rapport === rapportId ? { ...r, commentaire } : r,
        ),
      );

      // 2. VIDER LE CHAMP : On cible l'élément textarea et on vide sa valeur
      const textarea = document.getElementById(`comment-${rapportId}`);
      if (textarea) {
        textarea.value = "";
      }

      // 3. Fermer le panneau de commentaire
      toggleCommentPanel(rapportId);
    } catch (err) {
      console.error(err);
      notify("Erreur lors de l'enregistrement", "error");
    }
  };

  const toggleCommentPanel = (id) => {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper helper to parse extensions cleanly
  const getCleanType = (rapport) => {
    let computedType = "text";
    if (rapport.type) {
      computedType = rapport.type.toLowerCase().trim();
    } else if (rapport.file_url) {
      const cleanUrl = rapport.file_url.split("?")[0];
      computedType = cleanUrl.split(".").pop().toLowerCase().trim();
    }
    return computedType;
  };

  // --- Filtering Logic ---
  const filteredRapports = rapports.filter((rapport) => {
    // 1. Name Filter
    const fullName =
      `${rapport.PrenomStag || ""} ${rapport.NomStag || ""}`.toLowerCase();
    const matchesName = fullName.includes(searchName.toLowerCase());

    // 2. Type Filter
    const computedType = getCleanType(rapport);
    // eslint-disable-next-line no-useless-assignment
    let matchesType = false;
    if (filterType === "all") {
      matchesType = true;
    } else if (filterType === "doc") {
      matchesType = computedType === "doc" || computedType === "docx";
    } else {
      matchesType = computedType === filterType;
    }

    // 3. Date Filter
    let matchesDate = true;
    if (filterDate) {
      const reportDate = new Date(rapport.created_at)
        .toISOString()
        .split("T")[0];
      matchesDate = reportDate === filterDate;
    }

    return matchesName && matchesType && matchesDate;
  });

  // --- Grouping Logic (No duplicate declaration anymore) ---
  const groupedRapports = filteredRapports.reduce((acc, rapport) => {
    const id = rapport.Id_Stagiaire;
    if (!acc[id]) {
      acc[id] = {
        stagiaire: {
          id,
          nom: `${rapport.PrenomStag} ${rapport.NomStag}`,
          email: rapport.Email,
        },
        rapports: [],
      };
    }

    acc[id].rapports.push({
      ...rapport,
      type: getCleanType(rapport),
    });
    return acc;
  }, {});

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 p-4 min-h-screen bg-slate-50/30 dark:bg-slate-950/20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Rapports des stagiaires
        </h2>
      </div>

      {/* Utility Search Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Date Input */}
        <div className="relative">
          <Calendar
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="absolute right-3 top-3 text-xs text-red-500 font-medium"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Extension Format Selection Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="all">Tous les formats</option>
            <option value="pdf">Fichiers PDF</option>
            <option value="doc">Fichiers Word (doc/docx)</option>
            <option value="text">Fichiers Texte</option>
          </select>
        </div>
      </div>

      {/* Dynamic Main Body Content */}
      {Object.values(groupedRapports).length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          Aucun rapport ne correspond à vos critères.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.values(groupedRapports).map((group) => (
            <div
              key={group.stagiaire.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-snug text-slate-900 dark:text-slate-100">
                      {group.stagiaire.nom}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {group.stagiaire.email}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {group.rapports.length} rapport(s) disponible(s)
                </span>
              </div>

              {/* Grid of Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {group.rapports.map((rapport) => {
                  const fileConfig = getFileTypeConfig(rapport.type);
                  const isCommentOpen = !!openComments[rapport.Id_Rapport];

                  return (
                    <div
                      key={rapport.Id_Rapport}
                      className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                          {fileConfig.icon}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${fileConfig.colorClass}`}
                        >
                          {fileConfig.label}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                        {rapport.title}
                      </h4>

                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                        Déposé le :{" "}
                        {new Date(rapport.created_at).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>

                      {/* Primary Utility Control Buttons */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setApercuRapport(rapport)}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Eye size={16} />
                          Consulter
                        </button>

                        {rapport.file_url && (
                          <a
                            href={`${API_URL}${rapport.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-3 text-center rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Download size={16} />
                            Télécharger
                          </a>
                        )}
                      </div>

                      {/* Interactive Comments Collapse Button */}
                      <button
                        onClick={() => toggleCommentPanel(rapport.Id_Rapport)}
                        className={`w-full py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between
                          ${
                            rapport.commentaire
                              ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          {rapport.commentaire
                            ? "Modifier le commentaire"
                            : "Ajouter un commentaire"}
                        </span>
                        {isCommentOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>

                      {/* Dropdown Feedback Drawer Card */}
                      {isCommentOpen && (
                        <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-inner">
                          <textarea
                            rows={3}
                            defaultValue={rapport.commentaire || ""}
                            id={`comment-${rapport.Id_Rapport}`}
                            placeholder="Écrivez vos remarques ici..."
                            className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                toggleCommentPanel(rapport.Id_Rapport)
                              }
                              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                              onClick={() =>
                                saveComment(
                                  rapport.Id_Rapport,
                                  document.getElementById(
                                    `comment-${rapport.Id_Rapport}`,
                                  ).value,
                                )
                              }
                            >
                              <Save size={14} />
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal Popup */}
      {apercuRapport && (
        <Modal
          title={apercuRapport.title}
          onClose={() => setApercuRapport(null)}
        >
          {apercuRapport.type === "text" ? (
            <div className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100">
              {apercuRapport.content}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4">
                {getFileTypeConfig(apercuRapport.type).icon}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Ce document ne peut pas être visualisé en ligne.
              </p>
              <a
                href={`${API_URL}${apercuRapport.file_url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-lg"
              >
                <Download size={18} />
                Télécharger le fichier ({apercuRapport.type.toUpperCase()})
              </a>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
