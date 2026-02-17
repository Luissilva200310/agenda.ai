
import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronDown, Receipt, DollarSign, TrendingUp, AlertCircle, Wallet, ArrowUpRight, ArrowDownRight, Repeat, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Input, Select } from '../Input';
import { Modal } from '../Modal';
import { Heading2, Label, Subtitle, BodyText } from '../Typography';
import { Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import { Cost } from '../../types';

const CostRow: React.FC<{ cost: Cost, onClick: () => void }> = ({ cost, onClick }) => (
    <div
        className="flex items-center justify-between p-4 border-b border-brand-border last:border-0 hover:bg-brand-soft/30 transition-colors group cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-colors ${cost.category === 'Fixo' ? 'bg-brand-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white' : 'bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white'}`}>
                {cost.category === 'Fixo' ? <Receipt size={18} /> : <TrendingUp size={18} />}
            </div>
            <div>
                <div className="font-medium text-brand-text text-sm">{cost.title}</div>
                <div className="text-xs text-brand-muted flex items-center gap-1">
                    {cost.date}
                    <span className="w-1 h-1 bg-brand-border rounded-full"></span>
                    {cost.category}
                    {cost.category === 'Fixo' && <span className="flex items-center gap-1 ml-2 text-[10px] bg-brand-surface px-1.5 rounded border border-brand-border"><Repeat size={10} /> Mensal</span>}
                </div>
            </div>
        </div>
        <div className="text-right">
            <div className="font-semibold text-brand-text text-sm mb-1">R$ {cost.value}</div>
            <Badge variant={cost.status === 'paid' ? 'success' : 'warning'} className="scale-90 origin-right">
                {cost.status === 'paid' ? 'Pago' : 'Pendente'}
            </Badge>
        </div>
    </div>
);

export const CostsView: React.FC = () => {
    const { costs, addCost, updateCost, deleteCost } = useAppContext();
    const [costsDateFilter, setCostsDateFilter] = useState('Este Mês');
    const [isCostsDateFilterOpen, setIsCostsDateFilterOpen] = useState(false);
    const [isNewCostOpen, setIsNewCostOpen] = useState(false);
    const [selectedCost, setSelectedCost] = useState<Cost | null>(null);
    const [historyCategory, setHistoryCategory] = useState<'Fixo' | 'Variável' | null>(null);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const [newCostData, setNewCostData] = useState({
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Fixo' as any,
        recurrence: 'monthly' as any,
        status: 'pending' as any,
        notes: ''
    });

    const getMonthName = (dateStr: string) => {
        // Se a string já tiver T, pegamos só a parte da data para evitar Invalid Date
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const date = new Date(cleanDate + 'T12:00:00');
        return date.toLocaleString('pt-BR', { month: 'long' });
    };

    const currentMonthLong = new Date().toLocaleString('pt-BR', { month: 'long' });
    const currentMonth = currentMonthLong.charAt(0).toUpperCase() + currentMonthLong.slice(1);
    const currentYear = new Date().getFullYear();

    const displayTitle = costsDateFilter === 'Este Mês'
        ? `Custos ${currentMonth}`
        : `Custos - ${costsDateFilter}`;

    // Lógica de filtragem: Mostrar variáveis do mês + fixos recorrentes
    const filteredCosts = costs.filter(cost => {
        if (costsDateFilter === 'Este Mês') {
            const costDate = new Date(cost.date + 'T12:00:00');
            const now = new Date();
            const sameMonth = costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();

            if (cost.category === 'Fixo' || cost.recurrence === 'monthly') return true;
            return sameMonth;
        }
        // Simples filtro para outros casos (simplificado para o exemplo)
        return true;
    });

    const fixedCosts = filteredCosts.filter(cost => cost.category === 'Fixo');
    const variableCosts = filteredCosts.filter(cost => cost.category !== 'Fixo');

    const totalCosts = filteredCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalFixed = fixedCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalVariable = variableCosts.reduce((acc, curr) => acc + curr.value, 0);

    const handleSaveCost = () => {
        addCost({
            id: Math.random().toString(36).substr(2, 9),
            title: newCostData.description,
            value: Number(newCostData.value),
            date: newCostData.date,
            category: newCostData.category,
            recurrence: newCostData.recurrence,
            status: newCostData.status,
            notes: newCostData.notes
        });
        setIsNewCostOpen(false);
        setNewCostData({
            description: '',
            value: '',
            date: new Date().toISOString().split('T')[0],
            category: 'Fixo',
            recurrence: 'monthly',
            status: 'pending',
            notes: ''
        });
    };

    const handleToggleStatus = (cost: Cost) => {
        updateCost({ ...cost, status: cost.status === 'paid' ? 'pending' : 'paid' });
        if (selectedCost?.id === cost.id) setSelectedCost({ ...cost, status: cost.status === 'paid' ? 'pending' : 'paid' });
    };

    const handleDeleteCost = (id: string) => {
        if (confirm('Deseja realmente excluir este custo?')) {
            deleteCost(id);
            setSelectedCost(null);
        }
    };

    // Resumo Anual Data
    const yearlyData = [
        { month: 'Janeiro', total: 3200 },
        { month: 'Fevereiro', total: 3500 },
        { month: 'Março', total: 0 },
        { month: 'Abril', total: 0 },
        // ...
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Heading2>{displayTitle}</Heading2>
                    <BodyText className="mt-1">Controle despesas fixas e variáveis do seu negócio.</BodyText>
                </div>

                <div className="flex gap-3 relative z-20">
                    <div className="relative"><button onClick={() => setIsCostsDateFilterOpen(!isCostsDateFilterOpen)} className="flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-btn text-brand-text font-medium hover:border-brand-primary transition-colors h-[44px] min-w-[150px] justify-between shadow-sm"><div className="flex items-center gap-2"><CalendarIcon size={18} className="text-brand-primary" /><span>{costsDateFilter}</span></div><ChevronDown size={16} className={`text-brand-muted transition-transform duration-200 ${isCostsDateFilterOpen ? 'rotate-180' : ''}`} /></button>{isCostsDateFilterOpen && (<><div className="fixed inset-0 z-10" onClick={() => setIsCostsDateFilterOpen(false)} /><div className="absolute top-full right-0 mt-2 w-full min-w-[160px] bg-brand-bg border border-brand-border rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">{['Hoje', 'Esta Semana', 'Este Mês', 'Mês Passado', 'Este Ano'].map((opt) => (<button key={opt} onClick={() => { setCostsDateFilter(opt); setIsCostsDateFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-brand-soft hover:text-brand-primary ${costsDateFilter === opt ? 'bg-brand-soft text-brand-primary font-medium' : 'text-brand-text'}`}>{opt}</button>))}</div></>)}</div>
                    <Button leftIcon={<Plus size={18} />} onClick={() => setIsNewCostOpen(true)}>Novo Custo</Button>
                </div>
            </div>

            {/* Resumo Cards - Updated to Brand Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col gap-3 p-5 border-l-4 border-l-brand-text hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <Label>Total de Custos</Label>
                        <div className="p-2 bg-brand-surface rounded-lg text-brand-text"><Wallet size={18} /></div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-brand-text">R$ {totalCosts.toLocaleString('pt-BR')}</div>
                        <div className="text-xs text-brand-muted mt-1 flex items-center gap-1">
                            <ArrowUpRight size={14} className="text-brand-success" />
                            <span className="text-brand-success font-medium">Saudável</span> vs faturamento
                        </div>
                    </div>
                </Card>

                <Card className="flex flex-col gap-3 p-5 border-l-4 border-l-brand-primary hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <Label>Custos Fixos</Label>
                        <div className="p-2 bg-brand-soft rounded-lg text-brand-primary"><Receipt size={18} /></div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-brand-text">R$ {totalFixed.toLocaleString('pt-BR')}</div>
                        <div className="text-xs text-brand-muted mt-1">Aluguel, Luz, Internet</div>
                    </div>
                </Card>

                <Card className="flex flex-col gap-3 p-5 border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <Label>Custos Variáveis</Label>
                        <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><TrendingUp size={18} /></div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-brand-text">R$ {totalVariable.toLocaleString('pt-BR')}</div>
                        <div className="text-xs text-brand-muted mt-1">Somas do mês selecionado</div>
                    </div>
                </Card>
            </div>

            {/* Blocos Separados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloco Custos Fixos */}
                <Card className="flex flex-col h-full" noPadding>
                    <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-soft text-brand-primary rounded-lg">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <Subtitle className="text-brand-primary">Custos Fixos</Subtitle>
                                <BodyText className="text-xs">Despesas recorrentes de {getMonthName(new Date().toISOString())}</BodyText>
                            </div>
                        </div>
                        <Badge variant="primary">{fixedCosts.length} itens</Badge>
                    </div>
                    <div className="flex-1 p-2">
                        {fixedCosts.length > 0 ? (
                            <div className="flex flex-col">
                                {fixedCosts.map(cost => <CostRow key={cost.id} cost={cost} onClick={() => setSelectedCost(cost)} />)}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-brand-muted">
                                <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhum custo fixo registrado.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-brand-border bg-brand-surface/30 rounded-b-card">
                        <Button variant="ghost" className="w-full text-sm h-8" onClick={() => setHistoryCategory('Fixo')}>Ver Histórico Completo</Button>
                    </div>
                </Card>

                {/* Bloco Custos Variáveis */}
                <Card className="flex flex-col h-full" noPadding>
                    <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <Subtitle className="text-brand-primary">Custos Variáveis</Subtitle>
                                <BodyText className="text-xs">Despesas pontuais de {getMonthName(new Date().toISOString())}</BodyText>
                            </div>
                        </div>
                        <Badge variant="neutral">{variableCosts.length} itens</Badge>
                    </div>
                    <div className="flex-1 p-2">
                        {variableCosts.length > 0 ? (
                            <div className="flex flex-col">
                                {variableCosts.map(cost => <CostRow key={cost.id} cost={cost} onClick={() => setSelectedCost(cost)} />)}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-brand-muted">
                                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhum custo variável registrado.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-brand-border bg-brand-surface/30 rounded-b-card">
                        <Button variant="ghost" className="w-full text-sm h-8" onClick={() => setHistoryCategory('Variável')}>Ver Histórico Completo</Button>
                    </div>
                </Card>
            </div>

            {/* Resumo Anual Section */}
            <Card className="mt-8 overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-surface/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-soft text-brand-primary rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <Subtitle className="text-brand-primary">Resumo Geral Anual ({currentYear})</Subtitle>
                            <BodyText className="text-xs">Histórico consolidado por mês</BodyText>
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-brand-border border-b border-brand-border">
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mes, idx) => (
                            <div key={mes} className="p-5 hover:bg-brand-soft/20 transition-colors">
                                <div className="text-[10px] uppercase font-bold text-brand-muted mb-2 tracking-wider">{mes}</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs items-center"><span className="text-brand-muted">Fixo:</span><span className="font-medium text-brand-text">R$ {idx < 2 ? (idx === 0 ? '2.500' : '2.820') : '0'}</span></div>
                                    <div className="flex justify-between text-xs items-center"><span className="text-brand-muted">Variável:</span><span className="font-medium text-brand-text">R$ {idx < 2 ? (idx === 0 ? '700' : '680') : '0'}</span></div>
                                    <div className="flex justify-between text-sm items-center pt-1 border-t border-brand-border mt-1"><span className="font-bold text-brand-primary">TOTAL:</span><span className="font-bold text-brand-primary">R$ {idx < 2 ? (idx === 0 ? '3.200' : '3.500') : '0'}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Modal isOpen={isNewCostOpen} onClose={() => setIsNewCostOpen(false)} title="Registrar Novo Custo" footer={<><Button variant="ghost" onClick={() => setIsNewCostOpen(false)}>Cancelar</Button><Button onClick={handleSaveCost}>Salvar Custo</Button></>}>
                <div className="space-y-4">
                    <div className="p-4 bg-brand-soft rounded-xl flex gap-3 items-start text-sm text-brand-primary border border-brand-primary/10">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>Mantenha seus custos organizados para que a IA possa calcular sua margem de lucro real corretamente.</p>
                    </div>
                    <div className="relative">
                        <Input
                            label="Descrição"
                            list="cost-titles"
                            placeholder="Ex: Conta de Luz"
                            icon={<Receipt size={18} />}
                            value={newCostData.description}
                            onChange={(e) => setNewCostData({ ...newCostData, description: e.target.value })}
                        />
                        <datalist id="cost-titles">
                            <option value="Aluguel" />
                            <option value="Internet" />
                            <option value="Luz" />
                            <option value="Água" />
                            <option value="Marketing" />
                            <option value="Produtos" />
                            <option value="Limpeza" />
                            <option value="Salário" />
                        </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Valor (R$)"
                            type="number"
                            placeholder="0,00"
                            icon={<DollarSign size={18} />}
                            value={newCostData.value}
                            onChange={(e) => setNewCostData({ ...newCostData, value: e.target.value })}
                        />
                        <Input
                            label="Vencimento"
                            type="date"
                            value={newCostData.date}
                            onChange={(e) => setNewCostData({ ...newCostData, date: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Categoria</Label>
                            <Select
                                value={newCostData.category}
                                onChange={(e) => setNewCostData({ ...newCostData, category: e.target.value })}
                            >
                                <option value="Fixo">Custo Fixo</option>
                                <option value="Variavel">Custo Variável</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Pessoal">Pessoal / Pro-labore</option>
                                <option value="Impostos">Impostos</option>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Recorrência</Label>
                            <Select
                                value={newCostData.recurrence}
                                onChange={(e) => setNewCostData({ ...newCostData, recurrence: e.target.value })}
                            >
                                <option value="none">Não repetir</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 border border-brand-border rounded-input hover:border-brand-primary cursor-pointer transition-colors bg-brand-surface" onClick={() => setNewCostData({ ...newCostData, status: newCostData.status === 'paid' ? 'pending' : 'paid' })}>
                        <input
                            type="checkbox"
                            checked={newCostData.status === 'paid'}
                            onChange={() => { }}
                            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="flex-1 text-sm text-brand-text">Despesa já foi paga?</span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                        <Label>Observações</Label>
                        <textarea
                            className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:border-brand-primary outline-none min-h-[100px] resize-none"
                            placeholder="Anote detalhes importantes aqui..."
                            value={newCostData.notes}
                            onChange={(e) => setNewCostData({ ...newCostData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal de Detalhes do Custo */}
            <Modal
                isOpen={!!selectedCost}
                onClose={() => setSelectedCost(null)}
                title="Detalhes da Despesa"
                footer={
                    <div className="flex justify-between w-full">
                        <Button
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            leftIcon={<Trash2 size={18} />}
                            onClick={() => selectedCost && handleDeleteCost(selectedCost.id)}
                        >
                            Excluir
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setSelectedCost(null)}>Fechar</Button>
                            <Button
                                leftIcon={selectedCost?.status === 'paid' ? <Clock size={18} /> : <CheckCircle size={18} />}
                                onClick={() => selectedCost && handleToggleStatus(selectedCost)}
                            >
                                {selectedCost?.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                            </Button>
                        </div>
                    </div>
                }
            >
                {selectedCost && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-brand-soft rounded-2xl">
                            <div className={`p-3 rounded-xl ${selectedCost.category === 'Fixo' ? 'bg-brand-primary text-white' : 'bg-pink-500 text-white'}`}>
                                {selectedCost.category === 'Fixo' ? <Receipt size={24} /> : <TrendingUp size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-text">{selectedCost.title}</h3>
                                <Badge variant={selectedCost.status === 'paid' ? 'success' : 'warning'}>
                                    {selectedCost.status === 'paid' ? 'Pagamento Confirmado' : 'Aguardando Pagamento'}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-brand-surface rounded-xl border border-brand-border">
                                <Label className="text-[10px] uppercase text-brand-muted">Valor</Label>
                                <div className="text-lg font-bold text-brand-text">R$ {selectedCost.value.toLocaleString('pt-BR')}</div>
                            </div>
                            <div className="p-4 bg-brand-surface rounded-xl border border-brand-border">
                                <Label className="text-[10px] uppercase text-brand-muted">Data</Label>
                                <div className="text-lg font-bold text-brand-text">{selectedCost.date}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-brand-border">
                                <span className="text-sm text-brand-muted">Categoria</span>
                                <span className="text-sm font-medium text-brand-text">{selectedCost.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-brand-border">
                                <span className="text-sm text-brand-muted">Recorrência</span>
                                <span className="text-sm font-medium text-brand-text">
                                    {selectedCost.recurrence === 'monthly' ? 'Mensal' : selectedCost.recurrence === 'weekly' ? 'Semanal' : selectedCost.recurrence === 'yearly' ? 'Anual' : 'Não se repete'}
                                </span>
                            </div>
                        </div>

                        {selectedCost.notes && (
                            <div className="p-4 bg-brand-bg border border-brand-border rounded-xl">
                                <Label className="block mb-2 text-brand-primary">Observações</Label>
                                <p className="text-sm text-brand-text leading-relaxed">{selectedCost.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal de Histórico Completo */}
            <Modal
                isOpen={!!historyCategory}
                onClose={() => setHistoryCategory(null)}
                title={`Histórico de Custos ${historyCategory}s`}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <Input placeholder="Buscar no histórico..." icon={<Search size={18} />} className="flex-1" />
                        <Select className="w-40">
                            <option>Todos os meses</option>
                            <option>Últimos 3 meses</option>
                            <option>Este ano</option>
                        </Select>
                    </div>

                    <div className="overflow-hidden border border-brand-border rounded-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-brand-surface border-b border-brand-border text-brand-muted">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Descrição</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Data</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {costs.filter(c =>
                                    (historyCategory === 'Fixo' && (c.category === 'Fixo' || c.recurrence === 'monthly')) ||
                                    (historyCategory === 'Variável' && (c.category !== 'Fixo' && c.recurrence !== 'monthly'))
                                ).map(c => (
                                    <tr key={c.id} className="hover:bg-brand-soft/20 transition-colors cursor-pointer" onClick={() => { setSelectedCost(c); setHistoryCategory(null); }}>
                                        <td className="px-6 py-4 font-medium text-brand-text">{c.title}</td>
                                        <td className="px-6 py-4 text-brand-muted">{c.date}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={c.status === 'paid' ? 'success' : 'warning'}>
                                                {c.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-brand-text">R$ {c.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
