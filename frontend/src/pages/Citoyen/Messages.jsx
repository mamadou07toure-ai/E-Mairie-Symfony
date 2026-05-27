import { MessageSquare } from 'lucide-react';

const Messages = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-mairie-blue to-mairie-cyan rounded-2xl p-6 text-white shadow-premium">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" /> Ma Messagerie
                </h2>
                <p className="text-blue-100 mt-1">Communiquez avec les agents concernant vos dossiers.</p>
            </div>

            <div className="card-premium p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Module de messagerie en construction</h3>
                <p className="text-slate-500 max-w-md">
                    Bientôt, vous pourrez échanger directement avec les agents en charge de vos dossiers depuis cette interface.
                </p>
            </div>
        </div>
    );
};

export default Messages;
