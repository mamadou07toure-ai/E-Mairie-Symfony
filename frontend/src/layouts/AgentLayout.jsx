import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, FileText, CheckSquare, MessageSquare, 
    Bell, Settings, LogOut, Menu, X, ShieldCheck
} from 'lucide-react';

const AgentLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Tableau de bord', href: '/agent/dashboard', icon: LayoutDashboard },
        { name: 'Tous les dossiers', href: '/agent/demandes', icon: FileText },
        { name: 'Mes assignations', href: '/agent/assignations', icon: CheckSquare },
    ];

    const getInitials = (nom, prenom) => {
        return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-mairie-bg flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900/80 fixed h-full z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <ShieldCheck className="h-8 w-8 text-mairie-cyan" />
                    <span className="ml-3 font-display font-bold text-white text-lg">Smart e-Mairie</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">AGENT</span>
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
                                    ? 'bg-gradient-to-r from-slate-800 to-mairie-cyan/40 text-white shadow-soft translate-x-1 border-l-2 border-mairie-cyan' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-1'
                                }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-mairie-cyan' : 'text-slate-500 group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-mairie-cyan p-0.5">
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

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
                <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-xl font-display font-bold text-slate-900">
                        {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Espace Agent'}
                    </h1>
                </header>
                
                <div className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AgentLayout;
