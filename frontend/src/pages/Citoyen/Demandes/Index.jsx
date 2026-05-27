import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Search, Filter, FileText, ChevronRight, ChevronLeft, Clock, CheckCircle, XCircle, Building2, Download } from 'lucide-react';
import api from '../../../api/axios';

const IndexDemande = () => {
    useAuth(); // keep useAuth to enforce authentication if it does that, or remove it entirely if not needed. Actually let's just destructure nothing
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('tous');
    
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await api.get('/demandes');
                setDemandes(response.data.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des demandes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDemandes();
    }, []);

    const getStatusBadge = (statut, isPhysical) => {
        switch (statut) {
            case 'en_cours': return <span className="badge-progress">En cours</span>;
            case 'validee': return isPhysical
                ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Building2 className="h-3 w-3" />Retrait Guichet</span>
                : <span className="badge-valid">Validée</span>;
            case 'rejetee': return <span className="badge-rejected">Rejetée</span>;
            case 'document_manquant': return <span className="badge-missing">Doc Manquant</span>;
            case 'remise': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">Remis au guichet</span>;
            default: return <span className="badge-pending">En attente</span>;
        }
    };

    const getStatusIcon = (statut) => {
        switch (statut) {
            case 'validee': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'rejetee': return <XCircle className="h-5 w-5 text-rose-500" />;
            case 'remise': return <Building2 className="h-5 w-5 text-violet-500" />;
            default: return <Clock className="h-5 w-5 text-amber-500" />;
        }
    };

    const filteredDemandes = demandes.filter(d => {
        const matchesSearch = d.numero_dossier.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (d.type_demande?.libelle || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'tous' || d.statut === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Mes dossiers</h2>
                    <p className="text-slate-500">Suivez l'état d'avancement de vos demandes.</p>
                </div>
                <Link to="/citoyen/demandes/create" className="btn-primary whitespace-nowrap">
                    Nouvelle demande
                </Link>
            </div>

            {/* Filters */}
            <div className="card-premium p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par N° de dossier ou type..." 
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select 
                        className="input-field pl-10"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="tous">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="en_cours">En cours</option>
                        <option value="validee">Validée</option>
                        <option value="rejetee">Rejetée</option>
                        <option value="remise">Remis au guichet</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="card-premium overflow-hidden">
                <div className="divide-y divide-slate-100 min-h-[200px]">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Chargement de vos demandes...</div>
                    ) : filteredDemandes.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Aucune demande trouvée.</div>
                    ) : (
                        filteredDemandes.map((demande) => (
                            <Link 
                                key={demande.id} 
                                to={`/citoyen/demandes/${demande.uuid}`}
                                className="block hover:bg-slate-50 transition-colors p-6 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-mairie-blue flex items-center justify-center shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-900 group-hover:text-mairie-blue transition-colors">
                                                    {demande.numero_dossier}
                                                </h3>
                                                {getStatusBadge(demande.statut, demande.is_physical_pickup)}
                                            </div>
                                            <p className="text-slate-600 font-medium">{demande.type_demande?.libelle}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>Soumis le {demande.created_at}</span>
                                                {demande.agent ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                        Traité par {demande.agent.prenom} {demande.agent.nom}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600">
                                                        <span className="h-1 w-1 bg-amber-400 rounded-full"></span>
                                                        En attente d'assignation
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end md:justify-start gap-4">
                                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                            {getStatusIcon(demande.statut)}
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-mairie-blue group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-slate-700">
                            Affichage de <span className="font-medium">1</span> à <span className="font-medium">3</span> sur <span className="font-medium">3</span> résultats
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0">
                                <span className="sr-only">Précédent</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button className="relative z-10 inline-flex items-center bg-mairie-blue px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mairie-blue">1</button>
                            <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0">
                                <span className="sr-only">Suivant</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndexDemande;
