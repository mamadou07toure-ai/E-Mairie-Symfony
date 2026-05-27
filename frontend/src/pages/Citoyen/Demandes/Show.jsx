import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, FileText, CheckCircle, 
    AlertTriangle, Download, UploadCloud, MessageSquare, Calendar, Trash2, Edit3, Building2, ShieldCheck, Printer, QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';

const ShowDemande = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [demande, setDemande] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);

    useEffect(() => {
        const fetchDemande = async () => {
            try {
                const response = await api.get(`/demandes/${uuid}`);
                setDemande(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de la demande", error);
                toast.error("Impossible de charger les détails du dossier.");
            } finally {
                setLoading(false);
            }
        };

        fetchDemande();
    }, [uuid]);

    const handleUpload = () => {
        toast.success("Document téléchargé avec succès (Simulation)");
    };

    const handleContactAgent = () => {
        if (!demande.agent) {
            toast.warning("Aucun agent n'est encore assigné à votre dossier.");
            return;
        }
        setActiveTab('messages');
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;
        try {
            await api.delete(`/demandes/messages/${msgId}`);
            toast.success("Message supprimé.");
            const response = await api.get(`/demandes/${uuid}`);
            setDemande(response.data);
        } catch {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const submitMessage = async (e) => {
        e.preventDefault();
        if(!messageContent.trim() || sending) return;
        setSending(true);
        try {
            if (editingMessageId) {
                await api.patch(`/demandes/messages/${editingMessageId}`, { content: messageContent });
                setEditingMessageId(null);
                toast.success("Message modifié.");
            } else {
                await api.post(`/demandes/${uuid}/messages`, { content: messageContent });
            }
            setMessageContent('');
            const response = await api.get(`/demandes/${uuid}`);
            setDemande(response.data);
        } catch {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.")) return;
        
        try {
            await api.delete(`/demandes/${uuid}`);
            toast.success("Demande supprimée avec succès.");
            navigate('/citoyen/demandes');
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
        }
    };

    const handleEdit = () => {
        toast.info("Pour des raisons légales, une demande soumise ne peut être modifiée. Veuillez la supprimer et en créer une nouvelle.");
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement des informations du dossier...</div>;
    }

    if (!demande) {
        return <div className="p-8 text-center text-rose-500 font-bold">Dossier introuvable.</div>;
    }

    const formDataToDisplay = demande.donnees_formulaire || demande.specific_data || {};

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link to="/citoyen/demandes" className="btn-secondary px-3 self-start">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Retour
                </Link>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {demande.statut === 'en_attente' && (
                        <>
                            <button onClick={handleEdit} className="btn-secondary bg-white text-slate-600 hover:text-slate-900 border-slate-200">
                                <Edit3 className="h-4 w-4 mr-2" /> Modifier
                            </button>
                            <button onClick={handleDelete} className="btn-secondary bg-white text-rose-600 hover:bg-rose-50 border-rose-200">
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </button>
                        </>
                    )}
                    <button onClick={handleContactAgent} className="btn-primary bg-mairie-cyan hover:bg-mairie-cyan-dark border-none">
                        <MessageSquare className="h-4 w-4 mr-2" /> Contacter l'agent
                    </button>
                </div>
            </div>

            {/* === REMISE FINALE BANNER (physical pickup completed) === */}
            {demande.statut === 'remise' && (
                <div className="animate-fade-in bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-[2rem] p-6 sm:p-8 shadow-lg shadow-violet-500/5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/30">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-violet-900">Dossier Clôturé — Document Remis</h3>
                            <p className="text-sm text-violet-700 mt-1">
                                Votre document officiel vous a été remis au guichet de la Mairie de Kaloum. Ce dossier est maintenant définitivement clôturé.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-xl px-4 py-2">
                                <CheckCircle className="w-5 h-5 text-violet-600" />
                                <span className="text-sm font-bold text-violet-800">N° Dossier : {demande.numero_dossier}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === VALIDATED DOSSIER BANNER === */}
            {demande.statut === 'validee' && (
                <div className="animate-fade-in">
                    {!demande.is_physical_pickup ? (
                        /* ---- Digital Download Mode ---- */
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[2rem] p-6 sm:p-8 shadow-lg shadow-emerald-500/5">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                                    <ShieldCheck className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-emerald-900">Dossier Validé — Document Disponible</h3>
                                    <p className="text-sm text-emerald-700 mt-1">Votre acte officiel a été généré avec succès. Vous pouvez le télécharger ci-dessous.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(demande.documents || []).filter(d => d.type === 'document_genere').map(doc => (
                                    <a 
                                        key={doc.id}
                                        href={`http://127.0.0.1:8000${doc.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-white border border-emerald-200 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-400 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{doc.nom}</p>
                                            <p className="text-xs text-slate-500">PDF • {doc.date}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            {(demande.documents || []).filter(d => d.type === 'document_genere').length === 0 && (
                                <p className="text-sm text-emerald-700 italic mt-2">Le document officiel est en cours de préparation par l'agent.</p>
                            )}
                        </div>
                    ) : (
                        /* ---- Physical Pickup Mode ---- */
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[2rem] p-6 sm:p-8 shadow-lg shadow-amber-500/5">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                    <Building2 className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-amber-900">Dossier Validé — Retrait Physique</h3>
                                    <p className="text-sm text-amber-700 mt-1">Votre document est prêt. Présentez-vous à la Mairie de Kaloum avec votre Bon de Retrait.</p>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-4">
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><QrCode className="w-5 h-5 text-amber-500" /> Informations de retrait</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-bold text-slate-600">N° Dossier :</span> <span className="font-mono font-bold text-amber-700">{demande.numero_dossier}</span></p>
                                            <p><span className="font-bold text-slate-600">Lieu :</span> Mairie de Kaloum — Guichet État Civil</p>
                                            <p><span className="font-bold text-slate-600">Horaires :</span> Lundi → Vendredi, 8h30 – 16h00</p>
                                            <p><span className="font-bold text-slate-600">Pièce requise :</span> CNI ou Passeport en cours de validité</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-center">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${demande.numero_dossier}`} 
                                            alt="QR Code"
                                            className="w-28 h-28 border border-slate-200 rounded-xl p-1.5 bg-white shadow-sm"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Scan au guichet</p>
                                    </div>
                                </div>
                            </div>

                            {/* Only show the "Bon de Retrait" — the official act is NOT downloadable for physical pickup */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(demande.documents || [])
                                    .filter(d => d.type === 'document_genere' && d.nom?.includes('Bon'))
                                    .map(doc => (
                                    <a 
                                        key={doc.id}
                                        href={`http://127.0.0.1:8000${doc.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-white border border-amber-200 rounded-2xl p-5 hover:shadow-xl hover:border-amber-400 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            <Printer className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{doc.nom}</p>
                                            <p className="text-xs text-slate-500">PDF • Bon de passage au guichet</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Title & Badges */}
            <div className="card-premium p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-blue-50 text-mairie-blue flex items-center justify-center shrink-0">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                                {demande.numero_dossier}
                            </h1>
                            <p className="text-lg text-slate-600 font-medium">{demande.type_demande?.libelle}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    demande.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                    demande.statut === 'validee' ? 'bg-emerald-100 text-emerald-700' :
                                    demande.statut === 'rejetee' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {demande.statut_label || demande.statut}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                    Priorité {demande.priorite}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-left sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Date d'échéance prévue</p>
                        <p className="text-lg font-bold text-slate-900 flex items-center justify-start sm:justify-end gap-2">
                            <Calendar className="h-5 w-5 text-mairie-cyan" />
                            {demande.date_echeance}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'details'
                                    ? 'border-mairie-blue text-mairie-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Détails du dossier
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'documents'
                                    ? 'border-mairie-blue text-mairie-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Pièces jointes ({(demande.documents || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('historique')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'historique'
                                    ? 'border-mairie-blue text-mairie-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Historique
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === 'messages'
                                    ? 'border-mairie-blue text-mairie-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Messagerie
                            {demande.messages?.length > 0 && (
                                <span className="bg-mairie-blue text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {demande.messages.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="pt-8">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Informations saisies</h3>
                                {Object.keys(formDataToDisplay).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(formDataToDisplay).map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <span className="font-medium text-slate-900">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">Aucune information supplémentaire fournie.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Informations de traitement</h3>
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Date de soumission</span>
                                            <span className="font-bold text-slate-900">{demande.created_at}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Agent en charge</span>
                                            {demande.agent ? (
                                                <span className="font-bold text-slate-900">{demande.agent.prenom} {demande.agent.nom}</span>
                                            ) : (
                                                <span className="text-amber-600 font-medium italic">En attente d'assignation</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Dernière mise à jour</span>
                                            <span className="font-bold text-slate-900">{demande.updated_at || demande.created_at}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(demande.documents || []).length > 0 ? (
                                    demande.documents.map((doc) => {
                                        const isImage = doc.nom.toLowerCase().endsWith('.jpg') || doc.nom.toLowerCase().endsWith('.png');
                                        
                                        return (
                                            <div key={doc.id} className="flex flex-col p-4 border border-slate-200 rounded-xl hover:border-mairie-cyan hover:shadow-soft transition-colors bg-white relative group">
                                                <div className="flex items-start gap-4 mb-3">
                                                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                                                        {isImage && doc.url ? (
                                                            <img src={doc.url} alt={doc.nom} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pr-2">
                                                        <p className="font-bold text-slate-900 text-sm line-clamp-1">{doc.nom}</p>
                                                        <p className="text-xs text-slate-500">{doc.type} • {doc.date || doc.created_at}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {doc.valid === true && <CheckCircle className="h-5 w-5 text-emerald-500" title="Document validé" />}
                                                        {doc.valid === false && <AlertTriangle className="h-5 w-5 text-rose-500" title="Document rejeté" />}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-auto">
                                                    {isImage && doc.url && (
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-600 hover:text-mairie-blue uppercase tracking-widest bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                                            Voir
                                                        </a>
                                                    )}
                                                    <button className="text-xs font-bold text-mairie-blue uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                                                        <Download className="h-4 w-4 mr-1" /> Télécharger
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full p-8 text-center text-slate-500">
                                        Aucun document attaché à cette demande.
                                    </div>
                                )}
                            </div>
                            
                            {demande.statut === 'document_manquant' && (
                                <div className="mt-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-6 text-center">
                                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-amber-900 mb-2">Pièce complémentaire requise</h4>
                                    <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
                                        Veuillez fournir le document manquant pour valider votre dossier.
                                    </p>
                                    <div className="relative inline-block">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleUpload} />
                                        <button className="btn-primary bg-amber-500 hover:bg-amber-600 border-none">
                                            Sélectionner le fichier
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'historique' && (
                        <div className="animate-fade-in max-w-2xl mx-auto">
                            <div className="relative border-l-2 border-slate-200 ml-3 md:ml-0 space-y-8">
                                {demande.historique_statuts && demande.historique_statuts.length > 0 ? (
                                    demande.historique_statuts.map((event, index) => (
                                        <div key={index} className="relative pl-8 md:pl-8">
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
                                    <div className="p-8 text-center text-slate-500">
                                        Aucun historique disponible pour ce dossier.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px] animate-fade-in">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">Discussion avec l'agent</h3>
                                    <p className="text-xs text-slate-500">
                                        {demande.agent ? `${demande.agent.prenom} ${demande.agent.nom}` : "Aucun agent assigné"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 flex flex-col">
                                {(!demande.messages || demande.messages.length === 0) ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Aucun message. Commencez la discussion !</p>
                                    </div>
                                ) : (
                                    demande.messages.map((msg) => {
                                        const isCitoyen = msg.sender.role === 'citoyen';
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isCitoyen ? 'items-end' : 'items-start'}`}>
                                                <div className={`flex items-end gap-2 group ${isCitoyen ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`max-w-md rounded-2xl p-3 shadow-sm relative ${isCitoyen ? 'bg-mairie-blue text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isCitoyen ? 'text-blue-200' : 'text-slate-400'}`}>
                                                            {msg.created_at}
                                                            {msg.is_edited && <span className="italic">(modifié)</span>}
                                                        </p>
                                                    </div>
                                                    
                                                    {isCitoyen && (
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
                                        placeholder="Écrivez votre message..." 
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        disabled={sending || !demande.agent}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-primary shrink-0"
                                        disabled={sending || !messageContent.trim() || !demande.agent}
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
                                {!demande.agent && (
                                    <p className="text-xs text-amber-600 mt-2 text-center font-medium">
                                        Vous pourrez envoyer des messages dès qu'un agent prendra en charge votre dossier.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowDemande;
