import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Mail, Lock, ChevronLeft, ShieldCheck, 
    ArrowRight, CheckCircle2, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [data, setData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Simulated delay for UI
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Actual auth context call
            const loggedUser = await login(data.email, data.password);
            
            if (!loggedUser) {
                setLoading(false);
                return; // Error toast is already handled in AuthContext
            }
            
            // Redirect based on role
            if (loggedUser.role === 'administrateur') {
                navigate('/admin/dashboard');
            } else if (loggedUser.role === 'agent') {
                navigate('/agent/dashboard');
            } else {
                navigate('/citoyen/dashboard');
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white selection:bg-indigo-500 selection:text-white">
            {/* Left Column - Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-5/12 bg-slate-900 relative overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                        alt="Mairie Background" 
                        className="w-full h-full object-cover opacity-40 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 to-indigo-600/70 mix-blend-multiply"></div>
                </div>

                {/* Decorative Blurred Circles */}
                <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none z-0"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0"></div>

                {/* Content */}
                <div className="relative z-10 p-12 flex flex-col h-full justify-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold mb-8 backdrop-blur-md shadow-lg">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Accès Citoyen Sécurisé
                        </div>

                        <h1 className="text-4xl xl:text-5xl font-display font-black text-white leading-tight mb-6">
                            Le service public, <br /> en un clic.
                        </h1>
                        <p className="text-lg text-indigo-100/80 mb-12 max-w-md leading-relaxed font-medium">
                            Reprenez vos démarches là où vous les avez laissées. Accédez à vos documents et communiquez directement avec votre mairie.
                        </p>

                        <div className="space-y-5">
                            {[
                                "Signature électronique certifiée",
                                "Archivage à valeur probante",
                                "Suivi de traitement instantané"
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    </div>
                                    <span className="text-indigo-50 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Left */}
                <div className="relative z-10 p-12 mt-auto">
                    <p className="text-sm text-indigo-200/60 font-medium">
                        &copy; {new Date().getFullYear()} Mairie Digitale. Plateforme sécurisée.
                    </p>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 bg-white relative z-10 shadow-2xl lg:shadow-[-20px_0_40px_rgba(0,0,0,0.1)] lg:rounded-l-3xl">
                
                {/* Back to Home */}
                <div className="absolute top-8 left-8 sm:left-12 lg:left-24">
                    <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Retour à l'accueil
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
                    {/* Form Header */}
                    <div className="text-center sm:text-left mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto sm:mx-0 mb-6">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Bon retour parmi nous</h2>
                        <p className="text-slate-500 mt-2 font-medium">Simplifier l'administration pour chaque citoyen.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Identifiant / Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        type="email" 
                                        required 
                                        value={data.email}
                                        onChange={(e) => setData({...data, email: e.target.value})}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none" 
                                        placeholder="citoyen@mairie.gn" 
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5 px-1">
                                    <label className="block text-sm font-bold text-slate-700">Mot de passe</label>
                                    <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Oublié ?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        type="password" 
                                        required 
                                        value={data.password}
                                        onChange={(e) => setData({...data, password: e.target.value})}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none" 
                                        placeholder="••••••••" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={data.remember}
                                        onChange={(e) => setData({...data, remember: e.target.checked})}
                                        className="peer sr-only" 
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded bg-slate-50 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors group-hover:border-indigo-400"></div>
                                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                </div>
                                <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Rester connecté</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-base transition-all hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connexion...' : 'Accéder à mon espace'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Info Block */}
                    <div className="mt-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-indigo-900/80 leading-relaxed">
                            <strong className="text-indigo-900 block mb-0.5">Disponibilité</strong>
                            Services accessibles 24h/24 et 7j/7 pour toutes vos démarches courantes.
                        </p>
                    </div>

                    {/* Footer Form */}
                    <div className="mt-8 text-center sm:text-left border-t border-slate-100 pt-8">
                        <p className="text-slate-500 font-medium">
                            Nouveau sur la plateforme ?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
