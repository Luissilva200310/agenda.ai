
import React, { useState } from 'react';
import { Search, Plus, Filter, Download, MoreHorizontal, Phone, Calendar as CalendarIcon, DollarSign, Star, History, LayoutList, Scissors, User, Mail, X } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input, TextArea } from '../Input';
import { Modal } from '../Modal';
import { Heading2, Subtitle, Label, BodyText } from '../Typography';
import { ViewMode, ExtendedClient } from '../../types';

import { useAppContext } from '../../context/AppContext';

export const ClientsView: React.FC = () => {
    const {
        setCurrentView: onNavigate,
        clients,
        addClient,
        updateClient,
        setSelectedClientId
    } = useAppContext();
    const [isNewClientOpen, setIsNewClientOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeClientFilter, setActiveClientFilter] = useState<'all' | 'services' | 'dates' | 'finance' | 'nps' | 'visits' | 'tags'>('all');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [newClientData, setNewClientData] = useState({
        name: '',
        phone: '',
        email: '',
        birthDate: '',
        address: '',
        origin: '',
        notes: '',
        tags: [] as string[]
    });
    const [newTagInput, setNewTagInput] = useState('');

    const allTags = Array.from(new Set(clients.flatMap(c => c.tags || [])));

    const filteredClients = clients.filter(client => {
        const search = clientSearch.toLowerCase();
        const matchesSearch = client.name.toLowerCase().includes(search) || client.phone.includes(search);

        if (!matchesSearch) return false;

        if (activeClientFilter === 'all') return true;
        if (activeClientFilter === 'finance') return (client.totalSpent || 0) > 1000;
        if (activeClientFilter === 'nps') return (client.nps || 0) >= 4;
        if (activeClientFilter === 'visits') return (client.visits || 0) > 5;
        if (activeClientFilter === 'tags' && selectedTag) return client.tags?.includes(selectedTag);

        return true;
    });

    const handleSaveClient = () => {
        if (!newClientData.name || !newClientData.phone) return;

        addClient({
            name: newClientData.name,
            phone: newClientData.phone,
            email: newClientData.email,
            birthDate: newClientData.birthDate,
            address: newClientData.address,
            origin: newClientData.origin,
            notes: newClientData.notes,
            tags: newClientData.tags,
            service: '',
            time: '',
            status: 'pending',
            value: 0,
            totalSpent: 0,
            visits: 0
        } as any);

        setIsNewClientOpen(false);
        setNewClientData({ name: '', phone: '', email: '', birthDate: '', address: '', origin: '', notes: '', tags: [] });
    };

    const handleAddTag = () => {
        if (newTagInput && !newClientData.tags.includes(newTagInput)) {
            setNewClientData(prev => ({ ...prev, tags: [...prev.tags, newTagInput] }));
            setNewTagInput('');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Heading2>Meus Clientes</Heading2>
                    <BodyText className="mt-1">Visualize histórico, fidelidade e dados de contato.</BodyText>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-brand-surface p-1 rounded-lg border border-brand-border mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}
                        >
                            <LayoutList size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}
                        >
                            <MoreHorizontal size={18} className="rotate-90" />
                        </button>
                    </div>
                    <Button leftIcon={<Plus size={18} />} onClick={() => setIsNewClientOpen(true)}>Novo Cliente</Button>
                </div>
            </div>

            <div className="border-b border-brand-border flex gap-6 overflow-x-auto no-scrollbar">
                {[{ id: 'all', label: 'Todos', icon: LayoutList }, { id: 'finance', label: 'VIP (Financeiro)', icon: DollarSign }, { id: 'nps', label: 'Promotores', icon: Star }, { id: 'visits', label: 'Frequentes', icon: History }, { id: 'tags', label: 'Por Tags', icon: User }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveClientFilter(tab.id as any)} className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeClientFilter === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {activeClientFilter === 'tags' && (
                <div className="flex gap-2 flex-wrap mb-4 animate-in fade-in">
                    {allTags.length > 0 ? allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedTag === tag ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface text-brand-text border-brand-border hover:border-brand-primary'}`}
                        >
                            {tag}
                        </button>
                    )) : (
                        <span className="text-sm text-brand-muted">Nenhuma tag criada ainda. Adicione tags aos clientes.</span>
                    )}
                </div>
            )}
            <div className="flex gap-4 mb-6"><Input placeholder="Buscar cliente por nome ou telefone..." icon={<Search size={18} />} className="max-w-md" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} /></div>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <Card key={client.id} onClick={() => { setSelectedClientId(client.id); onNavigate(ViewMode.CLIENT_DETAILS); }} className="hover:border-brand-primary transition-all cursor-pointer group">
                            <div className="flex items-center gap-4 mb-4">
                                {client.avatar ? (
                                    <img src={client.avatar} className="w-12 h-12 rounded-full object-cover border border-brand-border" />
                                ) : (
                                    <div className="w-12 h-12 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary font-bold text-lg group-hover:bg-brand-primary group-hover:text-white transition-colors">{client.name.charAt(0)}</div>
                                )}
                                <div>
                                    <Subtitle>{client.name}</Subtitle>
                                    <div className="text-sm text-brand-muted flex items-center gap-1"><Phone size={12} /> {client.phone}</div>
                                </div>
                            </div>
                            {client.tags && client.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mb-3">
                                    {client.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-brand-surface border border-brand-border rounded text-[10px] text-brand-muted">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-2 border-t border-brand-border pt-4">
                                <div className="flex justify-between text-sm"><span className="text-brand-muted">Última visita:</span><span className="text-brand-text font-medium">{client.lastVisit || '-'}</span></div>
                                {activeClientFilter === 'nps' && client.nps ? (
                                    <div className="flex justify-between text-sm items-center"><span className="text-brand-muted">Avaliação:</span><div className="flex gap-0.5 text-yellow-400">{[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < (client.nps || 0) ? "currentColor" : "none"} />))}</div></div>
                                ) : activeClientFilter === 'visits' && client.visits ? (
                                    <div className="flex justify-between text-sm"><span className="text-brand-muted">Frequência:</span><span className="text-brand-primary font-medium flex items-center gap-1"><History size={12} /> {client.visits} visitas</span></div>
                                ) : (
                                    <div className="flex justify-between text-sm"><span className="text-brand-muted">Total gasto:</span><span className="text-brand-success font-medium">R$ {client.totalSpent || 0}</span></div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-surface border-b border-brand-border">
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted tracking-wide">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted tracking-wide">Contato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted tracking-wide">Origem</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted tracking-wide">Visitas</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted tracking-wide text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {filteredClients.map(client => (
                                    <tr key={client.id} onClick={() => { setSelectedClientId(client.id); onNavigate(ViewMode.CLIENT_DETAILS); }} className="hover:bg-brand-soft/30 cursor-pointer transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand-primary font-bold text-xs group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                    {client.avatar ? <img src={client.avatar} className="w-full h-full rounded-full object-cover" /> : client.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-brand-text">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted">{client.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 bg-brand-surface rounded-md border border-brand-border text-brand-muted">{client.origin || 'Direto'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-primary font-medium">{client.visits || 0}</td>
                                        <td className="px-6 py-4 text-sm text-brand-success font-bold text-right">R$ {client.totalSpent || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            <Modal isOpen={isNewClientOpen} onClose={() => setIsNewClientOpen(false)} title="Adicionar Novo Cliente" footer={<><Button variant="ghost" onClick={() => setIsNewClientOpen(false)}>Cancelar</Button><Button onClick={handleSaveClient}>Salvar Cliente</Button></>}>
                <div className="space-y-4">
                    <Input
                        label="Nome Completo"
                        placeholder="Ex: Ana Souza"
                        icon={<User size={18} />}
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="WhatsApp / Telefone"
                            placeholder="(00) 00000-0000"
                            icon={<Phone size={18} />}
                            value={newClientData.phone}
                            onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                        />
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={newClientData.birthDate}
                            onChange={(e) => setNewClientData({ ...newClientData, birthDate: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Endereço"
                            placeholder="Rua, Número, Bairro..."
                            value={newClientData.address}
                            onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                        />
                        <div className="flex flex-col gap-1.5">
                            <Label>Como nos conheceu?</Label>
                            <select
                                className="w-full h-[45px] rounded-input border border-brand-border bg-brand-surface px-4 text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                value={newClientData.origin}
                                onChange={(e) => setNewClientData({ ...newClientData, origin: e.target.value })}
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Google">Google / Maps</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Passou na frente">Passei na frente</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Tags / Etiquetas</Label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {newClientData.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-brand-soft text-brand-primary rounded-full text-xs font-medium flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => setNewClientData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} className="hover:text-red-500"><X size={12} className="lucide-x" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ex: VIP, Indicação..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                className="flex-1"
                            />
                            <Button variant="secondary" onClick={handleAddTag} leftIcon={<Plus size={16} />}>Adicionar</Button>
                        </div>
                    </div>

                    <Input
                        label="E-mail (Opcional)"
                        type="email"
                        placeholder="cliente@email.com"
                        icon={<Mail size={18} />}
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    />
                    <div className="flex flex-col gap-1.5">
                        <Label>Observações</Label>
                        <TextArea
                            className="h-24"
                            placeholder="Alergias, preferências, histórico..."
                            value={newClientData.notes}
                            onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
