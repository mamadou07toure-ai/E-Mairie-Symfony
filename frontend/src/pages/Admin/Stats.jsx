import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Clock, AlertOctagon } from 'lucide-react';

const AdminStats = () => {
    const dataType = [
        { name: 'Jan', ActeNaissance: 400, CertificatResidence: 240, ActeMariage: 150 },
        { name: 'Fev', ActeNaissance: 300, CertificatResidence: 139, ActeMariage: 220 },
        { name: 'Mar', ActeNaissance: 500, CertificatResidence: 380, ActeMariage: 120 },
        { name: 'Avr', ActeNaissance: 278, CertificatResidence: 390, ActeMariage: 200 },
        { name: 'Mai', ActeNaissance: 489, CertificatResidence: 480, ActeMariage: 218 },
    ];

    const kpisExtra = [
        { label: 'Délai moyen de traitement', value: '1.8 jours', icon: Clock, color: 'text-mairie-blue', bg: 'bg-blue-50' },
        { label: 'Dossiers en retard (SLA dépassé)', value: '12', icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Taux de satisfaction (estimé)', value: '92%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Rapports et Statistiques</h2>
                    <p className="text-slate-500">Analysez les performances et générez des rapports PDF/Excel.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"><Download className="h-4 w-4 mr-2" /> Export Excel</button>
                    <button className="btn-secondary bg-white text-rose-600 border-rose-200 hover:bg-rose-50"><Download className="h-4 w-4 mr-2" /> Export PDF</button>
                </div>
            </div>

            {/* Extra KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpisExtra.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="card-premium p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${kpi.bg}`}>
                                <Icon className={`h-6 w-6 ${kpi.color}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Volume par Type de Demande (Année en cours)</h3>
                <div style={{ width: '100%', height: 384 }}>
                    <ResponsiveContainer width="100%" height={384}>
                        <BarChart
                            data={dataType}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                            <Legend iconType="circle" />
                            <Bar dataKey="ActeNaissance" name="Acte de Naissance" fill="#0F2D6B" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="CertificatResidence" name="Certificat de Résidence" fill="#00B4D8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ActeMariage" name="Acte de Mariage" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
