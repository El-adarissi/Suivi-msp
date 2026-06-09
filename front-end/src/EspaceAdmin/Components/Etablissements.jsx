import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all
      ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {type === "success" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition";

const VILLES_MAROC = [
  "Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda",
  "Kénitra","Tétouan","Safi","El Jadida","Béni Mellal","Nador","Settat",
  "Khouribga","Mohammedia","Laâyoune","Dakhla","Ouarzazate",
];

// ─── EtabForm ─────────────────────────────────────────────────────────────────
function EtabForm({ form, setForm, onSubmit, onClose, loading, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom de l'établissement">
          <input type="text" value={form.NomEtab}
            onChange={(e) => setForm({ ...form, NomEtab: e.target.value })}
            required className={inputCls} placeholder="Ex: Lyceé Charaf" />
        </Field>
        <Field label="Ville">
          <select value={form.Ville}
            onChange={(e) => setForm({ ...form, Ville: e.target.value })}
            required className={inputCls}>
            <option value="">Sélectionner une ville</option>
            {VILLES_MAROC.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Adresse / Localisation">
        <input type="text" value={form.Location}
          onChange={(e) => setForm({ ...form, Location: e.target.value })}
          className={inputCls} placeholder="Ex: Avenue Hassan II, Quartier Agdal" />
      </Field>
      <Field label="Email">
        <input type="email" value={form.Email}
          onChange={(e) => setForm({ ...form, Email: e.target.value })}
          required className={inputCls} placeholder="contact@etablissement.ma" />
      </Field>
      <Field label={submitLabel === "Créer" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"}>
        <input type="password" value={form.Password}
          onChange={(e) => setForm({ ...form, Password: e.target.value })}
          required={submitLabel === "Créer"}
          placeholder={submitLabel !== "Créer" ? "Laisser vide pour ne pas modifier" : ""}
          className={inputCls} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition flex items-center gap-2">
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {loading ? "Chargement..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Etablissements() {
  

  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast]             = useState(null); // { message, type }

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  const emptyForm = { NomEtab: "", Ville: "", Location: "", Email: "", Password: "" };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm]     = useState(emptyForm);

  const notify = (message, type = "success") => setToast({ message, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/getalletablissements`, { headers: authHeaders() });
      setData(res.data.data || []);
      console.log("Etablissements chargés :", res.data.data);
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post(`${API_URL}/api/addetablisement`, createForm, { headers: authHeaders() });
      setShowCreate(false);
      setCreateForm(emptyForm);
      fetchData();
      notify("Établissement créé. Un email d'activation a été envoyé.");
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors de la création.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (etab) => {
    
    setEditForm({ NomEtab: etab.NomEtab, Ville: etab.Ville || "", Location: etab.Location || "", Email: etab.Email, Password: "" });
    setShowEdit(etab);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { NomEtab: editForm.NomEtab, Ville: editForm.Ville, Location: editForm.Location, Email: editForm.Email };
      if (editForm.Password) payload.Password = editForm.Password;
      await axios.put(`${API_URL}/etablissements/${showEdit.Id_Etablissement}`, payload, { headers: authHeaders() });
      setShowEdit(null);
      fetchData();
      notify("Établissement mis à jour.");
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors de la mise à jour.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await axios.delete(`${API_URL}/api/deleteetablissement/${showDelete.Id_Etablissement}`, { headers: authHeaders() });
      setShowDelete(null);
      fetchData();
      notify("Établissement supprimé.");
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors de la suppression.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Établissements</h2>
          </div>
        </div>
        <button onClick={() => { setCreateForm(emptyForm); setShowCreate(true); }}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvel établissement
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Chargement...</div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">Aucun établissement. Commencez par en ajouter un.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Nom</th>
                  <th className="px-6 py-3.5 font-medium">Ville</th>
                  <th className="px-6 py-3.5 font-medium">Localisation</th>
                  <th className="px-6 py-3.5 font-medium">Email</th>
                  <th className="px-6 py-3.5 font-medium">Statut</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {data.map((item) => (
                  <tr key={item.Id_Etablissement} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.NomEtab}</td>
                    <td className="px-6 py-4">{item.Ville || "—"}</td>
                    <td className="px-6 py-4 max-w-45 truncate text-slate-500 dark:text-slate-400" title={item.Location}>
                      {item.Location || "—"}
                    </td>
                    <td className="px-6 py-4">{item.Email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {item.is_active ? "Actif" : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(item)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                        Modifier
                      </button>
                      <button onClick={() => setShowDelete(item)}
                        className="text-rose-600 dark:text-rose-400 hover:underline font-medium">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal — Créer */}
      {showCreate && (
        <Modal title="Nouvel établissement" onClose={() => setShowCreate(false)}>
          <EtabForm form={createForm} setForm={setCreateForm}
            onSubmit={handleCreate} onClose={() => setShowCreate(false)}
            loading={formLoading} submitLabel="Créer" />
        </Modal>
      )}

      {/* Modal — Modifier */}
      {showEdit && (
        <Modal title="Modifier l'établissement" onClose={() => setShowEdit(null)}>
          <EtabForm form={editForm} setForm={setEditForm}
            onSubmit={handleEdit} onClose={() => setShowEdit(null)}
            loading={formLoading} submitLabel="Enregistrer" />
        </Modal>
      )}

      {/* Modal — Supprimer */}
      {showDelete && (
        <Modal title="Confirmer la suppression" onClose={() => setShowDelete(null)}>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{showDelete.NomEtab}</span> ?
            Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDelete(null)}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Annuler
            </button>
            <button onClick={handleDelete} disabled={formLoading}
              className="px-4 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium transition">
              {formLoading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
