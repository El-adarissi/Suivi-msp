import { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, GraduationCap, Save, ShieldCheck, Loader2, CheckCircle, AlertCircle, BadgeCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
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
      {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function ProfileStag() {
  const [formData, setFormData] = useState({
    NomStag: "",
    PrenomStag: "",
    Filiere: "",
    Email: "",
    role: "",
    is_active: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  // Fetch student profile fields
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/stagiaire/profile`, {
          headers: authHeaders()
        });
        
        const data = res.data.data || res.data;
        setFormData({
          NomStag: data.NomStag || "",
          PrenomStag: data.PrenomStag || "",
          Filiere: data.Filiere || "",
          Email: data.Email || "",
          role: data.role || "Stagiaire",
          is_active: data.is_active ?? 1
        });
      } catch (err) {
        console.error("Error loading trainee profile details:", err);
        notify("Impossible de charger les données du profil", "error");
      // eslint-disable-next-line no-unused-labels
      } compression: {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/stagiaire/profile/update`, {
        NomStag: formData.NomStag,
        PrenomStag: formData.PrenomStag,
        Filiere: formData.Filiere,
        Email: formData.Email
      }, {
        headers: authHeaders()
      });
      notify("Informations de profil mises à jour !");
    } catch (err) {
      console.error("Error updating trainee profile:", err);
      notify("Erreur lors de la mise à jour des informations", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-sm font-medium">Chargement de votre espace profil...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in text-slate-900 dark:text-slate-100 p-1">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Main Profile Modification Area */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Mon Profil Stagiaire</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Consultez et tenez à jour vos informations personnelles d'apprentissage.</p>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Prénom</label>
              <input 
                type="text" 
                name="PrenomStag"
                value={formData.PrenomStag}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Nom</label>
              <input 
                type="text" 
                name="NomStag"
                value={formData.NomStag}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="email" 
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Filière / Spécialité</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  name="Filiere"
                  value={formData.Filiere}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>

      {/* Trainee Card Sidebar Summary */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 border border-blue-500/20">
            <User size={40} />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            {formData.PrenomStag} {formData.NomStag || "Étudiant"}
          </h3>
          <span className="mt-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md">
            {formData.role || "Stagiaire"}
          </span>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <GraduationCap size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Parcours académique</p>
              <p className="font-medium text-sm leading-tight mt-0.5">{formData.Filiere || "Non renseignée"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <ShieldCheck size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Rôle Compte</p>
              <p className="font-medium text-sm capitalize">{formData.role || "Stagiaire"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <BadgeCheck size={16} className={formData.is_active ? "text-emerald-500" : "text-red-500"} />
            <div>
              <p className="text-xs text-slate-400">Statut Réseau</p>
              <p className={`font-semibold text-sm ${formData.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {formData.is_active ? "Compte Actif" : "Compte Restreint"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}