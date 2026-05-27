import { useState, useEffect } from 'react';
import { Shield, Users, FileText, CheckCircle, Clock, XCircle, AreaChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periode, setPeriode] = useState('30 jours');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (e) {
                toast.error('Impossible de charger les statistiques');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpis = stats ? [
        { label: 'Citoyens Inscrits', value: stats.total_citoyens ?? '—', icon: Users, color: 'text-mairie-cyan', border: 'border-l-mairie-cyan' },
        { label: 'Agents Actifs', value: stats.total_agents ?? '—', icon: Shield, color: 'text-mairie-blue', border: 'border-l-mairie-blue' },
        { label: 'Dossiers Validés', value: stats.total_valides ?? '—', icon: CheckCircle, color: 'text-emerald-500', border: 'border-l-emerald-500' },
        { label: 'En cours', value: stats.total_en_cours ?? '—', icon: Clock, color: 'text-amber-500', border: 'border-l-amber-500' },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-r from-slate-950 to-mairie-blue/60 rounded-2xl p-8 text-white shadow-premium relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-4">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            SYSTÈME OPÉRATIONNEL
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-2">Administration Centrale</h2>
                        <p className="text-slate-300 max-w-xl">
                            Vue globale sur l'activité de la plateforme et les performances des agents.
                        </p>
                    </div>
                    <Link to="/admin/demandes" className="btn-primary bg-mairie-cyan hover:bg-mairie-cyan-light border-none">
                        Voir les dossiers
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Période :</span>
                {["Aujourd'hui", '7 jours', '30 jours', 'Tout'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriode(p)}
                        className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
                            periode === p ? 'bg-mairie-blue text-white shadow-soft' : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* KPIs */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="card-premium p-5 h-24 animate-pulse bg-slate-100" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={i} className={`card-premium p-5 border-l-4 ${kpi.border}`}>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                                    <Icon className={`h-6 w-6 ${kpi.color} opacity-50`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-premium p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Volume des Demandes (30 derniers jours)</h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                        <div className="text-center">
                            <Link to="/admin/stats" className="text-mairie-blue font-medium text-sm hover:underline">
                                Voir les graphiques complets →
                            </Link>
                            <p className="text-slate-400 text-xs mt-1">Page Statistiques</p>
                        </div>
                    </div>
                </div>

                <div className="card-premium p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Performance des Agents</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-slate-400 text-sm text-center">Chargement...</p>
                        ) : (
                            (stats?.top_agents || [
                                { nom: 'DIALLO', prenom: 'Mamadou', count: 0, progress: 0 },
                            ]).map((agent, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-900">{agent.prenom} {agent.nom}</span>
                                        <span className="font-bold text-mairie-blue">{agent.count || 0} dossiers</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-mairie-blue to-mairie-cyan h-2 rounded-full transition-all" style={{ width: `${agent.progress || 10}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <Link to="/admin/users" className="text-sm text-mairie-blue hover:underline font-medium mt-4 block">
                        Gérer les utilisateurs →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
