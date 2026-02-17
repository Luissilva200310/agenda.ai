
import React, { useState } from 'react';
import {
  Plus, Calendar as CalendarIcon, DollarSign, TrendingUp, Clock, ChevronDown, PieChart as PieChartIcon, Users, ArrowUpRight, Lightbulb, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Label, Heading1, Heading2, BodyText, Subtitle } from '../Typography';
import { ViewMode, ExtendedClient } from '../../types';
import { financeData } from '../../data/mockData';
import { CHART_COLORS, METRICS, TOOLTIP_STYLE } from '../../theme/constants';
import { isToday, formatDateKey } from '../../utils/formatters';
import { Calendar } from '../Calendar';
import { generateContent } from '../../utils/aiUtils';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    onNavigate,
    appointments,
    costs,
    isDarkMode,
    setIsNewApptOpen,
    businessSettings
  } = useAppContext();

  // Calculate Real Metrics
  const totalBilling = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const totalCosts = costs
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const profit = totalBilling - totalCosts;
  const margin = totalBilling > 0 ? ((profit / totalBilling) * 100).toFixed(0) : 0;


  const [dateFilter, setDateFilter] = useState('Este Mês');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const getDailyAppointments = (date: Date) => {
    const key = formatDateKey(date);
    return appointments.filter(a => (a.date === key) || (!a.date && isToday(date)));
  };

  const todaysAppointments = getDailyAppointments(new Date());

  const chartTextColor = isDarkMode ? CHART_COLORS.text.dark : CHART_COLORS.text.light;
  const gridColor = isDarkMode ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [beautinhoIdea, setBeautinhoIdea] = useState<string | null>(null);
  const [isIdeaLoading, setIsIdeaLoading] = useState(false);

  const getAiInsight = async () => {
    if (aiInsight || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const prompt = `Como mentor de negócios Super Beautinho, dê uma dica curta e motivacional (máximo 2 linhas) baseada nestas métricas REAIS: Faturamento R$ ${totalBilling}, Custos R$ ${totalCosts}, Lucro R$ ${profit}. Seja direto e use emojis de beleza.`;
      const insight = await generateContent(prompt, "Você é o Super Beautinho, mentor de negócios para salões de beleza.");

      setAiInsight(insight);
    } catch (err) {
      setAiInsight("Amiga, foque no lucro hoje! Cada cliente é uma oportunidade. 💖");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getBeautinhoIdea = async () => {
    setIsIdeaLoading(true);
    try {
      const prompt = `Como o Super Beautinho, mentor criativo para salões de beleza, dê UMA ideia prática e criativa (máximo 3 linhas) para aumentar o faturamento ou fidelizar clientes. Pode ser uma promoção, combo de serviços, ação de marketing, ou ideia de conteúdo para redes sociais. Seja específico e use emojis. Exemplo: criar um combo "Dia da Noiva" ou postar reels de transformação.`;
      const idea = await generateContent(prompt, "Você é o Super Beautinho, mentor criativo e estratégico para salões de beleza. Dê ideias inovadoras e práticas.");
      setBeautinhoIdea(idea);
    } catch (err) {
      setBeautinhoIdea("💡 Que tal criar um combo 'Sexta Relax' com desconto? Corte + Hidratação por um preço especial! Divulgue nos Stories com contagem regressiva ⏰✨");
    } finally {
      setIsIdeaLoading(false);
    }
  };

  React.useEffect(() => {
    getAiInsight();
    getBeautinhoIdea();
  }, []);

  // Mock Data for Channels - Using theme colors if possible, or keeping specific brand colors
  const channelData = [
    { name: 'Instagram', value: 45, color: CHART_COLORS.channels.instagram },
    { name: 'Google', value: 25, color: CHART_COLORS.channels.google },
    { name: 'Indicação', value: 20, color: CHART_COLORS.channels.referral },
    { name: 'Outros', value: 10, color: CHART_COLORS.channels.other },
  ];

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading1>Bom dia, {businessSettings.businessName.split(' ')[0]}! 👋</Heading1>
          <div className="mt-2 flex items-center gap-2 text-brand-primary bg-brand-soft px-3 py-1.5 rounded-lg w-fit animate-in fade-in slide-in-from-left-4 duration-700">
            <Sparkles size={16} />
            <span className="text-sm font-medium italic">
              {isAiLoading ? 'Buscando insight...' : aiInsight || 'Preparando sua dica do dia...'}
            </span>
          </div>
        </div>
        <div className="flex gap-3 relative z-20">
          <div className="relative">
            <button
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-btn text-brand-text font-medium hover:border-brand-primary transition-colors h-[44px] min-w-[150px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-primary" />
                <span>{dateFilter}</span>
              </div>
              <ChevronDown size={16} className={`text-brand-muted transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDateFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-full min-w-[280px] bg-brand-bg border border-brand-border rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                  <div className="px-2 py-1 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Período</div>
                  {['Hoje', 'Esta Semana', 'Este Mês', 'Últimos 30 dias'].map((opt) => (
                    <button key={opt} onClick={() => { setDateFilter(opt); setIsDateFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-brand-soft hover:text-brand-primary ${dateFilter === opt ? 'bg-brand-soft text-brand-primary font-medium' : 'text-brand-text'}`}>{opt}</button>
                  ))}
                  <div className="border-t border-brand-border my-2"></div>
                  <div className="px-2 pb-1">
                    <div className="text-xs text-brand-muted mb-2">Selecionar Data Específica</div>
                    <Calendar
                      className="border-none shadow-none p-0 scale-90 origin-top-left"
                      selectedDate={new Date()}
                      onDateChange={(date) => {
                        setDateFilter(date.toLocaleDateString('pt-BR'));
                        setIsDateFilterOpen(false);
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => setIsNewApptOpen(true)}>Novo Agendamento</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <Label>Faturamento</Label>
            <div className="p-2 bg-brand-soft text-brand-primary rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-text">R$ {totalBilling}</div>
            <div className="text-sm text-brand-success mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> Ativo
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <Label>Custos</Label>
            <div className="p-2 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-text">R$ {totalCosts}</div>
            <div className="text-sm text-brand-muted mt-1">Total acumulado</div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <Label>Lucro Líquido</Label>
            <div className="p-2 bg-green-50 text-brand-success dark:bg-green-900/20 dark:text-green-400 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-text">R$ {profit}</div>
            <div className="text-sm text-brand-muted mt-1">Margem: {margin}%</div>
          </div>
        </Card>


        <Card className="p-5 flex flex-col gap-2 bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20">
          <div className="flex justify-between items-start">
            <span className="text-white/80 text-xs font-medium uppercase tracking-wide">Agendamentos</span>
            <div className="p-2 bg-white/20 text-white rounded-lg">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <div className="text-sm text-white/80 mt-1">{todaysAppointments.filter(a => a.status === 'confirmed').length} Confirmados</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <Heading2>Fluxo de Caixa</Heading2>
            <Card className="h-[250px] md:h-[350px]" noPadding={false}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="valor" stroke={CHART_COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="p-4 bg-brand-surface border-l-4 border-l-brand-success rounded-r-xl border-y border-r border-brand-border flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="p-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full mt-0.5">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <div className="font-semibold text-brand-text text-sm">Desempenho Financeiro</div>
                <p className="text-sm text-brand-muted mt-1">
                  Seu lucro atual é de <span className="text-brand-success font-medium">R$ {profit}</span>. A margem de {margin}% indica a eficiência do seu negócio! 🚀
                </p>

              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Heading2>Origem dos Clientes</Heading2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-[200px] md:h-[250px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE(isDarkMode)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-brand-text">100%</span>
                  <span className="text-xs text-brand-muted">Total</span>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-3 content-center">
                {channelData.map((channel) => (
                  <Card key={channel.name} className="flex items-center justify-between p-3" noPadding>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }}></div>
                      <span className="text-sm font-medium text-brand-text">{channel.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-brand-muted">{channel.value}%</span>
                      <div className="w-20 h-1.5 bg-brand-soft rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${channel.value}%`, backgroundColor: channel.color }}></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading2>Próximos Clientes</Heading2>
            <Button variant="ghost" className="text-xs h-8" onClick={() => onNavigate(ViewMode.SCHEDULE)}>Ver Agenda</Button>
          </div>

          <div className="space-y-3">
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map(client => (
                <Card key={client.id} onClick={() => onNavigate(ViewMode.CLIENT_DETAILS)} className="p-4 flex gap-4 items-center hover:border-brand-primary/40 transition-colors cursor-pointer" noPadding>
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-brand-soft rounded-xl text-brand-primary shrink-0 font-semibold text-sm">
                    {client.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Subtitle className="truncate text-base">{client.name}</Subtitle>
                    <BodyText className="text-xs truncate">{client.service}</BodyText>
                  </div>
                  <Badge variant={client.status === 'confirmed' ? 'success' : 'warning'}>
                    {client.status === 'confirmed' ? 'OK' : '...'}
                  </Badge>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-brand-surface rounded-card border border-brand-border border-dashed">
                <CalendarIcon className="mx-auto text-brand-muted mb-3 opacity-50" size={32} />
                <BodyText>Nenhum atendimento marcado para hoje.</BodyText>
                <Button variant="ghost" className="mt-2 text-sm" onClick={() => setIsNewApptOpen(true)}>
                  Agendar Agora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ideia do Beautinho - Full width, aligned with charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <Heading2>💡 Ideia do Beautinho</Heading2>
            <button
              onClick={getBeautinhoIdea}
              disabled={isIdeaLoading}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-soft transition-colors disabled:opacity-50"
              title="Gerar nova ideia"
            >
              <RefreshCw size={16} className={isIdeaLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <Card className="p-5 bg-gradient-to-br from-brand-soft/50 to-brand-bg border-brand-primary/20 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-4xl opacity-10">💡</div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0 mt-0.5">
                <Lightbulb size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-brand-text leading-relaxed font-medium">
                  {isIdeaLoading ? (
                    <span className="flex items-center gap-2 text-brand-muted">
                      <Loader2 size={14} className="animate-spin" />
                      Beautinho está pensando...
                    </span>
                  ) : (
                    beautinhoIdea || 'Carregando ideia...'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
