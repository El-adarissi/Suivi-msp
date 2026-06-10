/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Pencil, Trash2, X, Plus, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  NomStag: "",
  PrenomStag: "",
  Filiere: "",
  Email: "",
  Password: "",
  Id_Etablissement: "",
  Id_Superviseur: "",
};
const API_URL = import.meta.env.VITE_API_URL;

const FILIERES = [
  "Mathématiques",
  "Physique-Chimie",
  "SVT",
  "Français",
  "Anglais",
  "Histoire-Géographie",
  "Informatique",
  "Éducation Physique",
];

function ModalForm({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  etablissements,
  superviseurs,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: "NomStag", label: "Nom", placeholder: "Bennani" },
              { field: "PrenomStag", label: "Prénom", placeholder: "Amine" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {label}
                </label>
                <input
                  required
                  value={form[field]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>

          {/* Email / Filière / Password */}
          {/* Email / Password */}
          {[
            {
              field: "Email",
              label: "Email",
              type: "email",
              placeholder: "amine@email.com",
            },
            {
              field: "Password",
              label: "Mot de passe",
              type: "password",
              placeholder: "••••••••",
            },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {label}
              </label>
              <input
                required={field !== "Password" || !form.Id_Stagiaire}
                type={type}
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}

          {/* Filière */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Filière
            </label>
            <select
              required
              value={form.Filiere}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, Filiere: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Choisir une filière —</option>
              {FILIERES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Établissement */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Établissement d'affectation
            </label>
            <select
              required
              value={form.Id_Etablissement}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  Id_Etablissement: e.target.value,
                }))
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Aucun établissement —</option>
              {etablissements.map((e) => (
                <option key={e.Id_Etablissement} value={e.Id_Etablissement}>
                  {e.NomEtab}
                </option>
              ))}
            </select>
          </div>

          {/* Superviseur */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Superviseur assigné
            </label>
            <select
              value={form.Id_Superviseur}
              required
              onChange={(e) =>
                setForm((prev) => ({ ...prev, Id_Superviseur: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Aucun superviseur —</option>
              {superviseurs.map((s) => (
                <option key={s.Id_Superviseur} value={s.Id_Superviseur}>
                  {s.NomSup} {s.PrenomSup}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Stagiaires() {
  const [data, setData] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchStagiaires = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/getallstagiaires`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEtablissements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/getalletablissements`);
      const json = await res.json();
      if (json.success) setEtablissements(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuperviseurs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/getallsuperviseurs`);
      const json = await res.json();
      if (json.success) setSuperviseurs(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStagiaires();
    fetchEtablissements();
    fetchSuperviseurs();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal("add");
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
      NomStag: item.NomStag,
      PrenomStag: item.PrenomStag,
      Filiere: item.Filiere,
      Email: item.Email,
      Password: "",
      Id_Etablissement: item.Id_Etablissement ?? "",
      Id_Superviseur: item.Id_Superviseur ?? "",
    });
    setModal("edit");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/addstagiaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      console.log(json);
      if (json.success) {
        fetchStagiaires();
        setModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/stagiaire/${selected.Id_Stagiaire}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = await res.json();
      if (json.success) {
        fetchStagiaires();
        setModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/stagiaire/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchStagiaires();
        setDeleteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {modal === "add" && (
        <ModalForm
          title="Inscrire un stagiaire"
          form={form}
          setForm={setForm}
          onSubmit={handleAdd}
          onClose={() => setModal(null)}
          saving={saving}
          etablissements={etablissements}
          superviseurs={superviseurs}
        />
      )}
      {modal === "edit" && (
        <ModalForm
          title="Modifier le stagiaire"
          form={form}
          setForm={setForm}
          onSubmit={handleEdit}
          onClose={() => setModal(null)}
          saving={saving}
          etablissements={etablissements}
          superviseurs={superviseurs}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            Répertoire des Stagiaires
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suivi et profils des stagiaires actuellement affectés.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Inscrire un stagiaire
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">Stagiaire</th>
                <th className="px-6 py-3.5 font-medium">Filière</th>
                <th className="px-6 py-3.5 font-medium">Établissement</th>
                <th className="px-6 py-3.5 font-medium">Superviseur</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                    Chargement...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Aucun stagiaire trouvé.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.Id_Stagiaire}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                          {`${item.NomStag?.[0] ?? ""}${item.PrenomStag?.[0] ?? ""}`}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.NomStag} {item.PrenomStag}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.Email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {item.Filiere}
                    </td>
                    <td className="px-6 py-4">
                      {item.NomEtab ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                          {item.NomEtab}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.NomSuperviseur ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                          {item.NomSuperviseur}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          title="Modifier"
                          className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.Id_Stagiaire)}
                          title="Supprimer"
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
