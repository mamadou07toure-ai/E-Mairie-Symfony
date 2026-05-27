import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, FileText, CheckCircle, Clock, ShieldCheck,
    AlertTriangle, Download, User, Phone, Mail, FileCheck, XCircle, FileWarning, Edit3, UserPlus, UserMinus, MessageSquare, Trash2, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';

const AgentShowDemande = ({ apiBase = '/agent', linkBase }) => {
    const resolvedLinkBase = linkBase || (apiBase === '/admin' ? '/admin' : '/agent');
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('traitement');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusComment, setStatusComment] = useState('');
    const [demande, setDemande] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [closingDossier, setClosingDossier] = useState(false);

    const fetchDemande = async () => {
        try {
            const response = await api.get(`${apiBase}/demandes/${uuid}`);
            setDemande(response.data);
        } catch (error) {
            console.error("Erreur chargement demande", error);
            toast.error("Impossible de charger ce dossier.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemande();
    }, [uuid]);

    const handleAssign = async () => {
        setProcessing(true);
        try {
            await api.post(`${apiBase}/demandes/${uuid}/assign`);
            toast.success("Dossier pris en charge !");
            fetchDemande();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'assignation.");
        } finally {
            setProcessing(false);
        }
    };

    const handleUnassign = async () => {
        if (!window.confirm("Voulez-vous vraiment relâcher ce dossier ?")) return;
        setProcessing(true);
        try {
            await api.post(`${apiBase}/demandes/${uuid}/unassign`);
            toast.success("Dossier relâché.");
            fetchDemande();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur.");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        if (newStatus !== 'validee' && !statusComment) {
            toast.warning("Veuillez préciser un motif.");
            return;
        }
        setProcessing(true);
        try {
            await api.post(`${apiBase}/demandes/${uuid}/status`, {
                statut: newStatus,
                commentaire: statusComment
            });
            toast.success(`Statut mis à jour : ${newStatus}`);
            setShowStatusModal(false);
            setStatusComment('');
            setNewStatus('');
            fetchDemande();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm("Confirmer la remise du document au citoyen au guichet ? Le dossier sera définitivement clôturé.")) return;
        setClosingDossier(true);
        try {
            await api.post(`${apiBase}/demandes/${uuid}/close`);
            toast.success("Dossier clôturé. Document remis au citoyen !");
            fetchDemande();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la clôture.");
        } finally {
            setClosingDossier(false);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;
        try {
            await api.delete(`${apiBase}/messages/${msgId}`);
            toast.success("Message supprimé.");
            const response = await api.get(`${apiBase}/demandes/${uuid}`);
            setDemande(response.data);
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const submitMessage = async (e) => {
        e.preventDefault();
        if(!messageContent.trim() || sending) return;
        setSending(true);
        try {
            if (editingMessageId) {
                await api.patch(`${apiBase}/messages/${editingMessageId}`, { content: messageContent });
                setEditingMessageId(null);
                toast.success("Message modifié.");
            } else {
                await api.post(`${apiBase}/demandes/${uuid}/messages`, { content: messageContent });
            }
            setMessageContent('');
            const response = await api.get(`${apiBase}/demandes/${uuid}`);
            setDemande(response.data);
        } catch (error) {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement du dossier...</div>;
    }

    if (!demande) {
        return <div className="p-8 text-center text-rose-500 font-bold">Dossier introuvable.</div>;
    }

    const formData = demande.donnees_formulaire || demande.specific_data || {};
    const isMyDossier = demande.agent !== null;
    const canChangeStatus = isMyDossier && !['validee', 'rejetee', 'remise'].includes(demande.statut);
    const canClose = isMyDossier && demande.is_physical_pickup && demande.statut === 'validee';

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link to={`${resolvedLinkBase}/demandes`} className="btn-secondary px-3">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Retour à la liste
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Assign / Unassign */}
                    {!demande.agent ? (
                        <button 
                            onClick={handleAssign}
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            <UserPlus className="h-4 w-4 mr-2" /> 
                            {processing ? 'En cours...' : 'Prendre en charge'}
                        </button>
                    ) : (
                        <button
                            onClick={handleUnassign}
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            <UserMinus className="h-4 w-4 mr-2" /> Relâcher le dossier
                        </button>
                    )}
                    {/* Change status */}
                    {canChangeStatus && (
                        <button 
                            onClick={() => setShowStatusModal(true)}
                            className="btn-primary bg-mairie-cyan hover:bg-mairie-cyan-dark border-none self-start h-11"
                        >
                            <Edit3 className="h-5 w-5 mr-2" /> Changer le statut
                        </button>
                    )}
                    {/* Close dossier button — only for physical pickup, validated */}
                    {canClose && (
                        <button
                            onClick={handleClose}
                            disabled={closingDossier}
                            className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {closingDossier ? 'Clôture...' : 'Marquer comme Remis'}
                        </button>
                    )}
                </div>
            </div>

            {/* Title & Actions */}
            <div className="card-premium p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-blue-50 text-mairie-blue flex items-center justify-center shrink-0">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                                {demande.numero_dossier}
                            </h1>
                            <p className="text-lg text-slate-600 font-medium">{demande.type_demande?.libelle}</p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    demande.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                    demande.statut === 'validee' ? 'bg-emerald-100 text-emerald-700' :
                                    demande.statut === 'rejetee' ? 'bg-rose-100 text-rose-700' :
                                    demande.statut === 'document_manquant' ? 'bg-amber-100 text-amber-700' :
                                    demande.statut === 'remise' ? 'bg-violet-100 text-violet-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {demande.statut_label || demande.statut}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                    Priorité {demande.priorite_label || demande.priorite}
                                </span>
                                {demande.agent ? (
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                        Assigné : {demande.agent.prenom} {demande.agent.nom}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                                        Non assigné
                                    </span>
                                )}
                                {demande.is_physical_pickup !== undefined && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                                        demande.is_physical_pickup 
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    }`}>
                                        {demande.is_physical_pickup 
                                            ? <><Building2 className="h-3.5 w-3.5" /> Retrait Physique</> 
                                            : <><Download className="h-3.5 w-3.5" /> Téléchargement Numérique</>}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('traitement')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'traitement' ? 'border-mairie-cyan text-mairie-cyan' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Traitement du dossier
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'documents' ? 'border-mairie-cyan text-mairie-cyan' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Pièces jointes ({(demande.documents || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('historique')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'historique' ? 'border-mairie-cyan text-mairie-cyan' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Historique et Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'messages' ? 'border-mairie-cyan text-mairie-cyan' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Messagerie
                            {demande.messages?.length > 0 && (
                                <span className="bg-mairie-cyan text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {demande.messages.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="pt-8">
                    {activeTab === 'traitement' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Données du formulaire</h3>
                                    {Object.keys(formData).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(formData).map(([key, value]) => (
                                                <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                                        {key.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="font-medium text-slate-900 text-lg">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 italic">Aucune donnée de formulaire.</p>
                                    )}
                                </div>
                                {demande.description && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Description</h3>
                                        <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{demande.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-mairie-cyan mb-4 flex items-center">
                                            <User className="h-5 w-5 mr-2" /> Demandeur
                                        </h3>
                                        <p className="font-display font-bold text-xl mb-1">{demande.user?.prenom} {demande.user?.nom}</p>
                                        <div className="space-y-3 mt-4">
                                            <div className="flex items-center text-slate-300 text-sm">
                                                <Mail className="h-4 w-4 mr-3 opacity-70" /> {demande.user?.email}
                                            </div>
                                            {demande.user?.telephone && (
                                                <div className="flex items-center text-slate-300 text-sm">
                                                    <Phone className="h-4 w-4 mr-3 opacity-70" /> {demande.user?.telephone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-5 pointer-events-none" />
                                </div>

                                <div className="card-premium p-6 border-none bg-emerald-50">
                                    <h3 className="font-bold text-emerald-900 mb-2">Délai de traitement</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-emerald-700">Échéance :</span>
                                        <span className="font-bold text-emerald-900">{demande.date_echeance || 'Non définie'}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-emerald-700">Soumis le :</span>
                                        <span className="font-bold text-emerald-900">{demande.created_at}</span>
                                    </div>
                                </div>

                                {/* Pickup Mode Info */}
                                {demande.is_physical_pickup !== undefined && (
                                    <div className={`rounded-xl p-6 border ${demande.is_physical_pickup ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${demande.is_physical_pickup ? 'text-amber-900' : 'text-indigo-900'}`}>
                                            {demande.is_physical_pickup ? <Building2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                                            Mode de retrait
                                        </h3>
                                        <p className={`text-sm font-medium ${demande.is_physical_pickup ? 'text-amber-700' : 'text-indigo-700'}`}>
                                            {demande.is_physical_pickup 
                                                ? 'Le citoyen souhaite récupérer son document au guichet de la Mairie.' 
                                                : 'Le citoyen récupérera son document par téléchargement numérique.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(demande.documents || []).length > 0 ? (
                                    demande.documents.map((doc) => {
                                        const isImage = doc.type_mime?.startsWith('image/') || doc.nom?.toLowerCase().endsWith('.jpg') || doc.nom?.toLowerCase().endsWith('.png');
                                        const docUrl = doc.url ? `http://localhost:8000${doc.url}` : null;
                                        
                                        return (
                                            <div key={doc.id} className="flex flex-col border border-slate-200 rounded-xl overflow-hidden hover:border-mairie-cyan hover:shadow-soft transition-colors bg-white relative group">
                                                {/* Preview */}
                                                <div className="h-32 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden relative">
                                                    {isImage && docUrl ? (
                                                        <img src={docUrl} alt={doc.nom} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                    ) : (
                                                        <FileText className="w-12 h-12 text-slate-300" />
                                                    )}
                                                    {isImage && docUrl && (
                                                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold tracking-widest uppercase">
                                                            Voir en grand
                                                        </a>
                                                    )}
                                                </div>
                                                
                                                {/* Info */}
                                                <div className="p-3 flex items-center justify-between bg-white">
                                                    <div className="truncate pr-2">
                                                        <p className="text-xs font-medium text-slate-700 truncate">{doc.nom}</p>
                                                        <p className="text-[10px] text-slate-400">{doc.date || doc.created_at}</p>
                                                    </div>
                                                    {docUrl && (
                                                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-mairie-cyan uppercase tracking-widest bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                                                            <Download className="h-3.5 w-3.5 inline mr-1" />Ouvrir
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full p-8 text-center text-slate-500">Aucun document attaché.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'historique' && (
                        <div className="animate-fade-in max-w-3xl">
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                {demande.historique_statuts && demande.historique_statuts.length > 0 ? (
                                    demande.historique_statuts.map((event, index) => (
                                        <div key={index} className="relative pl-8">
                                            <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-mairie-cyan -left-[9px] top-1"></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-500 mb-1">{event.date || event.created_at}</p>
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-soft">
                                                    <p className="font-bold text-slate-900">{event.action || event.statut}</p>
                                                    <p className="text-sm text-slate-500 mt-1">Par : {event.par || (event.user ? `${event.user.prenom} ${event.user.nom}` : 'Système')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">Aucun historique disponible.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px] animate-fade-in">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">Discussion avec le citoyen</h3>
                                    <p className="text-xs text-slate-500">
                                        {demande.user ? `${demande.user.prenom} ${demande.user.nom}` : "Inconnu"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 flex flex-col">
                                {(!demande.messages || demande.messages.length === 0) ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Aucun message. Le citoyen peut vous contacter ici.</p>
                                    </div>
                                ) : (
                                    demande.messages.map((msg) => {
                                        const isAgent = msg.sender.role !== 'citoyen';
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                                                <div className={`flex items-end gap-2 group ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`max-w-md rounded-2xl p-3 shadow-sm relative ${isAgent ? 'bg-mairie-cyan text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isAgent ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                            {msg.created_at}
                                                            {msg.is_edited && <span className="italic">(modifié)</span>}
                                                        </p>
                                                    </div>

                                                    {isAgent && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingMessageId(msg.id);
                                                                    setMessageContent(msg.content);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-mairie-cyan hover:bg-cyan-50 rounded-full transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-white">
                                <form 
                                    className="flex gap-2"
                                    onSubmit={submitMessage}
                                >
                                    <input 
                                        type="text" 
                                        className="input-field flex-1" 
                                        placeholder="Répondre au citoyen..." 
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        disabled={sending}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-primary shrink-0"
                                        disabled={sending || !messageContent.trim()}
                                    >
                                        {editingMessageId ? 'Modifier' : 'Envoyer'}
                                    </button>
                                    {editingMessageId && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEditingMessageId(null);
                                                setMessageContent('');
                                            }}
                                            className="btn-secondary shrink-0 text-slate-500"
                                            disabled={sending}
                                        >
                                            Annuler
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-premium w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-display font-bold text-xl text-slate-900">Mettre à jour le statut</h3>
                            <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                    <input type="radio" name="status" value="validee" onChange={(e) => setNewStatus(e.target.value)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span className="ml-3 flex items-center gap-2 font-bold text-slate-900"><FileCheck className="h-5 w-5 text-emerald-500" /> Valider le dossier</span>
                                </label>
                                <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
                                    <input type="radio" name="status" value="rejetee" onChange={(e) => setNewStatus(e.target.value)} className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                                    <span className="ml-3 flex items-center gap-2 font-bold text-slate-900"><XCircle className="h-5 w-5 text-rose-500" /> Rejeter le dossier</span>
                                </label>
                                <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                                    <input type="radio" name="status" value="document_manquant" onChange={(e) => setNewStatus(e.target.value)} className="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                                    <span className="ml-3 flex items-center gap-2 font-bold text-slate-900"><FileWarning className="h-5 w-5 text-amber-500" /> Document manquant</span>
                                </label>
                            </div>

                            {newStatus && (
                                <div className="mt-4 animate-fade-in">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {newStatus === 'validee' ? "Note interne (optionnelle)" : "Motif (obligatoire)"}
                                    </label>
                                    <textarea 
                                        className="input-field w-full h-24 resize-none" 
                                        placeholder={newStatus === 'validee' ? "RAS" : "Veuillez préciser la raison..."}
                                        value={statusComment}
                                        onChange={(e) => setStatusComment(e.target.value)}
                                        required={newStatus !== 'validee'}
                                    ></textarea>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setShowStatusModal(false)} className="btn-secondary bg-white">Annuler</button>
                            <button 
                                onClick={handleUpdateStatus} 
                                disabled={!newStatus || (newStatus !== 'validee' && !statusComment) || processing} 
                                className="btn-primary disabled:opacity-50"
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentShowDemande;
