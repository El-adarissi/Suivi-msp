/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ─── Toast ─────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white shadow-lg
      ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
      {message}
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-lg">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── PAGE RAPPORTS ─────────────────────────────────────
export function RapportsStagiaire() {
  const [rapports, setRapports] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const notify = (message, type = "success") =>
    setToast({ message, type });

  // ─── GET RAPPORTS ────────────────────────────────────
  const fetchRapports = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/rapports/my`,
        { headers: authHeaders() }
      );
      setRapports(res.data.data || []);
      console.log(res.data.data);
    } catch (err) {
      notify("Erreur chargement rapports", "error");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRapports();
  }, []);

  // ─── CREATE RAPPORT ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/rapports`,
        { content },
        { headers: authHeaders() }
      );

      setContent("");
      setShowModal(false);
      fetchRapports();
      notify("Rapport envoyé avec succès");
    } catch (err) {
      notify("Erreur envoi rapport", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── DELETE ───────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/rapports/${id}`, {
        headers: authHeaders()
      });

      fetchRapports();
      notify("Rapport supprimé");
    } catch (err) {
      notify("Erreur suppression", "error");
    }
  };

  return (
    <div className="space-y-6">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes rapports</h2>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
        >
          + Nouveau rapport
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {rapports.map((r) => (
          <div
            key={r.Id_Rapport}
            className="p-4 rounded-lg border bg-white dark:bg-slate-900"
          >
            <p className="text-sm text-slate-600">{r.content}</p>

            <div className="flex justify-between mt-3 text-xs text-slate-400">
              <span>
                {new Date(r.created_at).toLocaleString()}
              </span>

              <button
                onClick={() => handleDelete(r.Id_Rapport)}
                className="text-rose-500 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREATE */}
      {showModal && (
        <Modal title="Nouveau rapport" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-lg min-h-[150px]"
              placeholder="Écrire votre rapport..."
              required
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Annuler
              </button>

              <button
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}