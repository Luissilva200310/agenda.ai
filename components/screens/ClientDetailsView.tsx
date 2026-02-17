
import React, { useState, useRef } from 'react';
import {
    ArrowLeft, Phone, Instagram, Wallet, Calendar as CalendarIcon,
    TrendingUp, History, User, CheckCircle2, Plus, Camera,
    MessageSquare, Tag, FileText, Star, Upload, File, Trash2, Download, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Input } from '../Input';
import { Heading1, Heading2, Subtitle, BodyText, Label } from '../Typography';
import { ViewMode } from '../../types';
import { clientDetailsMock } from '../../data/mockData';
import { useAppContext } from '../../context/AppContext';

interface ClientDetailsViewProps {
    onNavigate: (view: ViewMode) => void;
}

interface ClientFile {
    id: string;
    name: string;
    size: string;
    date: string;
    type: 'pdf' | 'doc' | 'image' | 'other';
}

export const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ onNavigate }) => {
    const [activeClientTab, setActiveClientTab] = useState<'data' | 'history' | 'results' | 'reviews_notes' | 'files'>('data');
    const [isEditing, setIsEditing] = useState(false);
    const { clients, appointments, selectedClientId, updateClient } = useAppContext();

    // Find the Selected Client or fallback to mock (to prevent crash if direct access)
    const foundClient = clients.find(c => c.id === selectedClientId) || clientDetailsMock;

    // Compute History & Stats from Real Appointments
    const clientHistory = appointments
        .filter(appt => appt.phone === foundClient.phone)
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()) // Sort desc
        .map(appt => ({
            id: appt.id,
            service: appt.service,
            date: `${appt.date} ${appt.time}`,
            value: appt.value,
            status: appt.status
        }));

    const totalSpent = clientHistory.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const visits = clientHistory.length;
    const avgTicket = visits > 0 ? (totalSpent / visits).toFixed(2) : '0.00';
    const lastVisit = clientHistory[0]?.date || '-';

    // Merge Real Data with Mock Structure (for missing fields like avatar, photos etc which aren't in ExtendedClient yet)
    const client = {
        ...clientDetailsMock,
        ...foundClient,
        name: foundClient.name,
        phone: foundClient.phone,
        history: clientHistory,
        totalSpent,
        visits,
        avgTicket,
        lastVisit,
        // Preserve mock arrays if real data is empty/missing
        photos: clientDetailsMock.photos,
        reviews: clientDetailsMock.reviews,
        tags: foundClient.tags || []
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Mock Files State
    const [files, setFiles] = useState<ClientFile[]>([
        { id: '1', name: 'Contrato de Prestação.pdf', size: '2.4 MB', date: '10/10/2023', type: 'pdf' },
        { id: '2', name: 'Ficha de Anamnese.pdf', size: '1.1 MB', date: '05/01/2023', type: 'pdf' },
        { id: '3', name: 'Foto Antes e Depois.jpg', size: '3.5 MB', date: '10/10/2023', type: 'image' }
    ]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles && uploadedFiles.length > 0) {
            const newFileObj = uploadedFiles[0];
            const type = newFileObj.name.endsWith('.pdf') ? 'pdf' : newFileObj.type.includes('image') ? 'image' : 'doc';

            const newFile: ClientFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: newFileObj.name,
                size: (newFileObj.size / 1024 / 1024).toFixed(2) + ' MB',
                date: new Date().toLocaleDateString('pt-BR'),
                type: type as any
            };
            setFiles(prev => [newFile, ...prev]);
        }
    };

    const handleDeleteFile = (id: string) => {
        if (confirm('Deseja remover este arquivo?')) {
            setFiles(prev => prev.filter(f => f.id !== id));
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateClient({ ...foundClient, avatar: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveInfo = (key: string, value: string) => {
        updateClient({ ...foundClient, [key]: value });
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="text-red-500" size={24} />;
            case 'image': return <Camera className="text-purple-500" size={24} />;
            default: return <File className="text-blue-500" size={24} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => onNavigate(ViewMode.CLIENTS)} className="flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-sm font-medium"><ArrowLeft size={18} /> Voltar para lista</button>

            {/* Header Card */}
            <Card className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                        {client.avatar ? (
                            <img src={client.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary/20" />
                        ) : (
                            <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary font-bold text-3xl border-2 border-brand-primary/20">{client.name?.substring(0, 2).toUpperCase()}</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                        </div>
                        <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                            <Heading1 className="text-2xl md:text-2xl">{client.name}</Heading1>
                            <Badge variant="primary">{client.visits > 3 ? 'Recorrente' : 'Novo'}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-brand-muted text-sm justify-center md:justify-start">
                            <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>
                            <span className="flex items-center gap-1 uppercase text-[10px] font-bold tracking-wider">{client.origin || 'Direto'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="h-[40px] text-sm">Agendar</Button>
                    <Button
                        variant={isEditing ? 'primary' : 'ghost'}
                        className={`h-[40px] text-sm border border-brand-border ${isEditing ? 'bg-brand-primary text-white' : ''}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Visualizar' : 'Editar'}
                    </Button>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-brand-surface rounded-xl text-brand-primary"><Wallet size={20} /></div><div><div className="text-xs text-brand-muted uppercase font-medium">Total Gasto</div><div className="text-lg font-bold text-brand-text">R$ {client.totalSpent}</div></div></Card>
                <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-brand-surface rounded-xl text-brand-primary"><CalendarIcon size={20} /></div><div><div className="text-xs text-brand-muted uppercase font-medium">Visitas</div><div className="text-lg font-bold text-brand-text">{client.visits}</div></div></Card>
                <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-brand-surface rounded-xl text-brand-primary"><TrendingUp size={20} /></div><div><div className="text-xs text-brand-muted uppercase font-medium">Ticket Médio</div><div className="text-lg font-bold text-brand-text">R$ {client.avgTicket}</div></div></Card>
                <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-brand-surface rounded-xl text-brand-primary"><History size={20} /></div><div><div className="text-xs text-brand-muted uppercase font-medium">Última Visita</div><div className="text-lg font-bold text-brand-text">{client.lastVisit}</div></div></Card>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-brand-border flex gap-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'data', label: 'Dados', icon: User },
                    { id: 'history', label: 'Histórico', icon: History },
                    { id: 'results', label: 'Resultados', icon: Camera },
                    { id: 'reviews_notes', label: 'Avaliações e Notas', icon: MessageSquare },
                    { id: 'files', label: 'Arquivos', icon: FileText } // New Tab
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveClientTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeClientTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
                    >
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in duration-300">
                {activeClientTab === 'data' && (
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Heading2 className="text-lg mb-4">Informações Pessoais</Heading2>
                                {isEditing ? (
                                    <>
                                        <div className="space-y-1">
                                            <Label>Nome Completo</Label>
                                            <Input value={client.name} onChange={(e) => handleSaveInfo('name', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>WhatsApp / Telefone</Label>
                                            <Input value={client.phone} onChange={(e) => handleSaveInfo('phone', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>E-mail</Label>
                                            <Input value={client.email || ''} onChange={(e) => handleSaveInfo('email', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Endereço</Label>
                                            <Input placeholder="Rua, Número, Bairro..." value={client.address || ''} onChange={(e) => handleSaveInfo('address', e.target.value)} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Input label="Nome Completo" value={client.name} readOnly className="bg-brand-surface" />
                                        <Input label="Telefone / WhatsApp" value={client.phone} readOnly className="bg-brand-surface" />
                                        <Input label="E-mail" value={client.email || '-'} readOnly className="bg-brand-surface" />
                                        <Input label="Endereço" value={client.address || 'Não preenchido'} readOnly className="bg-brand-surface" />
                                    </>
                                )}
                            </div>
                            <div className="space-y-4">
                                <Heading2 className="text-lg mb-4">Informações do Sistema</Heading2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Cliente Desde</Label>
                                        <div className="p-3 bg-brand-surface border border-brand-border rounded-input text-brand-text">{client.since || '10/10/2023'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Canal de Origem</Label>
                                        <div className="p-3 bg-brand-surface border border-brand-border rounded-input text-brand-text flex items-center gap-2">
                                            <User size={16} className="text-brand-primary" /> {client.origin || 'Direto'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Observações Gerais</Label>
                                    <textarea
                                        className="w-full rounded-input border border-brand-border bg-brand-surface p-4 text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none h-24 text-sm"
                                        placeholder="Preferências do cliente..."
                                        value={client.notes || ''}
                                        onChange={(e) => handleSaveInfo('notes', e.target.value)}
                                        readOnly={!isEditing}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {activeClientTab === 'history' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <Heading2>Histórico de Agendamentos</Heading2>
                            {clientHistory.length > 0 ? clientHistory.map(item => (
                                <Card key={item.id} className="flex flex-col md:flex-row items-center justify-between gap-4 p-4" noPadding>
                                    <div className="flex items-center gap-4 w-full p-4">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-brand-soft rounded-xl text-brand-primary shrink-0"><CheckCircle2 size={24} /></div>
                                        <div className="flex-1">
                                            <Subtitle>{item.service}</Subtitle>
                                            <BodyText className="text-sm">{item.date}</BodyText>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-brand-text">R$ {item.value}</div>
                                            <Badge variant={item.status === 'completed' ? 'success' : item.status === 'canceled' ? 'error' : 'primary'}>
                                                {item.status === 'completed' ? 'Concluído' : item.status === 'canceled' ? 'Cancelado' : 'Agendado'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div className="text-center py-8 text-brand-muted">Nenhum agendamento encontrado.</div>
                            )}
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <Subtitle className="mb-4">Resumo Financeiro</Subtitle>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-brand-surface rounded-lg"><span className="text-brand-muted">Total Investido</span><span className="font-bold text-brand-text">R$ {client.totalSpent}</span></div>
                                    <div className="flex justify-between items-center p-3 bg-brand-surface rounded-lg"><span className="text-brand-muted">Ticket Médio</span><span className="font-bold text-brand-text">R$ {client.avgTicket}</span></div>
                                    <div className="flex justify-between items-center p-3 bg-brand-surface rounded-lg"><span className="text-brand-muted">Serviço Favorito</span><span className="font-bold text-brand-primary">Corte + Hidratação</span></div>
                                </div>
                            </Card>
                            <Card className="h-[250px] flex flex-col">
                                <Subtitle className="mb-4">Evolução</Subtitle>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={client.spendingHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="valor" fill="#6C4CF1" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                )}

                {activeClientTab === 'results' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><Heading2>Galeria de Resultados</Heading2><Button leftIcon={<Plus size={18} />} variant="secondary">Adicionar Foto</Button></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="aspect-square bg-brand-surface border-2 border-dashed border-brand-border rounded-xl flex flex-col items-center justify-center text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer group">
                                <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Nova Foto</span>
                            </div>
                            {client.photos.map(photo => (
                                <div key={photo.id} className="aspect-square relative group rounded-xl overflow-hidden cursor-pointer">
                                    <img src={photo.url} alt={`Resultado ${photo.date}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div className="text-white text-xs font-medium flex items-center gap-1"><CalendarIcon size={12} /> {photo.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeClientTab === 'reviews_notes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <Heading2>Avaliações Recebidas</Heading2>
                            {client.reviews.length > 0 ? client.reviews.map(review => (
                                <Card key={review.id} className="p-6">
                                    <div className="flex justify-between items-start mb-2"><div className="flex gap-1 text-yellow-400">{[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}</div><span className="text-xs text-brand-muted">{review.date}</span></div>
                                    <BodyText className="italic text-brand-text">"{review.comment}"</BodyText>
                                </Card>
                            )) : (
                                <Card className="text-center py-12"><MessageSquare className="mx-auto text-brand-muted mb-3 opacity-50" size={48} /><BodyText>Nenhuma avaliação registrada ainda.</BodyText></Card>
                            )}
                        </div>
                        <div className="space-y-6">
                            <Card className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2"><FileText size={20} className="text-brand-primary" /><Subtitle>Observações Internas</Subtitle></div>
                                <textarea className="w-full rounded-input border border-brand-border bg-brand-surface p-4 text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none h-32 text-sm" placeholder="Notas sobre preferências, alergias ou detalhes importantes..."></textarea>
                                <Button variant="secondary" className="w-full h-9 text-sm">Salvar Nota</Button>
                            </Card>
                            <Card className="p-6 space-y-6">
                                <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Tag size={20} className="text-brand-primary" /><Subtitle>Tags</Subtitle></div><Button variant="ghost" className="h-8 w-8 p-0 rounded-full"><Plus size={16} /></Button></div>
                                <div className="flex flex-wrap gap-3">{client.tags.map(tag => (<div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-brand-soft text-brand-primary rounded-lg font-medium text-xs group cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors border border-brand-primary/10">{tag}<span className="w-0 overflow-hidden group-hover:w-auto transition-all">x</span></div>))}</div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeClientTab === 'files' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <Heading2>Arquivos e Documentos</Heading2>
                                <BodyText>Fichas de anamnese, contratos e documentos.</BodyText>
                            </div>
                            <Button leftIcon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()}>
                                Upload de Arquivo
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>

                        {/* Upload Dropzone Simulation */}
                        <div
                            className="border-2 border-dashed border-brand-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-brand-soft/20 hover:border-brand-primary/50 transition-all cursor-pointer bg-brand-surface/30"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-brand-surface rounded-full text-brand-muted mb-3 shadow-sm">
                                <Upload size={32} strokeWidth={1.5} />
                            </div>
                            <p className="font-medium text-brand-text">Clique para fazer upload</p>
                            <p className="text-xs text-brand-muted mt-1">PDF, DOCX ou JPG (Máx. 10MB)</p>
                        </div>

                        {/* Files List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.length > 0 ? files.map(file => (
                                <Card key={file.id} className="p-4 flex items-start gap-3 group relative overflow-hidden" noPadding>
                                    <div className="p-3 bg-brand-surface rounded-lg shrink-0">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-brand-text truncate pr-6">{file.name}</div>
                                        <div className="text-xs text-brand-muted flex items-center gap-2 mt-1">
                                            <span>{file.date}</span>
                                            <span>•</span>
                                            <span>{file.size}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-brand-surface rounded-lg text-brand-muted hover:text-brand-primary" title="Baixar">
                                            <Download size={16} />
                                        </button>
                                        <button
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-brand-muted hover:text-red-500"
                                            title="Excluir"
                                            onClick={() => handleDeleteFile(file.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </Card>
                            )) : (
                                <div className="col-span-full py-12 text-center text-brand-muted">
                                    Nenhum arquivo anexado a este cliente.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
