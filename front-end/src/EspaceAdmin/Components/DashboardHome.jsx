import { useEffect, useState } from "react";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value ?? <span className="text-slate-300 dark:text-slate-600 text-base">Chargement...</span>}
      </p>
    </div>
  </div>
);

export default function DashboardHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/getstats`);
      const json = await res.json();
      if (json.success) setStats(json.data);
      console.log(json.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchStats();
}, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Tableau de bord</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Vue d'ensemble de la plateforme</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Établissements actifs" value={stats?.activeEtab} icon="🏢" color="bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard label="Total établissements" value={stats?.totalEtab} icon="📋" color="bg-slate-100 dark:bg-slate-800" />
        <StatCard label="Stagiaires actifs" value={stats?.activeStagiaires} icon="🎓" color="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard label="Total stagiaires" value={stats?.totalStagiaires} icon="👥" color="bg-slate-100 dark:bg-slate-800" />
        <StatCard label="Superviseurs" value={stats?.totalSuperviseurs} icon="👨‍💼" color="bg-violet-50 dark:bg-violet-950/40" />
        <StatCard label="Réclamations" value={stats?.totalReclamations} icon="📨" color="bg-slate-100 dark:bg-slate-800" />
        <StatCard label="En attente" value={stats?.reclEnAttente} icon="⏳" color="bg-amber-50 dark:bg-amber-950/40" />
      </div>
    </div>
  );
}