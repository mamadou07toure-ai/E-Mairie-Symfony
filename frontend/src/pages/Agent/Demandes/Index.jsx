import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FolderOpen, ChevronRight, CheckCircle, Clock, AlertTriangle, UserPlus, Building2, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';

const AgentIndexDemande = ({ apiBase = '/agent', linkBase }) => {
    const resolvedLinkBase = linkBase || (apiBase === '/admin' ? '/admin' : '/agent');

    const [activeTab, setActiveTab] = useState('toutes');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('tous');
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningUuid, setAssigningUuid] = useState(null);

    const fetchDemandes = async (filter = '') => {
        setLoading(true);
        try {
            const params = filter ? `?filter=${filter}` : '';
            const response = await api.get(`${apiBase}/demandes${params}`);
            setDemandes(response.data.data || []);
        } catch (error) {
            console.error("Erreur chargement demandes", error);
            toast.error("Impossible de charger les demandes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes(activeTab === 'assignations' ? 'mine' : '');
    }, [activeTab]);

    const handleAssign = async (uuid, e) => {
        e.preventDefault();
        e.stopPropagation();
        setAssigningUuid(uuid);
        try {
            await api.post(`${apiBase}/demandes/${uuid}/assign`);
            toast.success("Dossier pris en charge avec succès !");
            fetchDemandes(activeTab === 'assignations' ? 'mine' : '');
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'assignation.");
        } finally {
            setAssigningUuid(null);
        }
    };

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'en_cours': return <span className="badge-progress">En cours</span>;
            case 'validee': return <span className="badge-valid">Validée</span>;
            case 'rejetee': return <span className="badge-rejected">Rejetée</span>;
            case 'document_manquant': return <span className="badge-missing">Doc Manquant</span>;
            case 'remise': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">Remis</span>;
            default: return <span className="badge-pending">En attente</span>;
        }
    };

    const getPrioriteBadge = (priorite) => {
        switch (priorite) {
            case 'urgente': return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-1"><AlertTriangle className="h-3 w-3" /> URGENT</span>;
            case 'haute': return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1">HAUTE</span>;
            default: return null;
        }
    };

    const filteredDemandes = demandes.filter(d => {
        if (statusFilter !== 'tous' && d.statut !== statusFilter) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            const matchDossier = d.numero_dossier?.toLowerCase().includes(s);
            const matchCitoyen = `${d.user?.prenom} ${d.user?.nom}`.toLowerCase().includes(s);
            const matchType = d.type_demande?.libelle?.toLowerCase().includes(s);
            if (!matchDossier && !matchCitoyen && !matchType) return false;
        }
        return true;
    });

    const myCount = demandes.filter(d => d.agent !== null).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Gestion des dossiers</h2>
                    <p className="text-slate-500">Consultez et traitez les demandes des citoyens.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('toutes')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'toutes' 
                            ? 'border-mairie-cyan text-mairie-cyan' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    Toutes les demandes
                </button>
                <button
                    onClick={() => setActiveTab('assignations')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'assignations' 
                            ? 'border-mairie-cyan text-mairie-cyan' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    Mes assignations
                </button>
            </div>

            {/* Filters */}
            <div className="card-premium p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par N° dossier, nom citoyen, ou type..." 
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
                        <option value="document_manquant">Doc. manquant</option>
                        <option value="validee">Validée</option>
                        <option value="rejetee">Rejetée</option>
                        <option value="remise">Remis au guichet</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dossier</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Citoyen</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Retrait</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Soumission</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chargement...</td></tr>
                            ) : filteredDemandes.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Aucune demande trouvée.</td></tr>
                            ) : (
                                filteredDemandes.map((demande) => (
                                    <tr key={demande.uuid} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{demande.numero_dossier}</p>
                                            {getPrioriteBadge(demande.priorite)}
                                        </td>
                                        <td className="p-4 font-medium text-slate-700">
                                            {demande.user?.prenom} {demande.user?.nom}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{demande.type_demande?.libelle}</td>
                                        <td className="p-4">{getStatusBadge(demande.statut)}</td>
                                        <td className="p-4">
                                            {demande.is_physical_pickup
                                                ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg"><Building2 className="h-3.5 w-3.5" />Guichet</span>
                                                : <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg"><Download className="h-3.5 w-3.5" />Numérique</span>
                                            }
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{demande.created_at}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Prendre en charge button - only if no agent assigned */}
                                                {!demande.agent && (
                                                    <button
                                                        onClick={(e) => handleAssign(demande.uuid, e)}
                                                        disabled={assigningUuid === demande.uuid}
                                                        className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                                        {assigningUuid === demande.uuid ? '...' : 'Prendre en charge'}
                                                    </button>
                                                )}
                                                <Link to={`${resolvedLinkBase}/demandes/${demande.uuid}`} className="inline-flex items-center text-sm font-medium text-mairie-blue hover:underline">
                                                    Traiter <ChevronRight className="h-4 w-4 ml-1" />
                                                </Link>
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
};

export default AgentIndexDemande;
