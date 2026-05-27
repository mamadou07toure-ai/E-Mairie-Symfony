import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, FileText, BarChart3, 
    Settings, Bell, Shield, LogOut, Menu, X 
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Utilisateurs', href: '/admin/users', icon: Users },
        { name: 'Dossiers', href: '/admin/demandes', icon: FileText },
        { name: 'Statistiques', href: '/admin/stats', icon: BarChart3 },
        { name: 'Paramètres système', href: '/admin/settings', icon: Settings },
    ];

    const getInitials = (nom, prenom) => {
        return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-mairie-bg flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900/80 fixed h-full z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Shield className="h-8 w-8 text-mairie-cyan" />
                    <span className="ml-3 font-display font-bold text-white text-lg">Smart e-Mairie</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-mairie-blue text-white">ADMIN</span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-luxury group ${
                                    isActive 
                                    ? 'bg-gradient-to-r from-mairie-blue to-mairie-cyan/80 text-white shadow-soft translate-x-1' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-1'
                                }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-mairie-cyan to-mairie-blue p-0.5">
                            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                                {getInitials(user?.nom, user?.prenom)}
                            </div>
                        </div>
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium text-white truncate">{user?.prenom} {user?.nom}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-luxury">
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-30">
                <div className="flex items-center">
                    <Shield className="h-6 w-6 text-mairie-cyan" />
                    <span className="ml-2 font-display font-bold text-white">Smart e-Mairie</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
                <header className="h-16 glass-panel-dark md:bg-white/70 md:backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-xl font-display font-bold text-slate-900">
                        {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Administration'}
                    </h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-700 uppercase">Opérationnel</span>
                    </div>
                </header>
                
                <div className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
