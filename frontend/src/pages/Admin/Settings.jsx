import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Server, Cloud, ShieldAlert, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [systemSettings, setSystemSettings] = useState({
        two_factor: true,
        cloud_backup: false,
        maintenance: false,
        mairie_nom: 'Mairie de Conakry',
        mairie_email: 'contact@mairie-conakry.gn'
    });

    const handleSaveProfile = (e) => {
        e.preventDefault();
        toast.success("Profil mis à jour");
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        toast.success("Mot de passe mis à jour");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const handleToggleSystem = (key) => {
        setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success("Paramètre système mis à jour");
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h2 className="text-2xl font-display font-bold text-slate-900">Paramètres et Profil</h2>
                <p className="text-slate-500">Gérez vos informations personnelles et les paramètres du système.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Profil */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><User className="mr-2 h-5 w-5 text-mairie-blue" /> Informations du Profil</h3>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input type="text" className="input-field" value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                    <input type="text" className="input-field" value={profile.prenom} onChange={e => setProfile({...profile, prenom: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                <input type="tel" className="input-field" value={profile.telephone} onChange={e => setProfile({...profile, telephone: e.target.value})} />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="btn-primary w-full"><Save className="mr-2 h-4 w-4" /> Enregistrer le profil</button>
                            </div>
                        </form>
                    </div>

                    {/* Sécurité */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><Lock className="mr-2 h-5 w-5 text-mairie-cyan" /> Sécurité</h3>
                        <form onSubmit={handleSavePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
                                <input type="password" required className="input-field" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                                <input type="password" required className="input-field" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer nouveau mot de passe</label>
                                <input type="password" required className="input-field" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="btn-secondary w-full">Mettre à jour le mot de passe</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Système (Admin only) */}
                <div className="card-premium p-6 h-fit bg-slate-900 text-white border-none">
                    <h3 className="text-lg font-bold mb-6 flex items-center"><Server className="mr-2 h-5 w-5 text-emerald-400" /> Paramètres Système Globaux</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold">Authentification à deux facteurs (2FA)</p>
                                    <p className="text-sm text-slate-400">Forcer le 2FA pour tous les agents</p>
                                </div>
                                <button onClick={() => handleToggleSystem('two_factor')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.two_factor ? 'bg-mairie-cyan' : 'bg-slate-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.two_factor ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold flex items-center gap-2"><Cloud className="h-4 w-4" /> Sauvegarde Cloud Automatique</p>
                                    <p className="text-sm text-slate-400">Sauvegarde journalière de la base de données</p>
                                </div>
                                <button onClick={() => handleToggleSystem('cloud_backup')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.cloud_backup ? 'bg-mairie-cyan' : 'bg-slate-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.cloud_backup ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold flex items-center gap-2 text-rose-400"><ShieldAlert className="h-4 w-4" /> Mode Maintenance</p>
                                    <p className="text-sm text-slate-400">Bloquer l'accès aux citoyens (API offline)</p>
                                </div>
                                <button onClick={() => handleToggleSystem('maintenance')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.maintenance ? 'bg-rose-500' : 'bg-slate-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nom de la Mairie</label>
                                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-mairie-cyan" value={systemSettings.mairie_nom} onChange={(e) => setSystemSettings({...systemSettings, mairie_nom: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email de contact officiel</label>
                                <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-mairie-cyan" value={systemSettings.mairie_email} onChange={(e) => setSystemSettings({...systemSettings, mairie_email: e.target.value})} />
                            </div>
                            <button onClick={() => toast.success("Configuration système enregistrée")} className="btn-primary w-full bg-mairie-cyan hover:bg-mairie-cyan-light text-slate-900 border-none">
                                Appliquer les modifications système
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
