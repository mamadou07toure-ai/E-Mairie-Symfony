import { useState, useEffect, useRef } from 'react';
import {
    FileImage, Upload, ToggleLeft, ToggleRight, Trash2, Save,
    Plus, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const VARIABLES = [
    { key: 'numero_dossier',  label: 'Numéro de dossier' },
    { key: 'date_depot',      label: 'Date de dépôt' },
    { key: 'date_validation', label: 'Date de validation' },
    { key: 'citoyen_prenom',  label: 'Prénom citoyen' },
    { key: 'citoyen_nom',     label: 'Nom citoyen' },
    { key: 'agent_prenom',    label: 'Prénom agent' },
    { key: 'agent_nom',       label: 'Nom agent' },
    { key: 'type_demande',    label: 'Type de demande' },
    { key: 'nom',             label: 'Nom (demandeur)' },
    { key: 'prenoms',         label: 'Prénoms (demandeur)' },
    { key: 'date_naissance',  label: 'Date de naissance' },
    { key: 'lieu_naissance',  label: 'Lieu de naissance' },
    { key: 'genre',           label: 'Genre' },
    { key: 'nom_pere',        label: 'Nom du père' },
    { key: 'prenom_pere',     label: 'Prénom du père' },
    { key: 'profession_pere', label: 'Profession du père' },
    { key: 'nom_mere',        label: 'Nom de la mère' },
    { key: 'prenom_mere',     label: 'Prénom de la mère' },
    { key: 'profession_mere', label: 'Profession de la mère' },
    { key: 'adresse_complete',label: 'Adresse complète' },
    { key: 'quartier_commune',label: 'Quartier / Commune' },
    { key: 'duree_residence', label: 'Durée de résidence' },
    { key: 'nom_epoux',       label: "Nom de l'époux" },
    { key: 'prenom_epoux',    label: "Prénom de l'époux" },
    { key: 'nom_epouse',      label: "Nom de l'épouse" },
    { key: 'prenom_epouse',   label: "Prénom de l'épouse" },
    { key: 'date_mariage',    label: 'Date de mariage' },
    { key: 'lieu_mariage',    label: 'Lieu de mariage' },
    { key: 'motif',           label: 'Motif' },
    { key: 'nombre_copies',   label: 'Nombre de copies' },
];

// Construit l'URL relative — Vite proxie /uploads → http://localhost:8000/uploads
const buildImageUrl = (cheminImage) =>
    cheminImage ? `/uploads/templates/${cheminImage.split('/').pop()}` : null;

export default function DocumentTemplates() {
    const [items, setItems]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selected, setSelected]         = useState(null);
    const [uploadNom, setUploadNom]       = useState('');
    const [uploadFile, setUploadFile]     = useState(null);
    const [uploading, setUploading]       = useState(false);
    const [saving, setSaving]             = useState(false);
    const [toggling, setToggling]         = useState(false);
    const [deleting, setDeleting]         = useState(false);
    const [champs, setChamps]             = useState([]);
    const [pendingPos, setPendingPos]     = useState(null);
    const [pendingKey, setPendingKey]     = useState('');
    const [pendingLabel, setPendingLabel] = useState('');
    const [pendingSize, setPendingSize]   = useState(12);
    const [pendingBold, setPendingBold]   = useState(false);
    const [pendingColor, setPendingColor] = useState('#000000');
    const imgRef      = useRef(null);
    const containerRef = useRef(null);

    // Retourne les données fraîches pour que les handlers puissent les utiliser directement
    const fetchTemplates = async () => {
        try {
            const res = await api.get('/admin/document-templates');
            const data = res.data.data ?? [];
            setItems(data);
            return data;
        } catch {
            toast.error('Impossible de charger les modèles.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Rafraîchit l'item sélectionné depuis des données fraîches (évite le stale state)
    const syncSelected = (freshData, currentSelected) => {
        if (!currentSelected) return;
        const refreshed = freshData.find(i => i.type_demande.id === currentSelected.type_demande.id);
        if (refreshed) {
            setSelected(refreshed);
            setChamps(refreshed.template?.champs ?? []);
        }
    };

    const selectType = (item) => {
        setSelected(item);
        setChamps(item.template?.champs ?? []);
        setUploadNom('');
        setUploadFile(null);
        setPendingPos(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadNom.trim()) {
            toast.warning('Nom et image requis.');
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('type_demande_id', selected.type_demande.id);
            fd.append('nom', uploadNom.trim());
            fd.append('image', uploadFile);
            const res = await api.post('/admin/document-templates', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data.message);
            setUploadNom('');
            setUploadFile(null);
            const fresh = await fetchTemplates();
            syncSelected(fresh, selected);
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Erreur lors de l'upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleContainerClick = (e) => {
        if (!selected?.template) return;
        // Ignore clicks on champ delete buttons (they stop propagation)
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        // Ignore clicks outside image bounds
        if (x < 0 || x > 100 || y < 0 || y > 100) return;
        setPendingPos({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
        setPendingKey('');
        setPendingLabel('');
        setPendingSize(12);
        setPendingBold(false);
        setPendingColor('#000000');
    };

    const handleAddChamp = () => {
        if (!pendingKey) { toast.warning('Choisissez une variable.'); return; }
        const variable = VARIABLES.find(v => v.key === pendingKey);
        setChamps(prev => [...prev, {
            key:       pendingKey,
            label:     pendingLabel || variable?.label || pendingKey,
            x:         pendingPos.x,
            y:         pendingPos.y,
            font_size: pendingSize,
            bold:      pendingBold,
            color:     pendingColor,
        }]);
        setPendingPos(null);
    };

    const handleRemoveChamp = (idx) => {
        setChamps(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSaveChamps = async () => {
        if (!selected?.template) return;
        setSaving(true);
        try {
            const res = await api.put(`/admin/document-templates/${selected.template.id}/champs`, { champs });
            toast.success(res.data.message);
            const fresh = await fetchTemplates();
            syncSelected(fresh, selected);
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        if (!selected?.template) return;
        setToggling(true);
        try {
            const res = await api.patch(`/admin/document-templates/${selected.template.id}/toggle`);
            toast.success(res.data.message);
            const fresh = await fetchTemplates();
            syncSelected(fresh, selected);
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Erreur.');
        } finally {
            setToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!selected?.template) return;
        if (!window.confirm('Supprimer ce modèle ? Cette action est irréversible.')) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/document-templates/${selected.template.id}`);
            toast.success('Modèle supprimé.');
            setChamps([]);
            const fresh = await fetchTemplates();
            // Restore selected without template
            const refreshed = fresh.find(i => i.type_demande.id === selected.type_demande.id);
            if (refreshed) setSelected(refreshed);
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Erreur.');
        } finally {
            setDeleting(false);
        }
    };

    const templateImageUrl = buildImageUrl(selected?.template?.chemin_image);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-slate-900">Modèles de Documents Officiels</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Associez un modèle image à chaque type de demande et positionnez les champs de données.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Gauche : liste des types ── */}
                <div className="lg:col-span-1 space-y-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Types de demandes</h2>
                    {loading ? (
                        <p className="text-slate-400 italic text-sm">Chargement...</p>
                    ) : items.map((item) => (
                        <button
                            key={item.type_demande.id}
                            onClick={() => selectType(item)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                selected?.type_demande.id === item.type_demande.id
                                    ? 'border-mairie-blue bg-blue-50 shadow-soft'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <FileImage className="h-5 w-5 text-slate-400 shrink-0" />
                                <span className="text-sm font-medium text-slate-800 truncate">{item.type_demande.libelle}</span>
                            </div>
                            {item.template?.actif ? (
                                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                    <CheckCircle className="h-3 w-3" /> Actif
                                </span>
                            ) : item.template ? (
                                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">
                                    <AlertCircle className="h-3 w-3" /> Inactif
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* ── Droite : éditeur ── */}
                <div className="lg:col-span-2 space-y-6">
                    {!selected ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                            <FileImage className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Sélectionnez un type de demande</p>
                        </div>
                    ) : (
                        <>
                            {/* Formulaire d'upload */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <h3 className="font-bold text-slate-900 mb-4">
                                    {selected.template ? 'Remplacer le modèle' : 'Uploader un modèle'} — {selected.type_demande.libelle}
                                </h3>
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom du modèle</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="Ex : Acte de Naissance 2026"
                                            value={uploadNom}
                                            onChange={e => setUploadNom(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Image du modèle (JPG/PNG, max 10 Mo)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-mairie-blue hover:file:bg-blue-100 cursor-pointer"
                                            onChange={e => setUploadFile(e.target.files[0] ?? null)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uploading || !uploadFile || !uploadNom.trim()}
                                        className="btn-primary disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {uploading ? 'Envoi en cours...' : selected.template ? 'Remplacer' : 'Uploader'}
                                    </button>
                                </form>
                            </div>

                            {/* Éditeur (visible seulement si un template existe) */}
                            {selected.template && (
                                <>
                                    {/* Barre d'actions */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={handleToggle}
                                            disabled={toggling}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                                                selected.template.actif
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {selected.template.actif
                                                ? <><ToggleRight className="h-4 w-4" /> Actif</>
                                                : <><ToggleLeft className="h-4 w-4" /> Inactif</>}
                                        </button>

                                        <button
                                            onClick={handleSaveChamps}
                                            disabled={saving}
                                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            {saving ? 'Sauvegarde...' : 'Sauvegarder les champs'}
                                        </button>

                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deleting ? 'Suppression...' : 'Supprimer'}
                                        </button>
                                    </div>

                                    {/* Image cliquable + champs superposés */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                        <p className="text-xs text-slate-500 mb-3 font-medium">
                                            <span className="font-bold text-blue-600">Cliquez sur l'image</span> pour placer un champ. Survolez un label bleu pour le supprimer.
                                        </p>
                                        <div
                                            ref={containerRef}
                                            className="relative w-full border-2 border-dashed border-blue-200 rounded-xl overflow-hidden"
                                            style={{ cursor: 'crosshair', minHeight: '120px' }}
                                            onClick={handleContainerClick}
                                        >
                                            <img
                                                ref={imgRef}
                                                src={templateImageUrl}
                                                alt="Modèle de document"
                                                className="w-full h-auto select-none block"
                                                draggable={false}
                                            />
                                            {/* Champs superposés — cliquables avec bouton × au survol */}
                                            {champs.map((champ, idx) => (
                                                <div
                                                    key={idx}
                                                    className="absolute group"
                                                    style={{
                                                        left: `${champ.x}%`,
                                                        top: `${champ.y}%`,
                                                        transform: 'translateY(-50%)',
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <span
                                                        className="inline-flex items-center gap-1 select-none whitespace-nowrap"
                                                        style={{
                                                            fontSize: `${champ.font_size}px`,
                                                            fontWeight: champ.bold ? 'bold' : 'normal',
                                                            color: '#2563eb',
                                                            background: 'rgba(219,234,254,0.85)',
                                                            padding: '1px 4px',
                                                            borderRadius: 3,
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {champ.label}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        title="Supprimer ce champ"
                                                        onClick={e => { e.stopPropagation(); handleRemoveChamp(idx); }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Panneau de placement */}
                                        {pendingPos && (
                                            <div className="mt-4 border border-blue-200 rounded-xl bg-blue-50 p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-blue-900">
                                                        Nouveau champ — {pendingPos.x.toFixed(1)}% / {pendingPos.y.toFixed(1)}%
                                                    </p>
                                                    <button onClick={() => setPendingPos(null)} className="text-slate-400 hover:text-slate-600">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Variable</label>
                                                        <select
                                                            className="input-field w-full text-sm"
                                                            value={pendingKey}
                                                            onChange={e => {
                                                                setPendingKey(e.target.value);
                                                                const v = VARIABLES.find(v => v.key === e.target.value);
                                                                if (v) setPendingLabel(v.label);
                                                            }}
                                                        >
                                                            <option value="">— choisir —</option>
                                                            {VARIABLES.map(v => (
                                                                <option key={v.key} value={v.key}>{v.label} ({v.key})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Étiquette affichée</label>
                                                        <input
                                                            type="text"
                                                            className="input-field w-full text-sm"
                                                            value={pendingLabel}
                                                            onChange={e => setPendingLabel(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Taille (pt)</label>
                                                        <input
                                                            type="number"
                                                            min={6} max={72}
                                                            className="input-field w-full text-sm"
                                                            value={pendingSize}
                                                            onChange={e => setPendingSize(parseInt(e.target.value) || 12)}
                                                        />
                                                    </div>
                                                    <div className="flex items-end gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-1">Couleur</label>
                                                            <input
                                                                type="color"
                                                                className="h-9 w-16 rounded-lg border border-slate-200 cursor-pointer"
                                                                value={pendingColor}
                                                                onChange={e => setPendingColor(e.target.value)}
                                                            />
                                                        </div>
                                                        <label className="flex items-center gap-2 cursor-pointer mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded"
                                                                checked={pendingBold}
                                                                onChange={e => setPendingBold(e.target.checked)}
                                                            />
                                                            <span className="text-xs font-bold text-slate-600">Gras</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleAddChamp}
                                                    className="btn-primary flex items-center gap-2 text-sm"
                                                >
                                                    <Plus className="h-4 w-4" /> Ajouter le champ
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Liste des champs placés */}
                                    {champs.length > 0 && (
                                        <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                            <h4 className="font-bold text-slate-800 mb-3 text-sm">
                                                Champs placés ({champs.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {champs.map((champ, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span
                                                                className="inline-block w-3 h-3 rounded-full shrink-0 border border-slate-300"
                                                                style={{ background: champ.color }}
                                                            />
                                                            <span className="text-xs font-bold text-slate-700 truncate">
                                                                {champ.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                                                ({champ.key}) — {champ.x.toFixed(1)}% / {champ.y.toFixed(1)}% — {champ.font_size}pt{champ.bold ? ' · Gras' : ''}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveChamp(idx)}
                                                            className="shrink-0 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Supprimer ce champ"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
