import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, MapPin, Heart, FileCheck, X, RefreshCw, CheckCircle2, UploadCloud, Info, AlertCircle, Download, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';

const DEMANDE_TYPES = [
    {
        id: 'ACTE_NAISSANCE',
        title: 'Acte de naissance',
        icon: User,
        colorClass: 'text-blue-600 bg-blue-50',
        docs: ["Ancien Extrait de Naissance (Facultatif)"]
    },
    {
        id: 'CERTIFICAT_RESIDENCE',
        title: 'Certificat de résidence',
        icon: MapPin,
        colorClass: 'text-emerald-600 bg-emerald-50',
        docs: ["Justificatif de domicile", "Photo d'identité"]
    },
    {
        id: 'CERTIFICAT_MARIAGE',
        title: 'Certificat de mariage',
        icon: Heart,
        colorClass: 'text-rose-600 bg-rose-50',
        docs: ["Copie de l'acte de mariage original"]
    },
    {
        id: 'LEGALISATION_DOCUMENT',
        title: 'Légalisation de document',
        icon: FileCheck,
        colorClass: 'text-amber-600 bg-amber-50',
        docs: ["CNI", "Document original", "Copie du document"]
    }
];

const Create = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [selectedType, setSelectedType] = useState(null);
    const [data, setData] = useState({
        type_demande_id: '',
        priorite: 'normale',
        description: '',
        fields: {},
        documents: [],
        is_physical_pickup: false
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSelectType = (type) => {
        setSelectedType(type);
        setData({
            type_demande_id: type.id,
            priorite: 'normale',
            description: '',
            fields: { nombre_copies: 1 },
            documents: [],
            is_physical_pickup: false
        });
        setErrors({});
    };

    const handleCancelType = () => {
        setSelectedType(null);
        setData({
            type_demande_id: '',
            priorite: 'normale',
            description: '',
            fields: {},
            documents: [],
            is_physical_pickup: false
        });
        setErrors({});
    };

    const handleFieldChange = (key, value) => {
        setData(prev => ({
            ...prev,
            fields: { ...prev.fields, [key]: value }
        }));
        if (errors[`fields.${key}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`fields.${key}`];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        const newFiles = [];

        files.forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (validExtensions.includes(ext)) {
                newFiles.push(file);
            } else {
                toast.error(`Format non supporté : ${file.name}`);
            }
        });

        setData(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
    };

    const removeFile = (index) => {
        setData(prev => {
            const newDocs = [...prev.documents];
            newDocs.splice(index, 1);
            return { ...prev, documents: newDocs };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('type_demande_id', data.type_demande_id);
        formData.append('priorite', data.priorite);
        if (data.description) formData.append('description', data.description);
        formData.append('is_physical_pickup', data.is_physical_pickup ? '1' : '0');

        Object.keys(data.fields).forEach(key => {
            formData.append(`fields[${key}]`, data.fields[key]);
        });

        data.documents.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
        });

        try {
            await api.post('/demandes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Demande soumise avec succès !');
            navigate('/citoyen/demandes');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('Veuillez corriger les erreurs dans le formulaire.');
            } else {
                toast.error('Une erreur est survenue lors de la soumission.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const getInputClass = (fieldName) => {
        const hasError = errors[`fields.${fieldName}`];
        return `w-full px-4 py-3 rounded-xl border bg-slate-50 transition-all outline-none ${
            hasError 
            ? 'border-red-500 ring-4 ring-red-500/10' 
            : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
        }`;
    };

    const ErrorMsg = ({ fieldName }) => {
        const error = errors[`fields.${fieldName}`];
        if (!error) return null;
        return <p className="text-red-500 text-xs mt-1 font-medium">{error[0]}</p>;
    };

    const renderFormFields = () => {
        if (!selectedType) return null;

        if (selectedType.id === 'ACTE_NAISSANCE') {
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <User className="w-5 h-5 mr-2 text-slate-400" /> Identité du titulaire
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('nom')} value={data.fields.nom || ''} onChange={e => handleFieldChange('nom', e.target.value)} required />
                                <ErrorMsg fieldName="nom" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('prenom')} value={data.fields.prenom || ''} onChange={e => handleFieldChange('prenom', e.target.value)} required />
                                <ErrorMsg fieldName="prenom" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance <span className="text-red-500">*</span></label>
                                <input type="date" className={getInputClass('date_naissance')} value={data.fields.date_naissance || ''} onChange={e => handleFieldChange('date_naissance', e.target.value)} required />
                                <ErrorMsg fieldName="date_naissance" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('lieu_naissance')} value={data.fields.lieu_naissance || ''} onChange={e => handleFieldChange('lieu_naissance', e.target.value)} required />
                                <ErrorMsg fieldName="lieu_naissance" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Genre <span className="text-red-500">*</span></label>
                                <select className={getInputClass('genre')} value={data.fields.genre || ''} onChange={e => handleFieldChange('genre', e.target.value)} required>
                                    <option value="">Sélectionnez un genre</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                                <ErrorMsg fieldName="genre" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <Info className="w-5 h-5 mr-2 text-slate-400" /> Informations du Père
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                <input type="text" className={getInputClass('nom_pere')} value={data.fields.nom_pere || ''} onChange={e => handleFieldChange('nom_pere', e.target.value)} />
                                <ErrorMsg fieldName="nom_pere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s)</label>
                                <input type="text" className={getInputClass('prenom_pere')} value={data.fields.prenom_pere || ''} onChange={e => handleFieldChange('prenom_pere', e.target.value)} />
                                <ErrorMsg fieldName="prenom_pere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                                <input type="date" className={getInputClass('date_naissance_pere')} value={data.fields.date_naissance_pere || ''} onChange={e => handleFieldChange('date_naissance_pere', e.target.value)} />
                                <ErrorMsg fieldName="date_naissance_pere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
                                <input type="text" className={getInputClass('profession_pere')} value={data.fields.profession_pere || ''} onChange={e => handleFieldChange('profession_pere', e.target.value)} />
                                <ErrorMsg fieldName="profession_pere" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <Heart className="w-5 h-5 mr-2 text-slate-400" /> Informations de la Mère
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de naissance</label>
                                <input type="text" className={getInputClass('nom_mere')} value={data.fields.nom_mere || ''} onChange={e => handleFieldChange('nom_mere', e.target.value)} />
                                <ErrorMsg fieldName="nom_mere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s)</label>
                                <input type="text" className={getInputClass('prenom_mere')} value={data.fields.prenom_mere || ''} onChange={e => handleFieldChange('prenom_mere', e.target.value)} />
                                <ErrorMsg fieldName="prenom_mere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                                <input type="date" className={getInputClass('date_naissance_mere')} value={data.fields.date_naissance_mere || ''} onChange={e => handleFieldChange('date_naissance_mere', e.target.value)} />
                                <ErrorMsg fieldName="date_naissance_mere" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
                                <input type="text" className={getInputClass('profession_mere')} value={data.fields.profession_mere || ''} onChange={e => handleFieldChange('profession_mere', e.target.value)} />
                                <ErrorMsg fieldName="profession_mere" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-slate-400" /> Détails demande
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Motif de la demande <span className="text-red-500">*</span></label>
                            <select className={getInputClass('motif')} value={data.fields.motif || ''} onChange={e => handleFieldChange('motif', e.target.value)} required>
                                <option value="">Sélectionnez un motif</option>
                                <option value="Usage administratif">Usage administratif</option>
                                <option value="Mariage">Mariage</option>
                                <option value="Voyage">Voyage</option>
                                <option value="Autre">Autre</option>
                            </select>
                            <ErrorMsg fieldName="motif" />
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedType.id === 'CERTIFICAT_RESIDENCE') {
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <MapPin className="w-5 h-5 mr-2 text-slate-400" /> Identité & Domicile
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('nom')} value={data.fields.nom || ''} onChange={e => handleFieldChange('nom', e.target.value)} required />
                                <ErrorMsg fieldName="nom" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('prenom')} value={data.fields.prenom || ''} onChange={e => handleFieldChange('prenom', e.target.value)} required />
                                <ErrorMsg fieldName="prenom" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance <span className="text-red-500">*</span></label>
                                <input type="date" className={getInputClass('date_naissance')} value={data.fields.date_naissance || ''} onChange={e => handleFieldChange('date_naissance', e.target.value)} required />
                                <ErrorMsg fieldName="date_naissance" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('lieu_naissance')} value={data.fields.lieu_naissance || ''} onChange={e => handleFieldChange('lieu_naissance', e.target.value)} required />
                                <ErrorMsg fieldName="lieu_naissance" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse complète de résidence <span className="text-red-500">*</span></label>
                                <textarea rows="3" className={getInputClass('adresse')} value={data.fields.adresse || ''} onChange={e => handleFieldChange('adresse', e.target.value)} required></textarea>
                                <ErrorMsg fieldName="adresse" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <Info className="w-5 h-5 mr-2 text-slate-400" /> Détails
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
                                <input type="text" className={getInputClass('profession')} value={data.fields.profession || ''} onChange={e => handleFieldChange('profession', e.target.value)} />
                                <ErrorMsg fieldName="profession" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quartier / Commune <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('quartier')} value={data.fields.quartier || ''} onChange={e => handleFieldChange('quartier', e.target.value)} required />
                                <ErrorMsg fieldName="quartier" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Durée de résidence</label>
                                <input type="text" placeholder="Ex: 3 ans" className={getInputClass('duree_residence')} value={data.fields.duree_residence || ''} onChange={e => handleFieldChange('duree_residence', e.target.value)} />
                                <ErrorMsg fieldName="duree_residence" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Motif <span className="text-red-500">*</span></label>
                                <select className={getInputClass('motif')} value={data.fields.motif || ''} onChange={e => handleFieldChange('motif', e.target.value)} required>
                                    <option value="">Sélectionnez un motif</option>
                                    <option value="Emploi">Emploi</option>
                                    <option value="Banque">Banque</option>
                                    <option value="Scolarité">Scolarité</option>
                                    <option value="Voyage">Voyage</option>
                                    <option value="Autre">Autre</option>
                                </select>
                                <ErrorMsg fieldName="motif" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedType.id === 'CERTIFICAT_MARIAGE') {
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <User className="w-5 h-5 mr-2 text-blue-500" /> Identité de l'Époux
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('nom_epoux')} value={data.fields.nom_epoux || ''} onChange={e => handleFieldChange('nom_epoux', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('prenom_epoux')} value={data.fields.prenom_epoux || ''} onChange={e => handleFieldChange('prenom_epoux', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance <span className="text-red-500">*</span></label>
                                <input type="date" className={getInputClass('date_naissance_epoux')} value={data.fields.date_naissance_epoux || ''} onChange={e => handleFieldChange('date_naissance_epoux', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('lieu_naissance_epoux')} value={data.fields.lieu_naissance_epoux || ''} onChange={e => handleFieldChange('lieu_naissance_epoux', e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <Heart className="w-5 h-5 mr-2 text-red-500" /> Identité de l'Épouse
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de naissance <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('nom_epouse')} value={data.fields.nom_epouse || ''} onChange={e => handleFieldChange('nom_epouse', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('prenom_epouse')} value={data.fields.prenom_epouse || ''} onChange={e => handleFieldChange('prenom_epouse', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance <span className="text-red-500">*</span></label>
                                <input type="date" className={getInputClass('date_naissance_epouse')} value={data.fields.date_naissance_epouse || ''} onChange={e => handleFieldChange('date_naissance_epouse', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de naissance <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('lieu_naissance_epouse')} value={data.fields.lieu_naissance_epouse || ''} onChange={e => handleFieldChange('lieu_naissance_epouse', e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <FileCheck className="w-5 h-5 mr-2 text-slate-400" /> Informations sur l'Union
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date du mariage <span className="text-red-500">*</span></label>
                                <input type="date" className={getInputClass('date_mariage')} value={data.fields.date_mariage || ''} onChange={e => handleFieldChange('date_mariage', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu du mariage <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('lieu_mariage')} value={data.fields.lieu_mariage || ''} onChange={e => handleFieldChange('lieu_mariage', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro d'acte (si connu)</label>
                                <input type="text" className={getInputClass('numero_acte')} value={data.fields.numero_acte || ''} onChange={e => handleFieldChange('numero_acte', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Motif <span className="text-red-500">*</span></label>
                                <select className={getInputClass('motif')} value={data.fields.motif || ''} onChange={e => handleFieldChange('motif', e.target.value)} required>
                                    <option value="">Sélectionnez un motif</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Voyage">Voyage</option>
                                    <option value="Famille">Famille</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedType.id === 'LEGALISATION_DOCUMENT') {
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="flex items-center text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <FileCheck className="w-5 h-5 mr-2 text-slate-400" /> Titulaire & Document
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('nom')} value={data.fields.nom || ''} onChange={e => handleFieldChange('nom', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom(s) <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('prenom')} value={data.fields.prenom || ''} onChange={e => handleFieldChange('prenom', e.target.value)} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type de document à légaliser <span className="text-red-500">*</span></label>
                                <select className={getInputClass('type_document')} value={data.fields.type_document || ''} onChange={e => handleFieldChange('type_document', e.target.value)} required>
                                    <option value="">Sélectionnez un type</option>
                                    <option value="Acte notarié">Acte notarié</option>
                                    <option value="Contrat">Contrat</option>
                                    <option value="Diplôme">Diplôme</option>
                                    <option value="Procuration">Procuration</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description du document</label>
                                <textarea rows="3" className={getInputClass('description_doc')} value={data.fields.description_doc || ''} onChange={e => handleFieldChange('description_doc', e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Langue du document <span className="text-red-500">*</span></label>
                                <input type="text" className={getInputClass('langue')} value={data.fields.langue || ''} onChange={e => handleFieldChange('langue', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Pays de destination</label>
                                <input type="text" className={getInputClass('pays_destination')} value={data.fields.pays_destination || ''} onChange={e => handleFieldChange('pays_destination', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Usage prévu <span className="text-red-500">*</span></label>
                                <textarea rows="2" className={getInputClass('usage_prevu')} value={data.fields.usage_prevu || ''} onChange={e => handleFieldChange('usage_prevu', e.target.value)} required></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 mb-8">
                Nouvelle Demande
            </h1>

            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-red-800 font-bold">Erreur de validation</h4>
                        <p className="text-red-600 text-sm mt-1">Veuillez vérifier les champs en rouge dans le formulaire ci-dessous.</p>
                    </div>
                </div>
            )}

            {!selectedType ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {DEMANDE_TYPES.map(type => {
                        const Icon = type.icon;
                        return (
                            <div 
                                key={type.id}
                                onClick={() => handleSelectType(type)}
                                className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-indigo-500 group"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${type.colorClass}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{type.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">Pièces à fournir :</p>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {type.docs.map((doc, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="mr-2 text-indigo-400">•</span>
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-10 duration-500 space-y-8">
                    {/* Header Selection */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType.colorClass}`}>
                                <selectedType.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Type sélectionné</p>
                                <h2 className="text-xl font-bold text-slate-900">{selectedType.title}</h2>
                            </div>
                        </div>
                        <button type="button" onClick={handleCancelType} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dynamic Form */}
                    <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                        {renderFormFields()}

                        {/* Common Fields */}
                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de copies souhaitées <span className="text-red-500">*</span></label>
                                <input type="number" min="1" className={getInputClass('nombre_copies')} value={data.fields.nombre_copies || 1} onChange={e => handleFieldChange('nombre_copies', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observations / Précisions (optionnel)</label>
                                <textarea rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" value={data.description} onChange={e => setData(prev => ({...prev, description: e.target.value}))}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Documents requis</h3>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                            {selectedType.docs.map((doc, idx) => (
                                <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-full border border-slate-200">
                                    <span className="text-indigo-500 mr-2">À joindre:</span>{doc}
                                </span>
                            ))}
                        </div>

                        <div 
                            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                multiple 
                                accept=".pdf,.jpg,.jpeg,.png" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <UploadCloud className="w-16 h-16 text-indigo-300 mb-4" />
                            <p className="text-lg font-bold text-slate-700 mb-1">Cliquez ou glissez-déposez vos fichiers</p>
                            <p className="text-sm text-slate-500">PDF, JPG, PNG (Max 10Mo par fichier)</p>
                        </div>

                        {data.documents.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data.documents.map((file, idx) => {
                                    const isImage = file.type.startsWith('image/');
                                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                                    
                                    return (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative group flex flex-col">
                                            {/* Preview Area */}
                                            <div className="h-24 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden relative">
                                                {isImage ? (
                                                    <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                ) : (
                                                    <FileCheck className="w-10 h-10 text-slate-300" />
                                                )}
                                                
                                                {/* View full image button overlay */}
                                                {isImage && (
                                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold tracking-widest uppercase">
                                                        Voir
                                                    </a>
                                                )}
                                            </div>
                                            
                                            {/* Footer Area */}
                                            <div className="p-3 flex items-center justify-between bg-white">
                                                <div className="truncate pr-2 text-xs font-medium text-slate-700 flex-1">
                                                    {file.name}
                                                </div>
                                                <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Mode de Retrait */}
                    <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Mode de retrait souhaité</h3>
                        <p className="text-sm text-slate-500 mb-6">Choisissez comment vous souhaitez récupérer votre document officiel une fois validé.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setData(prev => ({...prev, is_physical_pickup: false}))}
                                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                                    !data.is_physical_pickup 
                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10' 
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                    !data.is_physical_pickup ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Download className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Téléchargement Numérique</h4>
                                <p className="text-xs text-slate-500">Téléchargez votre document officiel directement depuis votre espace citoyen. Rapide et disponible 24h/24.</p>
                                {!data.is_physical_pickup && (
                                    <div className="mt-3 flex items-center gap-1.5 text-indigo-600 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> Sélectionné
                                    </div>
                                )}
                            </div>
                            <div 
                                onClick={() => setData(prev => ({...prev, is_physical_pickup: true}))}
                                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                                    data.is_physical_pickup 
                                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                    data.is_physical_pickup ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Retrait Physique à la Mairie</h4>
                                <p className="text-xs text-slate-500">Récupérez la copie certifiée conforme, tamponnée et signée au guichet de la Mairie de Kaloum.</p>
                                {data.is_physical_pickup && (
                                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> Sélectionné
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-[2rem] hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed shadow-xl hover:shadow-indigo-500/30"
                    >
                        {processing ? (
                            <>
                                <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                Lancer la demande client
                                <CheckCircle2 className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:scale-125" />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Create;
