import { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';

const AgentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ aTraiter: 0, traitesMois: 0, totalAssignes: 0, enAttenteGlobale: 0 });
    const [mesDemandes, setMesDemandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/agent/demandes');
                const data = res.data.data || [];
                setMesDemandes(data.slice(0, 3));
                setStats({
                    aTraiter: data.filter(d => d.statut === 'en_cours').length,
                    traitesMois: data.filter(d => d.statut === 'validee').length,
                    totalAssignes: data.length,
                    enAttenteGlobale: data.filter(d => d.statut === 'en_attente').length,
                });
            } catch (e) {
                toast.error('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getInitials = (nom, prenom) => `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

    const badgeClass = (statut) => {
        const map = { en_attente: 'badge-waiting', en_cours: 'badge-progress', validee: 'badge-success', rejetee: 'badge-error', document_manquant: 'badge-warning' };
        return map[statut] || 'badge-waiting';
    };
    const badgeLabel = (statut) => {
        const map = { en_attente: 'En attente', en_cours: 'En cours', validee: 'Validée', rejetee: 'Rejetée', document_manquant: 'Doc. manquant' };
        return map[statut] || statut;
    };

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-r from-slate-950 to-mairie-blue/60 rounded-2xl p-8 text-white shadow-premium relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-4">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Session Active
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-2">Espace Traitement</h2>
                    <p className="text-slate-300 max-w-xl">
                        {loading ? 'Chargement...' : `Vous avez actuellement ${stats.aTraiter} dossiers en cours de traitement dans votre file.`}
                    </p>
                </div>
            </div>

            {/* Alert */}
            {!loading && stats.enAttenteGlobale > 5 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-rose-800">Pic d'activité détecté</h4>
                        <p className="text-sm text-rose-600 mt-1">
                            Il y a actuellement {stats.enAttenteGlobale} demandes en attente d'assignation. Merci de prendre en charge de nouveaux dossiers si votre file le permet.
                        </p>
                    </div>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-premium p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">À traiter</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-3xl font-bold text-amber-600">{loading ? '…' : stats.aTraiter}</p>
                        <Clock className="h-6 w-6 text-amber-500 opacity-20" />
                    </div>
                </div>
                
                <div className="card-premium p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Traités (validés)</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-3xl font-bold text-emerald-600">{loading ? '…' : stats.traitesMois}</p>
                        <CheckCircle className="h-6 w-6 text-emerald-500 opacity-20" />
                    </div>
                </div>

                <div className="card-premium p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assignés</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-3xl font-bold text-mairie-cyan">{loading ? '…' : stats.totalAssignes}</p>
                        <FileText className="h-6 w-6 text-mairie-cyan opacity-20" />
                    </div>
                </div>

                <div className="card-premium p-5 bg-rose-50 border-rose-100">
                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">En attente globale</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-3xl font-bold text-rose-600">{loading ? '…' : stats.enAttenteGlobale}</p>
                        <AlertTriangle className="h-6 w-6 text-rose-500 opacity-20" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Mes dernières assignations</h3>
                        <Link to="/agent/demandes" className="text-sm text-mairie-blue hover:underline font-medium">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {loading && <p className="text-slate-400 text-sm text-center py-4">Chargement...</p>}
                        {!loading && mesDemandes.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-4">Aucun dossier assigné pour le moment.</p>
                        )}
                        {!loading && mesDemandes.map((d) => (
                            <Link key={d.uuid} to={`/agent/demandes/${d.uuid}`}
                                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                                        {getInitials(d.citoyen?.nom, d.citoyen?.prenom)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{d.citoyen?.prenom} {d.citoyen?.nom}</p>
                                        <p className="text-xs text-slate-500">{d.type_demande?.libelle}</p>
                                    </div>
                                </div>
                                <span className={badgeClass(d.statut)}>{badgeLabel(d.statut)}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card-premium p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Rappels importants</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Mise à jour procédure (Légalisation)</h4>
                            <p className="text-xs text-blue-800">Le délai de traitement pour les légalisations passe à 24h à partir du 1er Juin.</p>
                            <p className="text-[10px] text-blue-500 mt-2">Par Admin</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">Maintenance Serveur</h4>
                            <p className="text-xs text-slate-600">Coupure prévue ce dimanche de 02h00 à 04h00. Sauvegardez vos travaux en cours.</p>
                            <p className="text-[10px] text-slate-400 mt-2">Par Système</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
