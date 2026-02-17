
import React, { useState } from 'react';
import {
    Database, Server, Users, DollarSign, Activity,
    Search, Filter, MoreHorizontal, ShieldCheck, Lock,
    LogOut, Plus, AlertCircle, Sun, Moon
} from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { ViewMode } from '../types';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';


interface SuperAdminProps {
    view: ViewMode;
    onNavigate: (view: ViewMode) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// Mocks removed and replaced by real database data


// KPI state managed inside the component now


export const SuperAdminPanel: React.FC<SuperAdminProps> = ({ view, onNavigate, isDarkMode, toggleTheme }) => {
    const { getSaaSMetrics, getTenantsList } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'database' | 'logs'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saasMetrics, setSaasMetrics] = useState<any>(null);
    const [realTenants, setRealTenants] = useState<any[]>([]);

    React.useEffect(() => {
        const loadAdminData = async () => {
            setLoading(true);
            try {
                const [metrics, tenants] = await Promise.all([
                    getSaaSMetrics(),
                    getTenantsList()
                ]);
                setSaasMetrics(metrics);
                setRealTenants(tenants);
            } catch (error) {
                console.error('Failed to load admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (view === ViewMode.ADMIN_DASHBOARD) {
            loadAdminData();
        }
    }, [view, getSaaSMetrics, getTenantsList]);


    // -- ADMIN LOGIN SCREEN --
    if (view === ViewMode.ADMIN_LOGIN) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Database size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Console</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Acesso restrito a desenvolvedores e administradores.</p>
                    </div>

                    <Card className="bg-white dark:bg-[#1A1D26] border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Admin ID</label>
                                <input
                                    className="w-full h-11 bg-gray-50 dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="admin@root.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Access Key</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full h-11 bg-gray-50 dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 pl-10"
                                        placeholder="••••••••••••"
                                    />
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none shadow-md shadow-blue-600/20" onClick={() => onNavigate(ViewMode.ADMIN_DASHBOARD)}>
                            <ShieldCheck size={18} /> Autenticar
                        </Button>
                    </Card>

                    <div className="flex justify-between items-center px-2">
                        <button onClick={() => onNavigate(ViewMode.LOGIN)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            Voltar para App do Cliente
                        </button>
                        <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // -- MAIN DASHBOARD --
    const filteredTenants = realTenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-gray-200 font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-300">

            {/* SIDEBAR */}
            <aside className="w-full md:w-64 bg-white dark:bg-[#151820] border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col h-full z-20 transition-colors duration-300">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Database size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white tracking-wide">Admin<span className="text-blue-600 dark:text-blue-500">.DB</span></span>
                </div>

                <div className="p-4 space-y-1 flex-1">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: Activity },
                        { id: 'tenants', label: 'Inquilinos (SaaS)', icon: Server },
                        { id: 'database', label: 'Dados Brutos', icon: Database },
                        { id: 'logs', label: 'Logs & Erros', icon: AlertCircle },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-[#0F1117] p-3 rounded-lg border border-gray-200 dark:border-gray-800 mb-4">
                        <div className="text-xs text-gray-500 mb-1">Status da API</div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">ONLINE (24ms)</span>
                        </div>
                    </div>
                    <button onClick={() => onNavigate(ViewMode.LOGIN)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors">
                        <LogOut size={16} /> Sair do Admin
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[#0F1117] transition-colors duration-300">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white/80 dark:bg-[#151820]/50 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeTab === 'overview' ? 'Dashboard Global' : activeTab === 'tenants' ? 'Gestão de Inquilinos' : 'Banco de Dados'}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-[#1A1D26] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
                            <Users size={12} />
                            <span>Admin: <strong>DevMaster</strong></span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Faturamento Total', value: `R$ ${saasMetrics?.mrr || 0}`, icon: DollarSign, color: 'text-emerald-500 dark:text-emerald-400' },
                                    { label: 'Total de Inquilinos', value: saasMetrics?.tenants || 0, icon: Server, color: 'text-blue-500 dark:text-blue-400' },
                                    { label: 'Usuários Totais', value: saasMetrics?.users || 0, icon: Users, color: 'text-purple-500 dark:text-purple-400' },
                                    { label: 'Churn Rate', value: saasMetrics?.churn || '0%', icon: Activity, color: 'text-red-500 dark:text-red-400' },
                                ].map((kpi, idx) => (
                                    <div key={idx} className="bg-white dark:bg-[#1A1D26] border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                                            <kpi.icon size={16} className={kpi.color} />
                                        </div>
                                        {loading ? (
                                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                        ) : (
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
                                        )}
                                    </div>
                                ))}
                            </div>


                            {/* Recent Activity Mock Graph */}
                            <div className="bg-white dark:bg-[#1A1D26] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-6">Atividade do Servidor (Requests/min)</h3>
                                <div className="h-48 flex items-end justify-between gap-1">
                                    {[...Array(40)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-600/20 dark:hover:bg-blue-600/40 transition-colors rounded-t-sm"
                                            style={{ height: `${Math.random() * 100}%` }}
                                        ></div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                                    <span>00:00</span>
                                    <span>12:00</span>
                                    <span>23:59</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TENANTS (DATA GRID) TAB --- */}
                    {activeTab === 'tenants' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-[#1A1D26] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                    <input
                                        className="w-full md:w-80 h-10 pl-9 pr-4 bg-gray-50 dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Buscar por ID, nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="h-10 px-4 bg-gray-50 dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                        <Filter size={16} /> Filtros
                                    </button>
                                    <button className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20">
                                        <Plus size={16} /> Novo Inquilino
                                    </button>
                                </div>
                            </div>

                            {/* The "Database" Grid */}
                            <div className="bg-white dark:bg-[#1A1D26] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-[#151820] border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                                                <th className="p-4 w-24">ID</th>
                                                <th className="p-4">Business Name</th>
                                                <th className="p-4">Owner / Email</th>
                                                <th className="p-4">Plan</th>
                                                <th className="p-4 text-right">MRR</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Version</th>
                                                <th className="p-4 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                            {filteredTenants.map((tenant) => (
                                                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-[#20242F] transition-colors group">
                                                    <td className="p-4 font-mono text-xs text-gray-500">{tenant.id}</td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                                                        <div className="text-xs text-gray-500">Created: 24 Oct 2023</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-gray-700 dark:text-gray-300">{tenant.owner}</div>
                                                        <div className="text-xs text-gray-500">{tenant.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wide border ${tenant.plan === 'pro' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' :
                                                                tenant.plan === 'empire' ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20' :
                                                                    'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                            }`}>
                                                            {tenant.plan}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">
                                                        R$ {Number(tenant.mrr || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' :
                                                                    tenant.status === 'late' ? 'bg-orange-500' : 'bg-red-500'
                                                                }`}></span>
                                                            <span className={`text-xs capitalize ${tenant.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                    tenant.status === 'late' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                                                                }`}>{tenant.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-xs text-gray-500">{tenant.version}</td>
                                                    <td className="p-4 text-center">
                                                        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#151820] flex items-center justify-between text-xs text-gray-500">
                                    <span>Showing {filteredTenants.length} of 182 results</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 rounded hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 disabled:opacity-50" disabled>Previous</button>
                                        <button className="px-3 py-1 bg-white dark:bg-[#0F1117] border border-gray-300 dark:border-gray-700 rounded hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300">Next</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- DATABASE TAB (Raw View) --- */}
                    {activeTab === 'database' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-[#1A1D26] border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center h-[400px] shadow-sm">
                                <Database size={48} className="text-gray-400 dark:text-gray-700 mb-4" />
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">Conexão Direta (SQL)</h3>
                                <p className="text-gray-500 max-w-sm mb-6 text-sm">Esta área permite executar queries diretas no banco de dados de produção. Use com extremo cuidado.</p>
                                <div className="w-full max-w-2xl bg-gray-50 dark:bg-[#0F1117] rounded-lg border border-gray-200 dark:border-gray-800 p-4 font-mono text-sm text-left relative group">
                                    <span className="text-purple-600 dark:text-purple-400">SELECT</span> * <span className="text-purple-600 dark:text-purple-400">FROM</span> users <span className="text-purple-600 dark:text-purple-400">WHERE</span> role = <span className="text-green-600 dark:text-green-400">'admin'</span> <span className="text-purple-600 dark:text-purple-400">LIMIT</span> 10;
                                    <span className="animate-pulse inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 ml-1 align-middle"></span>
                                </div>
                                <Button className="mt-6 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-600/10 dark:text-red-500 dark:hover:bg-red-600/20 dark:border-red-900/30">
                                    <Lock size={16} className="mr-2" /> Desbloquear Console SQL
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
