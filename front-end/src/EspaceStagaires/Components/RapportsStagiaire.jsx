import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Toast ─────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white shadow-xl text-sm font-medium
        ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
    >
      {message}
    </div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-pop">
        <div className="flex justify-between items-center px-6 pt-5 pb-3">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700
              text-slate-400 hover:text-rose-500 hover:border-rose-400 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}



// ─── File type helpers ─────────────────────────────────
function fileIcon(type) {
  if (type === "pdf") return "📕";
  if (type === "docx" || type === "doc") return "📘";
  return "📝";
}
function fileBadge(type) {
  if (type === "pdf")
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  if (type === "docx" || type === "doc")
    return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
}
function fileBadgeLabel(type) {
  if (type === "pdf") return "PDF";
  if (type === "docx" || type === "doc") return "Word";
  return "Texte";
}

// ─── Upload Drop Zone ───────────────────────────────────
function DropZone({ file, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const setFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      alert("Format non accepté. Utilisez PDF, DOC ou DOCX.");
      return;
    }
    onChange(f);
  };

  return (
    <div>
      {!file ? (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${drag
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
              : "border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/50"
            }`}
        >
          <div className="text-3xl mb-2">📂</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 font-semibold">Cliquer pour choisir</span> ou glisser-déposer
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX — max 10 Mo</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
          <span className="text-2xl">{fileIcon(file.name.split(".").pop().toLowerCase())}</span>
          <span className="text-sm font-semibold flex-1 truncate text-slate-800 dark:text-slate-200">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-rose-500 hover:text-rose-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── Rapport Card ───────────────────────────────────────
function RapportCard({ rapport, onView, onEdit, onDelete }) {
  const date = new Date(rapport.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
      rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500
      transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      onClick={onView}
    >
      {/* Icon */}
      <div className="text-3xl mb-2">{fileIcon(rapport.type)}</div>

      {/* Badge */}
      <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md w-fit mb-2 ${fileBadge(rapport.type)}`}>
        {fileBadgeLabel(rapport.type)}
      </span>

      {/* Title */}
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-1">
        {rapport.title}
      </p>
      <p className="text-xs text-slate-400 mb-4">Ajouté le {date}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg
            border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
            text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
            dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all"
        >
          👁 Aperçu
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1 px-3 text-xs font-semibold py-1.5 rounded-lg
            border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
            text-slate-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50
            dark:hover:border-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-950/30 transition-all"
          title="Modifier"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1 px-3 text-xs font-semibold py-1.5 rounded-lg
            border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
            text-slate-500 dark:text-slate-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50
            dark:hover:border-rose-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all"
          title="Supprimer"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

// ─── Tab switcher ───────────────────────────────────────
function Tabs({ active, onChange }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 mb-5">
      {[
        { id: "text", label: "📝 Texte" },
        { id: "file", label: "📎 Fichier (PDF / Word)" },
      ].map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
            ${active === t.id
              ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────
export function RapportsStagiaire() {
  const [rapports, setRapports] = useState([]);
  const [toast, setToast] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Aperçu state
  const [apercuRapport, setApercuRapport] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  // ─── FETCH ─────────────────────────────────────────
  const fetchRapports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rapports/my`, { headers: authHeaders() });
      setRapports(res.data.data || []);
    } catch {
      notify("Erreur chargement des rapports", "error");
    }
  };
  useEffect(() => { fetchRapports(); }, []); // eslint-disable-line

  // ─── OPEN FORM ─────────────────────────────────────
  const openCreate = () => {
    setEditingId(null); setTitle(""); setContent(""); setSelectedFile(null); setTab("text");
    setShowForm(true);
  };
  const openEdit = (r) => {
    setEditingId(r.Id_Rapport);
    setTitle(r.title || "");
    setContent(r.content || "");
    setSelectedFile(null);
    setTab(r.type === "text" ? "text" : "file");
    setShowForm(true);
  };

  // ─── SAVE ──────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { notify("Le titre est requis.", "error"); return; }
    setLoading(true);
    try {
      if (tab === "text") {
        if (!content.trim()) { notify("Le contenu est requis.", "error"); setLoading(false); return; }
        const payload = { title, content, type: "text" };
        if (editingId) {
          await axios.put(`${API_URL}/api/rapports/${editingId}`, payload, { headers: authHeaders() });
          notify("Rapport modifié");
        } else {
          await axios.post(`${API_URL}/api/rapports`, payload, { headers: authHeaders() });
          notify("Rapport envoyé");
        }
      } else {
        // File upload — FormData
        if (!editingId && !selectedFile) { notify("Veuillez sélectionner un fichier.", "error"); setLoading(false); return; }
        const fd = new FormData();
        fd.append("title", title);
        if (selectedFile) fd.append("file", selectedFile);
        const hdrs = { ...authHeaders(), "Content-Type": "multipart/form-data" };
        if (editingId) {
          await axios.put(`${API_URL}/api/rapports/${editingId}`, fd, { headers: hdrs });
          notify("Rapport modifié");
        } else {
          await axios.post(`${API_URL}/api/rapports`, fd, { headers: hdrs });
          notify("Rapport envoyé");
        }
      }
      setShowForm(false);
      fetchRapports();
    } catch {
      notify("Erreur lors de l'enregistrement", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── DELETE ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    try {
      await axios.delete(`${API_URL}/api/rapports/${id}`, { headers: authHeaders() });
      fetchRapports();
      notify("Rapport supprimé");
    } catch {
      notify("Erreur suppression", "error");
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📋 Mes rapports</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm
            font-semibold rounded-xl transition-all shadow-sm"
        >
          + Nouveau rapport
        </button>
      </div>

      {/* GRID / EMPTY */}
      {rapports.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm">Aucun rapport pour l'instant.<br />Commencez par en créer un.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rapports.map((r) => (
            <RapportCard
              key={r.Id_Rapport}
              rapport={{ ...r, type: r.type || (r.file_url ? r.file_url.split(".").pop() : "text") }}
              onView={() => setApercuRapport(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => handleDelete(r.Id_Rapport)}
            />
          ))}
        </div>
      )}

      {/* ── MODAL CREATE / EDIT ── */}
      {showForm && (
        <Modal
          title={editingId ? "Modifier le rapport" : "Nouveau rapport"}
          onClose={() => setShowForm(false)}
        >
          <Tabs active={tab} onChange={(t) => { setTab(t); setSelectedFile(null); }} />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Titre du rapport <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Rapport hebdomadaire – Semaine 22"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700
                  rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100
                  placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {tab === "text" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Contenu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Rédigez votre rapport ici…"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700
                    rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100
                    placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Fichier {!editingId && <span className="text-rose-500">*</span>}
                </label>
                <DropZone file={selectedFile} onChange={setSelectedFile} />
                {editingId && !selectedFile && (
                  <p className="text-xs text-slate-400 mt-1.5">Laissez vide pour garder le fichier actuel.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700
                rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700
                disabled:opacity-60 text-white rounded-xl transition active:scale-95"
            >
              {loading ? "Envoi…" : "💾 Enregistrer"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL APERÇU ── */}
      {apercuRapport && (
        <Modal
          title={apercuRapport.title}
          onClose={() => setApercuRapport(null)}
        >
          {apercuRapport.type === "text" || !apercuRapport.type ? (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300
              leading-relaxed whitespace-pre-wrap min-h-25 max-h-80 overflow-y-auto">
              {apercuRapport.content}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">{fileIcon(apercuRapport.type)}</div>
              <p className="text-sm text-slate-400 mb-5">
                {fileBadgeLabel(apercuRapport.type)} · {apercuRapport.file_name || apercuRapport.fileName || "fichier"}
              </p>
              {apercuRapport.file_url && (
                <a
                  href={`${API_URL}${apercuRapport.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700
                    text-white text-sm font-semibold rounded-xl transition"
                >
                  ⬇ Télécharger
                </a>
              )}
            </div>
          )}
          <div className="flex justify-end mt-5">
            <button
              onClick={() => setApercuRapport(null)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700
                rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}