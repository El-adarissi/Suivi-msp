import { useState, useEffect } from "react";

export function Etablissements() {
  const data = [
    { id: 1, nom: "Faculté des Sciences", ville: "Casablanca", type: "Public", stagiaires: 45 },
    { id: 2, nom: "ENSAM", ville: "Rabat", type: "Public", stagiaires: 22 },
    { id: 3, nom: "EMSI", ville: "Marrakech", type: "Privé", stagiaires: 18 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Gestion des Établissements</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Liste des universités, écoles et instituts partenaires.</p>
        </div>
        <button className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Ajouter un établissement
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">Nom de l'Établissement</th>
                <th className="px-6 py-3.5 font-medium">Ville</th>
                <th className="px-6 py-3.5 font-medium">Type</th>
                <th className="px-6 py-3.5 font-medium">Stagiaires Actifs</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.nom}</td>
                  <td className="px-6 py-4">{item.ville}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.type === 'Public' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{item.stagiaires}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Modifier</button>
                    <button className="text-rose-600 dark:text-rose-400 hover:underline font-medium">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}