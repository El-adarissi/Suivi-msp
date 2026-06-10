// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from "react";

export function StagiairesEtab() {
  const data = [
    { id: 1, nom: "Amine Bennani", email: "amine@link.com", etablissement: "ENSAM", statut: "En cours" },
    { id: 2, nom: "Sara Nouari", email: "sara@link.com", etablissement: "Faculté des Sciences", statut: "Terminé" },
    { id: 3, nom: "Youssef El Alami", email: "youssef@link.com", etablissement: "EMSI", statut: "En cours" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Répertoire des Stagiaires</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Suivi et profils des stagiaires actuellement affectés.</p>
        </div>
        <button className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Inscrire un stagiaire
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">Stagiaire</th>
                <th className="px-6 py-3.5 font-medium">Établissement d'origine</th>
                <th className="px-6 py-3.5 font-medium">Statut du Stage</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                        {item.nom.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{item.nom}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.etablissement}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.statut === 'En cours' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.statut === 'En cours' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {item.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Dossier</button>
                    <button className="text-rose-600 dark:text-rose-400 hover:underline font-medium">Retirer</button>
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