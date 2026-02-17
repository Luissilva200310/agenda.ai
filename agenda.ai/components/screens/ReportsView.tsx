
import React, { useState } from 'react';
import { Heading2, BodyText, Subtitle, Label } from '../Typography';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import {
    BarChart3, DollarSign, Settings, User, Filter, Download,
    Calendar as CalendarIcon, ChevronDown, Search, Wallet, PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { financeData, servicesShareData, paymentMethodsData } from '../../data/mockData';
import { CHART_COLORS, TOOLTIP_STYLE } from '../../theme/constants';

import { useAppContext } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
    const { isDarkMode, appointments, clients, services, costs } = useAppContext();
    const [reportCategory, setReportCategory] = useState<'general' | 'financial' | 'operational' | 'clients'>('general');
    const [reportDateFilter, setReportDateFilter] = useState('Este Mês');
    const [isReportDateFilterOpen, setIsReportDateFilterOpen] = useState(false);
    const [reportSearch, setReportSearch] = useState('');

    const chartTextColor = isDarkMode ? CHART_COLORS.text.dark : CHART_COLORS.text.light;
    const gridColor = isDarkMode ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;

    // --- REAL DATA AGGREGATION ---
    // 1. Filtered Data by date
    const filteredAppts = appointments;
    const completedAppts = filteredAppts.filter(a => a.status === 'completed');
    const canceledAppts = filteredAppts.filter(a => a.status === 'canceled');

    // 2. Financial
    const totalRevenue = completedAppts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const totalCost = completedAppts.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    // Fixed expenses from costs table
    const fixedExpenses = costs.filter(c => c.category === 'Fixo').reduce((sum, c) => sum + c.value, 0);
    const variableExpenses = costs.filter(c => c.category === 'Variável').reduce((sum, c) => sum + c.value, 0);
    const totalExpenses = fixedExpenses + variableExpenses;
    const netProfit = totalRevenue - totalCost - totalExpenses;
    const avgTicket = completedAppts.length > 0 ? totalRevenue / completedAppts.length : 0;

    // Projected vs Real
    const projectedRevenue = filteredAppts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const projectedVsReal = [
        { name: 'Proj.', value: projectedRevenue },
        { name: 'Real', value: totalRevenue }
    ];

    // 3. Payment Methods Distribution
    const paymentCounts: Record<string, number> = {};
    completedAppts.forEach(a => {
        const method = a.paymentMethod || 'Não Inf.';
        paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });
    const realPaymentMethodsData = Object.entries(paymentCounts).map(([name, value], index) => ({
        name,
        value,
        color: [CHART_COLORS.success, CHART_COLORS.primary, CHART_COLORS.secondary, '#F59E0B'][index % 4]
    }));

    // 4. Services Metrics
    const serviceStats: Record<string, { count: number, revenue: number, profit: number, type: string }> = {};
    completedAppts.forEach(a => {
        const svc = services.find(s => s.name === a.service);
        if (!serviceStats[a.service]) {
            serviceStats[a.service] = { count: 0, revenue: 0, profit: 0, type: svc?.type || 'service' };
        }
        serviceStats[a.service].count++;
        serviceStats[a.service].revenue += (Number(a.value) || 0);
        serviceStats[a.service].profit += (Number(a.value) || 0) - (Number(a.cost) || 0);
    });

    const topServices = Object.entries(serviceStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.count - a.count);

    const mostProfitableServices = [...topServices].sort((a, b) => b.profit - a.profit);
    const topCombos = topServices.filter(s => s.type === 'combo');
    const topOffers = topServices.filter(s => s.type === 'offer');

    // 5. Client Metrics
    const totalClientsCount = clients.length;
    const newClientsMetric = clients.filter(c => (c.visits || 0) <= 1).length;

    const clientChannels: Record<string, number> = {};
    clients.forEach(c => {
        const origin = c.origin || 'Outros';
        clientChannels[origin] = (clientChannels[origin] || 0) + 1;
    });
    const channelData = Object.entries(clientChannels).map(([name, value]) => ({ name, value }));

    const avgNPS = clients.length > 0 ? clients.reduce((sum, c) => sum + (c.nps || 0), 0) / clients.length : 0;

    // 6. Operational
    const totalAppointmentsCount = filteredAppts.length;
    const completedCount = completedAppts.length;
    const canceledCount = canceledAppts.length;
    const cancellationRate = totalAppointmentsCount > 0 ? (canceledCount / totalAppointmentsCount) * 100 : 0;
    const occupancyRate = 75; // Mocked for now as we don't have full schedule capacity logic

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <Heading2>Relatórios de Desempenho</Heading2>
                    <BodyText>Analise os indicadores chave do seu negócio.</BodyText>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" leftIcon={<Filter size={18} />} className="hidden md:flex">Filtros</Button>
                    <Button variant="secondary" leftIcon={<Download size={18} />}>Exportar PDF</Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-brand-border flex gap-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'general', label: 'Visão Geral', icon: BarChart3 },
                    { id: 'financial', label: 'Financeiro', icon: DollarSign },
                    { id: 'services', label: 'Serviços', icon: PieChartIcon },
                    { id: 'operational', label: 'Operacional', icon: Settings },
                    { id: 'clients', label: 'Clientes', icon: User },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setReportCategory(tab.id as any)}
                        className={`
                          flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-all whitespace-nowrap border-b-2
                          ${reportCategory === tab.id
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-brand-muted hover:text-brand-text'
                            }
                      `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Date Filter */}
                    <div className="relative z-20 w-full md:w-auto">
                        <button
                            onClick={() => setIsReportDateFilterOpen(!isReportDateFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-border rounded-btn text-brand-text font-medium hover:border-brand-primary transition-colors h-[40px] w-full md:min-w-[180px] justify-between shadow-sm text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon size={16} className="text-brand-primary" />
                                <span>{reportDateFilter}</span>
                            </div>
                            <ChevronDown size={14} className={`text-brand-muted transition-transform duration-200 ${isReportDateFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isReportDateFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => { setIsReportDateFilterOpen(false); }} />
                                <div className="absolute top-full left-0 mt-2 w-[200px] bg-white border border-brand-border rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                                    {['Hoje', 'Esta Semana', 'Este Mês', 'Mês Passado', 'Este Ano'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setReportDateFilter(opt);
                                                setIsReportDateFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-brand-soft hover:text-brand-primary ${reportDateFilter === opt ? 'bg-brand-soft text-brand-primary font-medium' : 'text-brand-text'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Professional Filter */}
                    <select className="h-[40px] px-3 rounded-btn border border-brand-border bg-white text-sm text-brand-text focus:border-brand-primary outline-none min-w-[150px]">
                        <option>Todos Profissionais</option>
                        <option>Dra. Júlia</option>
                        <option>Assistente 1</option>
                    </select>

                    {/* Status Filter */}
                    <select className="h-[40px] px-3 rounded-btn border border-brand-border bg-white text-sm text-brand-text focus:border-brand-primary outline-none min-w-[150px]">
                        <option>Todos Status</option>
                        <option>Concluídos</option>
                        <option>Cancelados</option>
                    </select>
                </div>

                <div className="w-full md:w-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                    <input
                        className="w-full md:w-[200px] h-[40px] pl-9 pr-4 rounded-btn border border-brand-border bg-white text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary text-sm"
                        placeholder="Buscar..."
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CONTENT BASED ON TAB --- */}

            {/* 1. VISÃO GERAL */}
            {reportCategory === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    {/* Financial Chart */}
                    <Card className="h-[350px] md:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <Subtitle>Faturamento vs Custos</Subtitle>
                                <BodyText className="text-xs">Comparativo mensal</BodyText>
                            </div>
                            <BarChart3 size={20} className="text-brand-muted" />
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={financeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                                <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} cursor={{ fill: 'transparent' }} />
                                <Area type="monotone" dataKey="valor" stackId="1" stroke="#6C4CF1" fill="#6C4CF1" fillOpacity={0.6} name="Faturamento" />
                                <Area type="monotone" dataKey="custos" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Custos" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Services Share */}
                    <Card className="h-[350px]">
                        <div className="flex justify-between items-center mb-4">
                            <Subtitle>Serviços Realizados</Subtitle>
                            <PieChartIcon size={20} className="text-brand-muted" />
                        </div>
                        <div className="flex justify-center h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topServices.length > 0 ? topServices : servicesShareData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(topServices.length > 0 ? topServices : servicesShareData).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs flex-wrap">
                            {(topServices.length > 0 ? topServices : servicesShareData).map(item => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span>{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Payment Methods */}
                    <Card className="h-[350px]">
                        <div className="flex justify-between items-center mb-4">
                            <Subtitle>Formas de Pagamento</Subtitle>
                            <Wallet size={20} className="text-brand-muted" />
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={paymentMethodsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                                <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {paymentMethodsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {/* 2. FINANCEIRO */}
            {reportCategory === 'financial' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-l-4 border-l-brand-success">
                            <Label>Lucro Líquido</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">R$ {netProfit.toFixed(2)}</div>
                            <div className="text-xs text-brand-success mt-1">Receita - Custos - Despesas</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-primary">
                            <Label>Ticket Médio</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">R$ {avgTicket.toFixed(2)}</div>
                            <div className="text-xs text-brand-muted mt-1">Média por atendimento</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-danger">
                            <Label>Despesas Totais</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">R$ {totalExpenses.toFixed(2)}</div>
                            <div className="text-xs text-brand-danger mt-1">Fixas + Variáveis</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-secondary">
                            <Label>Faturamento Real</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">R$ {totalRevenue.toFixed(2)}</div>
                            <div className="text-xs text-brand-muted mt-1">Agendamentos concluídos</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Projected vs Real Chart */}
                        <Card className="h-[350px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <Subtitle>Total Projetado vs Real</Subtitle>
                                    <BodyText className="text-xs">Comparativo de faturamento</BodyText>
                                </div>
                                <BarChart3 size={20} className="text-brand-muted" />
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                                <BarChart data={projectedVsReal}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                                    <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {projectedVsReal.map((entry, index) => (
                                            <Cell key={`cell-f-${index}`} fill={index === 0 ? CHART_COLORS.primary : CHART_COLORS.success} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Payment Methods */}
                        <Card className="h-[350px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <Subtitle>Clientes por Forma de Pagamento</Subtitle>
                                    <BodyText className="text-xs">Distribuição de recebíveis</BodyText>
                                </div>
                                <Wallet size={20} className="text-brand-muted" />
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={realPaymentMethodsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {realPaymentMethodsData.map((entry, index) => (
                                            <Cell key={`cell-p-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 text-xs flex-wrap">
                                {realPaymentMethodsData.map(item => (
                                    <div key={item.name} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name} ({item.value})</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <Subtitle className="mb-4">Resumo Financeiro - Insights</Subtitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">💡 Insight Financeiro</div>
                                <BodyText className="text-sm">
                                    Seu lucro líquido representa <strong>{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</strong> do faturamento total.
                                    Considere reduzir despesas fixas para aumentar esta margem.
                                </BodyText>
                            </div>
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">💡 Forma de Pagamento</div>
                                <BodyText className="text-sm">
                                    O <strong>{realPaymentMethodsData.sort((a, b) => b.value - a.value)[0]?.name}</strong> é sua principal forma de recebimento.
                                    Isso pode ajudar no planejamento do seu fluxo de caixa.
                                </BodyText>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* NEW SERVICES TAB */}
            {reportCategory === 'services' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4 bg-brand-soft border-brand-primary/20">
                            <Label>Serviço mais Vendido</Label>
                            <div className="text-xl font-bold text-brand-text mt-1 truncate">{topServices[0]?.name || 'N/A'}</div>
                            <div className="text-xs text-brand-primary mt-1">{topServices[0]?.count || 0} realizados</div>
                        </Card>
                        <Card className="p-4 bg-brand-soft border-brand-primary/20">
                            <Label>Combo mais Popular</Label>
                            <div className="text-xl font-bold text-brand-text mt-1 truncate">{topCombos[0]?.name || 'N/A'}</div>
                            <div className="text-xs text-brand-primary mt-1">{topCombos[0]?.count || 0} realizados</div>
                        </Card>
                        <Card className="p-4 bg-brand-soft border-brand-primary/20">
                            <Label>Oferta Ativa</Label>
                            <div className="text-xl font-bold text-brand-text mt-1 truncate">{topOffers[0]?.name || 'N/A'}</div>
                            <div className="text-xs text-brand-primary mt-1">{topOffers[0]?.count || 0} realizados</div>
                        </Card>
                        <Card className="p-4 bg-brand-soft border-brand-primary/20">
                            <Label>Maior Lucratividade</Label>
                            <div className="text-xl font-bold text-brand-text mt-1 truncate">{mostProfitableServices[0]?.name || 'N/A'}</div>
                            <div className="text-xs text-brand-primary mt-1">R$ {mostProfitableServices[0]?.profit.toFixed(2)} acumulado</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <Subtitle className="mb-4">Top 5 Serviços (Rank de Vendas)</Subtitle>
                            <div className="space-y-2">
                                {topServices.slice(0, 5).map((svc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-brand-surface rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center font-bold text-xs">#{idx + 1}</div>
                                            <div className="font-medium text-brand-text">{svc.name}</div>
                                        </div>
                                        <Badge variant="neutral">{svc.count} realizados</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <Subtitle className="mb-4">Top Serviços mais Lucrativos</Subtitle>
                            <div className="space-y-2">
                                {mostProfitableServices.slice(0, 5).map((svc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-brand-surface rounded-lg border-l-4 border-l-brand-success">
                                        <div className="font-medium text-brand-text">{svc.name}</div>
                                        <div className="text-sm font-bold text-brand-success">R$ {svc.profit.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <Subtitle className="mb-4">Insights de Serviços</Subtitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">⭐ Destaque</div>
                                <BodyText className="text-sm">
                                    O serviço <strong>{topServices[0]?.name}</strong> representa <strong>{totalRevenue > 0 ? ((topServices[0]?.revenue / totalRevenue) * 100).toFixed(1) : 0}%</strong> do seu faturamento.
                                </BodyText>
                            </div>
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">🎁 combos</div>
                                <BodyText className="text-sm">
                                    {topCombos.length > 0
                                        ? `O combo ${topCombos[0]?.name} está performando bem. Considere criar um novo combo complementar.`
                                        : "Você ainda não tem combos populares. Tente agrupar serviços frequentes em um pacote!"}
                                </BodyText>
                            </div>
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">💰 Margem</div>
                                <BodyText className="text-sm">
                                    Focar em <strong>{mostProfitableServices[0]?.name}</strong> é a melhor estratégia para aumentar seu lucro rapidamente.
                                </BodyText>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* 3. OPERACIONAL */}
            {reportCategory === 'operational' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-l-4 border-l-brand-primary">
                            <Label>Total Agendados</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{totalAppointmentsCount}</div>
                            <div className="text-xs text-brand-muted mt-1">No período selecionado</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-success">
                            <Label>Realizados</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{completedCount}</div>
                            <div className="text-xs text-brand-success mt-1">Concluídos com sucesso</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-danger">
                            <Label>Cancelados</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{canceledCount}</div>
                            <div className="text-xs text-brand-danger mt-1">Não comparecimentos/desistências</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-yellow-500">
                            <Label>Taxa de Cancelamento</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{cancellationRate.toFixed(1)}%</div>
                            <div className="text-xs text-brand-muted mt-1">Média do período</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <Subtitle className="mb-4">Taxa de Ocupação da Agenda</Subtitle>
                            <div className="flex items-center justify-center h-[200px]">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#6C4CF1" strokeWidth="3" strokeDasharray={`${occupancyRate}, 100`} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-brand-text">{occupancyRate}%</span>
                                        <span className="text-xs text-brand-muted">Ocupado</span>
                                    </div>
                                </div>
                            </div>
                            <BodyText className="text-center text-xs text-brand-muted mt-4">
                                Baseado nas horas disponíveis vs. horas agendadas.
                            </BodyText>
                        </Card>

                        <Card>
                            <Subtitle className="mb-4">Insights de Atendimento</Subtitle>
                            <div className="space-y-4">
                                <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                    <div className="text-brand-primary font-bold text-sm mb-1">📈 Conversão</div>
                                    <BodyText className="text-sm">
                                        Sua taxa de conclusão de agendamentos é de <strong>{totalAppointmentsCount > 0 ? ((completedCount / totalAppointmentsCount) * 100).toFixed(1) : 0}%</strong>.
                                    </BodyText>
                                </div>
                                <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                    <div className="text-brand-primary font-bold text-sm mb-1">⚠️ Observação</div>
                                    <BodyText className="text-sm">
                                        {cancellationRate > 15
                                            ? "Sua taxa de cancelamento está alta. Considere enviar lembretes automáticos via WhatsApp."
                                            : "Excelente! Sua taxa de cancelamento está dentro do ideal (abaixo de 15%)."}
                                    </BodyText>
                                </div>
                                <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                    <div className="text-brand-primary font-bold text-sm mb-1">✨ Sugestão</div>
                                    <BodyText className="text-sm">
                                        Aumente sua ocupação oferecendo descontos para horários de baixa procura (ex: terças de manhã).
                                    </BodyText>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* 4. CLIENTES */}
            {reportCategory === 'clients' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-l-4 border-l-brand-primary">
                            <Label>Total de Clientes</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{totalClientsCount}</div>
                            <div className="text-xs text-brand-muted mt-1">Base total cadastrada</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-success">
                            <Label>Novos Clientes</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{newClientsMetric}</div>
                            <div className="text-xs text-brand-success mt-1">Primeira visita no período</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-brand-secondary">
                            <Label>NPS Médio</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">{avgNPS.toFixed(1)}</div>
                            <div className="text-xs text-brand-muted mt-1">Nível de satisfação</div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-purple-500">
                            <Label>Ticket Médio / Cliente</Label>
                            <div className="text-2xl font-bold text-brand-text mt-1">R$ {(totalRevenue / (totalClientsCount || 1)).toFixed(2)}</div>
                            <div className="text-xs text-brand-muted mt-1">Faturamento por cliente</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <Subtitle className="mb-4">Top Clientes (Maiores Gastos)</Subtitle>
                            <div className="space-y-3">
                                {clients
                                    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                                    .slice(0, 5)
                                    .map((client, index) => (
                                        <div key={client.id} className="flex items-center justify-between p-3 hover:bg-brand-surface rounded-lg transition-colors border border-transparent hover:border-brand-border">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-brand-soft text-brand-primary'}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-brand-text">{client.name}</div>
                                                    <div className="text-xs text-brand-muted">{client.visits || 0} visitas</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-brand-primary">R$ {client.totalSpent || 0}</div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        <Card>
                            <Subtitle className="mb-4">Canais de Aquisição</Subtitle>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={channelData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} width={100} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <Subtitle className="mb-4">Insights de Clientes</Subtitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">📅 Picos de Trabalho</div>
                                <BodyText className="text-sm">
                                    Seus maiores picos de trabalho ocorrem entre <strong>10h e 16h</strong>. Considere reforçar a equipe nestes horários.
                                </BodyText>
                            </div>
                            <div className="p-4 bg-brand-soft rounded-xl border border-brand-primary/10">
                                <div className="text-brand-primary font-bold text-sm mb-1">🔍 Furos na Agenda</div>
                                <BodyText className="text-sm">
                                    Foram identificados <strong>3 horários vagos</strong> recorrentes nas manhãs de quarta-feira.
                                </BodyText>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
