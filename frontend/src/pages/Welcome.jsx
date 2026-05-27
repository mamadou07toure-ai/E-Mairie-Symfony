import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroMairie from '../assets/hero_mairie.jpg';
import { 
    ShieldCheck, Clock, Lock, Zap, Target, Heart, 
    FileText, MapPin, Users, Globe, Mail, Phone,
    ChevronRight
} from 'lucide-react';

export default function Welcome() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-mairie-cyan selection:text-white overflow-hidden relative">
            {/* Background Blur Elements */}
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-mairie-cyan/8 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-mairie-blue/6 blur-[120px]"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100/80 transition-luxury">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mairie-blue to-mairie-cyan flex items-center justify-center shadow-lg shadow-mairie-blue/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-mairie-blue to-mairie-cyan">e-Mairie</span>
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-mairie-blue transition-colors">Services</a>
                            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-mairie-blue transition-colors">À propos</a>
                            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-mairie-blue transition-colors">Contact</a>
                        </div>

                        {/* Auth Actions */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link 
                                    to={user.role === 'citoyen' ? '/citoyen/dashboard' : (user.role === 'agent' ? '/agent/dashboard' : '/admin/dashboard')}
                                    className="btn-primary"
                                >
                                    Mon Tableau de bord
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-mairie-blue transition-colors hidden sm:block">
                                        Connexion
                                    </Link>
                                    <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-mairie-blue to-mairie-cyan hover:shadow-lg hover:shadow-mairie-blue/20 transition-all hover:-translate-y-0.5">
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mairie-cyan/10 border border-mairie-cyan/20 text-mairie-cyan text-sm font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mairie-cyan opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mairie-cyan"></span>
                                </span>
                                Nouveau : Tous vos actes en ligne
                            </div>
                            
                            <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                                Votre Mairie, <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-mairie-blue to-mairie-cyan">
                                    Toujours avec vous.
                                </span>
                            </h1>
                            
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                                Simplifiez vos démarches administratives. Demandez vos actes d'état civil, certificats et autorisations directement depuis chez vous, en toute sécurité.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="px-8 py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-luxury flex items-center justify-center gap-2 hover:shadow-xl">
                                    Commencer maintenant <ChevronRight className="w-5 h-5" />
                                </Link>
                                <a href="#services" className="px-8 py-4 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-luxury text-center">
                                    Voir les services
                                </a>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute inset-0 bg-gradient-to-tr from-mairie-blue/10 to-mairie-cyan/10 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                            <div className="glass-panel p-2 rounded-[3rem] shadow-2xl">
                                <img 
                                    src={heroMairie} 
                                    alt="Mairie Digitale" 
                                    className="rounded-[2.5rem] w-full object-cover h-[600px]"
                                />
                            </div>
                            
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 glass-panel rounded-2xl p-4 flex items-center gap-4 animate-[bounce_3s_ease-in-out_infinite] shadow-xl">
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">JD</div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">SM</div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+2k</div>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">98% Satisfaction</p>
                                    <p className="text-xs text-slate-500">Citoyenne</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-slate-50 py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card-premium p-8 group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-mairie-blue mb-6 group-hover:scale-110 transition-transform">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Rapide</h3>
                                <p className="text-slate-600">Traitement de vos dossiers en moins de 48h. Suivez l'avancement en temps réel.</p>
                            </div>
                            <div className="card-premium p-8 group">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Lock className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Sécurisé</h3>
                                <p className="text-slate-600">Vos données sont cryptées et protégées à 100%. Hébergement souverain.</p>
                            </div>
                            <div className="card-premium p-8 group">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Efficace</h3>
                                <p className="text-slate-600">Plus besoin de vous déplacer, tout se fait en ligne depuis votre ordinateur ou mobile.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Administration" 
                                    className="rounded-[2.5rem] shadow-2xl transform -rotate-3 hover:rotate-0 transition-luxury duration-700"
                                />
                                <div className="absolute -bottom-8 -right-8 glass-panel dark p-6 rounded-3xl text-white shadow-2xl border border-white/10">
                                    <p className="text-4xl font-display font-black text-mairie-cyan mb-1">10+</p>
                                    <p className="font-medium text-sm text-slate-300">Années d'innovation<br/>au service public</p>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">
                                    Engagés pour une administration transparente et moderne.
                                </h2>
                                <p className="text-lg text-slate-600 mb-10">
                                    Notre mission est de rapprocher l'administration des citoyens en offrant des services numériques accessibles, intuitifs et performants.
                                </p>
                                
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-mairie-blue shrink-0">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Notre Mission</h4>
                                            <p className="text-slate-600">Dématérialiser 100% des démarches courantes pour vous faire gagner un temps précieux.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Notre Valeur</h4>
                                            <p className="text-slate-600">L'humain au centre du numérique. Un support réactif pour vous accompagner.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" className="bg-slate-50 py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Un accès complet aux services municipaux</h2>
                            <p className="text-lg text-slate-600">Sélectionnez la démarche que vous souhaitez accomplir. Inscription requise.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Acte de Naissance", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", hover: "group-hover:text-blue-600" },
                                { title: "Certificat de Résidence", icon: MapPin, color: "text-amber-600", bg: "bg-amber-50", hover: "group-hover:text-amber-600" },
                                { title: "Acte de Mariage", icon: Users, color: "text-rose-600", bg: "bg-rose-50", hover: "group-hover:text-rose-600" },
                                { title: "Permis de Construire", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50", hover: "group-hover:text-emerald-600" },
                                { title: "Légalisation", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50", hover: "group-hover:text-purple-600" },
                                { title: "Demande d'Audience", icon: Mail, color: "text-slate-600", bg: "bg-slate-200", hover: "group-hover:text-slate-900" }
                            ].map((service, idx) => {
                                const Icon = service.icon;
                                return (
                                    <Link key={idx} to="/register" className="card-premium p-6 group block hover:-translate-y-1 hover:shadow-2xl hover:shadow-mairie-blue/5 transition-all duration-300 relative overflow-hidden">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.bg} ${service.color} transition-colors`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className={`text-lg font-bold text-slate-900 mb-2 transition-colors ${service.hover}`}>{service.title}</h3>
                                        <p className="text-sm text-slate-500 mb-4">Demande en ligne sécurisée avec suivi de l'avancement.</p>
                                        <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-mairie-cyan transition-colors">
                                            Commencer <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        
                                        {/* Progress Bar Animation */}
                                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-mairie-blue to-mairie-cyan w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer id="contact" className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-white/10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-mairie-cyan/50 to-transparent"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mairie-blue to-mairie-cyan flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-display font-bold text-xl text-white">
                                    Smart e-Mairie
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                                La plateforme officielle de dématérialisation des services municipaux. 
                                Rapide, sécurisée et accessible à tous les citoyens.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Liens Rapides</h4>
                            <ul className="space-y-4">
                                <li><a href="#services" className="text-sm hover:text-mairie-cyan transition-colors">Nos Services</a></li>
                                <li><a href="#about" className="text-sm hover:text-mairie-cyan transition-colors">À propos</a></li>
                                <li><Link to="/login" className="text-sm hover:text-mairie-cyan transition-colors">Se connecter</Link></li>
                                <li><Link to="/register" className="text-sm hover:text-mairie-cyan transition-colors">Créer un compte</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Contact</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-mairie-cyan shrink-0" />
                                    <span className="text-sm">Numéro Vert: <br/>800 00 00 00</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-mairie-cyan shrink-0" />
                                    <span className="text-sm">contact@mairie.gn</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Smart e-Mairie. Tous droits réservés.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Mentions légales</a>
                            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Confidentialité</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
