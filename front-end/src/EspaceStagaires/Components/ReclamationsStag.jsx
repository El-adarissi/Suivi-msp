// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from "react";

export function ReclamationsStag() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Déposer une Réclamation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Formulaire de signalement d'anomalies ou de requêtes administratives.</p>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Objet du message</label>
              <input type="text" placeholder="Ex: Problème d'accès badge" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Urgence</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all">
                <option>Basse</option>
                <option>Moyenne</option>
                <option>Critique</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Description détaillée</label>
            <textarea rows={5} placeholder="Décrivez la situation avec précision..." className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none" />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors">
            Soumettre le ticket
          </button>
        </form>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Statut des requêtes</h3>
        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Ticket #1024</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">En examen</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Absence injustifiée système de pointage...</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Ticket #0981</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Résolu</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Convention tripartie manquante RH...</p>
          </div>
        </div>
      </div>
    </div>
  );
}