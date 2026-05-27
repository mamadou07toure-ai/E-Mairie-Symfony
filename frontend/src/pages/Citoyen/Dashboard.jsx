import { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';

const CitoyenDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ actifs: 0, valides: 0, rejetes: 0 });
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/demandes');
                const data = res.data.data || [];
                setDemandes(data.slice(0, 3));
                setStats({
                    actifs: data.filter(d => ['en_attente', 'en_cours'].includes(d.statut)).length,
                    valides: data.filter(d => d.statut === 'validee').length,
                    rejetes: data.filter(d => ['rejetee', 'document_manquant'].includes(d.statut)).length,
                });
            } catch {
                toast.error('Impossible de charger vos données');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const badgeClass = (statut) => {
        const map = {
            en_attente: 'badge-waiting', en_cours: 'badge-progress',
            validee: 'badge-success', rejetee: 'badge-error',
            document_manquant: 'badge-warning'
        };
        return map[statut] || 'badge-waiting';
    };

    const badgeLabel = (statut) => {
        const map = {
            en_attente: 'En attente', en_cours: 'En cours',
            validee: 'Validée', rejetee: 'Rejetée',
            document_manquant: 'Doc. manquant'
        };
        return map[statut] || statut;
    };

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-r from-slate-950 to-mairie-blue rounded-2xl p-8 text-white shadow-premium relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-mairie-cyan text-sm font-medium mb-4">
                        <ShieldCheck className="h-4 w-4" />
                        Espace Citoyen
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-2">Bonjour, {user?.prenom} 👋</h2>
                    <p className="text-slate-300 max-w-xl">
                        Bienvenue sur votre espace personnel. Suivez vos dossiers ou démarrez une nouvelle procédure.
                    </p>
                    <div className="mt-6">
                        <Link to="/citoyen/demandes/create" className="btn-primary bg-mairie-cyan hover:bg-mairie-cyan-dark border-none inline-flex">
                            Nouvelle demande
                        </Link>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-mairie-cyan/20 rounded-full blur-3xl"></div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Dossiers actifs</p>
                            <p className="text-3xl font-bold text-mairie-cyan mt-1">{loading ? '...' : stats.actifs}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-mairie-blue">
                            <Clock className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Validés</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">{loading ? '...' : stats.valides}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="card-premium p-6 border-l-4 border-l-rose-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Rejetés ou incomplets</p>
                            <p className="text-3xl font-bold text-rose-600 mt-1">{loading ? '...' : stats.rejetes}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent files & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-premium">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Dossiers récents</h3>
                        <Link to="/citoyen/demandes" className="text-sm text-mairie-blue font-medium hover:underline">Voir tout</Link>
                    </div>
                    <div className="p-0 divide-y divide-slate-100">
                        {loading && (
                            <div className="p-8 text-center text-slate-400">Chargement...</div>
                        )}
                        {!loading && demandes.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>Aucun dossier pour le moment.</p>
                                <Link to="/citoyen/demandes/create" className="text-mairie-blue font-medium hover:underline text-sm mt-2 inline-block">
                                    Créer ma première demande →
                                </Link>
                            </div>
                        )}
                        {!loading && demandes.map((d) => (
                            <Link key={d.uuid} to={`/citoyen/demandes/${d.uuid}`}
                                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-mairie-blue flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{d.type_demande?.libelle}</p>
                                        <p className="text-xs text-slate-500">N° {d.numero_dossier}</p>
                                    </div>
                                </div>
                                <span className={badgeClass(d.statut)}>{badgeLabel(d.statut)}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-premium p-6 bg-slate-900 text-white border-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2 text-mairie-cyan">Besoin d'aide ?</h3>
                            <p className="text-sm text-slate-300 mb-4">Notre support est disponible pour vous accompagner dans vos démarches.</p>
                            <a href="tel:+224000000" className="text-sm font-medium text-slate-900 bg-white px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors w-full block text-center">
                                Contacter le support
                            </a>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <ShieldCheck className="h-32 w-32" />
                        </div>
                    </div>
                    
                    <div className="card-premium p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Délais de traitement</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { label: 'Acte de naissance', delai: '3 jours' },
                                { label: 'Certificat de résidence', delai: '2 jours' },
                                { label: 'Légalisation', delai: '1 jour' },
                                { label: 'Acte de mariage', delai: '5 jours' },
                            ].map((item, i) => (
                                <li key={i} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                                    <span className="text-slate-600">{item.label}</span>
                                    <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-xs">{item.delai}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitoyenDashboard;
