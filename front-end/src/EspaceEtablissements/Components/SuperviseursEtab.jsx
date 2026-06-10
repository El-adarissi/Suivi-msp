// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from "react";

export function SuperviseursEtab() {
  const data = [
    { id: 1, nom: "Dr. Karim Alami", departement: "R&D", equipe: "Équipe Alpha", charge: "4 Stagiaires" },
    { id: 2, nom: "Mme. Sofia Tazi", departement: "IT Infrastructure", equipe: "DevOps", charge: "2 Stagiaires" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Superviseurs & Encadrants</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des collaborateurs responsables de l'encadrement interne.</p>
        </div>
        <button className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Nouveau Superviseur
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">Nom complet</th>
                <th className="px-6 py-3.5 font-medium">Département</th>
                <th className="px-6 py-3.5 font-medium">Affectation</th>
                <th className="px-6 py-3.5 font-medium">Charge de travail</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.nom}</td>
                  <td className="px-6 py-4">{item.departement}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.equipe}</td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{item.charge}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Modifier</button>
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