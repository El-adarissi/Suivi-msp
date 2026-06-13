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
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all animate-fade-in
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

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";

const VILLES_MAROC = [
  "Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda",
  "Kénitra","Tétouan","Safi","El Jadida","Béni Mellal","Nador","Settat",
  "Khouribga","Mohammedia","Laâyoune","Dakhla","Ouarzazate",
];

export function EtablissementsEtab() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    NomEtab: "",
    Ville: "",
    Location: "",
    Email: "",
    Password: "",
    role: "Etablissement",
    is_active: 0
  });

  const notify = (message, type = "success") => setToast({ message, type });

  // ── Fetch Profile Info ──────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/etablissement/profile`, { headers: authHeaders() });
      const data = res.data.data || res.data;
      
      setForm({
        NomEtab: data.NomEtab || "",
        Ville: data.Ville || "",
        Location: data.Location || "",
        Email: data.Email || "",
        Password: "", // Keep password field blank initially
        role: data.role || "Etablissement",
        is_active: data.is_active ?? 0
      });
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.message || "Erreur lors du chargement des données.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  // ── Handle Save Updates ─────────────────────────────────────────────────────
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        NomEtab: form.NomEtab,
        Ville: form.Ville,
        Location: form.Location,
        Email: form.Email
      };
      
      // Send the password field only if a change is intended
      if (form.Password && form.Password.trim() !== "") {
        payload.Password = form.Password;
      }

      await axios.put(`${API_URL}/api/etablissement/profile/update`, payload, { headers: authHeaders() });
      notify("Informations de l'établissement mises à jour !");
      
      // Clear password field out for security post-update
      setForm(prev => ({ ...prev, Password: "" }));
    } catch (err) {
      notify(err.response?.data?.message || "Erreur lors de la modification.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-sm font-medium">Chargement des données de l'établissement...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in text-slate-900 dark:text-slate-100 p-1">
      {/* Toast Alert Messages */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main Profile Editor Form Card */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Profil de l'Établissement</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Gérez et mettez à jour les informations d'identification de votre structure.</p>
        
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom de l'établissement">
              <input 
                type="text" 
                value={form.NomEtab}
                onChange={(e) => setForm({ ...form, NomEtab: e.target.value })}
                required 
                className={inputCls} 
                placeholder="Ex: Lycée Technique" 
              />
            </Field>

            <Field label="Ville">
              <select 
                value={form.Ville}
                onChange={(e) => setForm({ ...form, Ville: e.target.value })}
                required 
                className={inputCls}
              >
                <option value="">Sélectionner une ville</option>
                {VILLES_MAROC.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Adresse / Localisation">
            <input 
              type="text" 
              value={form.Location}
              onChange={(e) => setForm({ ...form, Location: e.target.value })}
              className={inputCls} 
              placeholder="Ex: Avenue Hassan II, Quartier Principal" 
            />
          </Field>

          <Field label="Email Professionnel de Contact">
            <input 
              type="email" 
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
              required 
              className={inputCls} 
              placeholder="contact@etablissement.ma" 
            />
          </Field>

          <Field label="Nouveau mot de passe (optionnel)">
            <input 
              type="password" 
              value={form.Password}
              onChange={(e) => setForm({ ...form, Password: e.target.value })}
              placeholder="Laisser vide pour conserver le mot de passe actuel"
              className={inputCls} 
            />
          </Field>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar Status View */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-25 h-25 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21m16.5 0H3" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
            {form.NomEtab || "Établissement"}
          </h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            {form.Ville || "Maroc"}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Rôle Système</p>
            <p className="font-medium text-slate-700 dark:text-slate-300 capitalize">{form.role}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Statut d'accès</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${form.is_active ? "bg-emerald-500" : "bg-amber-500"}`} />
              <p className={`font-semibold text-sm ${form.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {form.is_active ? "Compte Actif" : "En attente d'homologation"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}