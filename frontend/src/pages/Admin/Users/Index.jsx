import { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, User, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('tous');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'agent', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch {
            toast.error('Impossible de charger les utilisateurs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggle = async (user) => {
        setTogglingId(user.id);
        try {
            const res = await api.post(`/admin/users/${user.id}/toggle`);
            toast.success(res.data.message);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, actif: res.data.actif } : u));
        } catch {
            toast.error("Erreur lors du changement de statut.");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ?`)) return;
        setDeletingId(user.id);
        try {
            await api.delete(`/admin/users/${user.id}`);
            toast.success('Utilisateur supprimé.');
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (e) {
            toast.error(e.response?.data?.message || "Erreur lors de la suppression.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});
        try {
            const res = await api.post('/admin/users', form);
            toast.success(res.data.message);
            setUsers(prev => [res.data.user, ...prev]);
            setShowModal(false);
            setForm({ nom: '', prenom: '', email: '', role: 'agent', password: '' });
        } catch (e) {
            const msg = e.response?.data?.message || 'Erreur lors de la création.';
            toast.error(msg);
            setFormErrors({ general: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (nom, prenom) => `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

    const getRoleBadge = (role) => {
        switch (role) {
            case 'administrateur':
                return <span className="px-2 py-1 bg-mairie-blue/10 text-mairie-blue rounded-md text-xs font-bold uppercase">Admin</span>;
            case 'agent':
                return <span className="px-2 py-1 bg-mairie-cyan/10 text-mairie-cyan rounded-md text-xs font-bold uppercase">Agent</span>;
            default:
                return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">Citoyen</span>;
        }
    };

    const filtered = users.filter(u => {
        const matchRole = roleFilter === 'tous' || u.role === roleFilter;
        const matchSearch = !searchTerm ||
            u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchRole && matchSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-mairie-blue to-mairie-cyan rounded-2xl p-6 text-white shadow-premium flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <User className="h-6 w-6" /> Gestion des Utilisateurs
                    </h2>
                    <p className="text-blue-100 mt-1">
                        {loading ? 'Chargement...' : `${users.length} utilisateur(s) inscrits sur la plateforme`}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-white text-mairie-blue hover:bg-slate-50 px-4 py-2 rounded-lg font-bold flex items-center shadow-soft transition-colors"
                >
                    <UserPlus className="h-5 w-5 mr-2" /> Nouvel utilisateur
                </button>
            </div>

            {/* Filters */}
            <div className="card-premium p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un nom, prénom ou email..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['tous', 'citoyen', 'agent', 'administrateur'].map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${
                                roleFilter === role
                                    ? 'bg-mairie-blue text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {role === 'tous' ? 'Tous' : role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inscription</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Chargement...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aucun utilisateur trouvé.</td></tr>
                            ) : filtered.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                                                {getInitials(user.nom, user.prenom)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-mairie-cyan transition-colors">
                                                    {user.prenom} {user.nom}
                                                </p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{getRoleBadge(user.role)}</td>
                                    <td className="p-4 text-sm text-slate-600">{user.created_at}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleToggle(user)}
                                            disabled={togglingId === user.id}
                                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors border disabled:opacity-50 ${
                                                user.actif
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            {togglingId === user.id
                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                : (user.actif ? 'Actif' : 'Inactif')
                                            }
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(user)}
                                                disabled={deletingId === user.id}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Supprimer"
                                            >
                                                {deletingId === user.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Trash2 className="h-4 w-4" />
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-premium w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-display font-bold text-xl text-slate-900">Créer un utilisateur</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {formErrors.general && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
                                    {formErrors.general}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input
                                        type="text" className="input-field" placeholder="TOURE" required
                                        value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                    <input
                                        type="text" className="input-field" placeholder="Ibrahima" required
                                        value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email" className="input-field" placeholder="agent@mairie.gn" required
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                                <select
                                    className="input-field" value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="agent">Agent (traitement des dossiers)</option>
                                    <option value="administrateur">Administrateur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe provisoire</label>
                                <input
                                    type="password" className="input-field" placeholder="••••••••" required minLength={8}
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary bg-white">
                                    Annuler
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                                    {submitting ? 'Création...' : 'Créer le compte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
