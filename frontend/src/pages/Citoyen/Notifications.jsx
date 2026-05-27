import { Bell } from 'lucide-react';

const Notifications = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-mairie-blue to-mairie-cyan rounded-2xl p-6 text-white shadow-premium">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Bell className="h-6 w-6" /> Mes Notifications
                </h2>
                <p className="text-blue-100 mt-1">Suivez l'activité de vos demandes.</p>
            </div>

            <div className="card-premium p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune notification</h3>
                <p className="text-slate-500 max-w-md">
                    Vous n'avez aucune nouvelle notification pour le moment.
                </p>
            </div>
        </div>
    );
};

export default Notifications;
