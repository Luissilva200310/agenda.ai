import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Heading2, Subtitle, BodyText, Label } from './Typography';
import { Calendar, DollarSign, TrendingUp, Clock, Plus, MoreHorizontal } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Seg', valor: 450 },
  { name: 'Ter', valor: 620 },
  { name: 'Qua', valor: 580 },
  { name: 'Qui', valor: 890 },
  { name: 'Sex', valor: 1200 },
  { name: 'Sáb', valor: 1450 },
];

const appointments = [
  { id: 1, time: '09:00', client: 'Ana Clara', service: 'Corte + Hidratação', value: 'R$ 180,00', status: 'confirmed' },
  { id: 2, time: '10:30', client: 'Beatriz Costa', service: 'Manicure', value: 'R$ 45,00', status: 'pending' },
  { id: 3, time: '13:00', client: 'Carla Dias', service: 'Mechas', value: 'R$ 350,00', status: 'confirmed' },
  { id: 4, time: '16:00', client: 'Fernanda Lima', service: 'Maquiagem', value: 'R$ 150,00', status: 'cancelled' },
];

export const DashboardMockup: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Bom dia, Dra. Júlia! 👋</h1>
          <BodyText>Aqui está o resumo do seu negócio hoje.</BodyText>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Calendar size={18} />}>Ver Agenda</Button>
          <Button leftIcon={<Plus size={18} />}>Novo Agendamento</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Faturamento do Dia" 
          value="R$ 850,00" 
          subtext="3 agendamentos restantes"
          icon={<DollarSign className="text-brand-primary" size={24} />}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value="R$ 12.450,00" 
          subtext="+15% que o mês passado"
          trend="up"
          icon={<TrendingUp className="text-brand-success" size={24} />}
        />
        <MetricCard 
          title="Novas Clientes" 
          value="8" 
          subtext="Esta semana"
          icon={<TrendingUp className="text-brand-primary" size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Agenda Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Heading2>Agenda de Hoje</Heading2>
            <Button variant="ghost" className="text-sm h-8 px-3">Ver todos</Button>
          </div>
          
          <div className="space-y-3">
            {appointments.map((apt) => (
              <Card key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-primary/30 transition-colors cursor-pointer" noPadding>
                <div className="p-4 flex items-center gap-4 w-full">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-brand-soft rounded-2xl text-brand-primary shrink-0">
                    <Clock size={20} />
                    <span className="text-xs font-semibold mt-1">{apt.time}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Subtitle className="truncate">{apt.client}</Subtitle>
                      <span className="font-semibold text-brand-text sm:hidden">{apt.value}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <BodyText className="text-sm truncate">{apt.service}</BodyText>
                      {/* Simple status logic for demo */}
                      {apt.status === 'confirmed' && <Badge variant="success">Confirmado</Badge>}
                      {apt.status === 'pending' && <Badge variant="warning">Pendente</Badge>}
                      {apt.status === 'cancelled' && <Badge variant="danger">Cancelado</Badge>}
                    </div>
                  </div>

                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-brand-text font-semibold">{apt.value}</div>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full ml-auto">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Financial Chart Section */}
        <div className="space-y-4">
          <Heading2>Visão Financeira</Heading2>
          <Card className="h-[400px] flex flex-col">
            <div className="mb-6">
              <Label>Faturamento Semanal</Label>
              <div className="text-3xl font-semibold text-brand-text mt-1">R$ 5.190</div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#F1EEFF' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="valor" 
                    fill="#6C4CF1" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border text-center">
              <Button variant="ghost" className="text-sm w-full">Ver Relatório Completo</Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode; trend?: 'up' | 'down' }> = ({
  title, value, subtext, icon, trend
}) => (
  <Card className="flex flex-col gap-2">
    <div className="flex items-start justify-between">
      <Label>{title}</Label>
      <div className="p-2 bg-brand-surface rounded-lg">{icon}</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-brand-text">{value}</div>
      <div className={`text-sm mt-1 ${trend === 'up' ? 'text-brand-success' : 'text-brand-muted'}`}>
        {subtext}
      </div>
    </div>
  </Card>
);