
import React, { useState, useRef } from 'react';
import { Plus, LayoutList, Scissors, Layers, Percent, Search, Clock, Edit2, MoreHorizontal, DollarSign, Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Input, Select, TextArea } from '../Input';
import { Modal } from '../Modal';
import { Heading2, BodyText, Label } from '../Typography';
import { ServiceItem } from '../../types';
import { useAppContext } from '../../context/AppContext';

export const ServicesView: React.FC = () => {
    const { services, setServices } = useAppContext();


    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeServiceTab, setActiveServiceTab] = useState<'all' | 'service' | 'combo' | 'offer'>('all');
    const [serviceSearch, setServiceSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Data State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ServiceItem>>({
        type: 'service',
        name: '',
        price: 0,
        duration: 45,
        category: '',
        description: '',
        image: undefined,
        validUntil: undefined,
        originalPrice: undefined
    });

    const filteredServices = services.filter(s => {
        if (activeServiceTab === 'all') return true;
        return s.type === activeServiceTab;
    }).filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category.toLowerCase().includes(serviceSearch.toLowerCase()));

    // Handlers
    const handleOpenNew = () => {
        setEditingId(null);
        setFormData({
            type: 'service',
            name: '',
            price: 0,
            duration: 45,
            category: '',
            description: '',
            image: undefined
        });
        setIsModalOpen(true);
    };

    const handleEdit = (service: ServiceItem) => {
        setEditingId(service.id);
        setFormData({ ...service });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: undefined }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = () => {
        if (!formData.name || !formData.price) return; // Basic validation

        if (editingId) {
            // Edit existing
            setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } as ServiceItem : s));
        } else {
            // Create new
            const newService: ServiceItem = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData as ServiceItem
            };
            setServices(prev => [...prev, newService]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Heading2>Catálogo de Serviços</Heading2>
                    <BodyText className="mt-1">Gerencie seus serviços, preços e combos promocionais.</BodyText>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={handleOpenNew}>Novo Item</Button>
            </div>

            <div className="border-b border-brand-border flex gap-6 overflow-x-auto no-scrollbar">{[{ id: 'all', label: 'Todos', icon: LayoutList }, { id: 'service', label: 'Serviços', icon: Scissors }, { id: 'combo', label: 'Combos', icon: Layers }, { id: 'offer', label: 'Ofertas', icon: Percent }].map(tab => (<button key={tab.id} onClick={() => setActiveServiceTab(tab.id as any)} className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeServiceTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}><tab.icon size={16} />{tab.label}</button>))}</div>
            <div className="flex gap-4"><Input placeholder="Buscar por nome ou categoria..." icon={<Search size={18} />} className="max-w-md" value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} /></div>

            <div className="space-y-3">
                {filteredServices.map(s => (
                    <Card key={s.id} className="hover:border-brand-primary transition-all group" noPadding>
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Image / Icon Logic */}
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-brand-border ${!s.image ? (s.type === 'combo' ? 'bg-purple-50 text-purple-600' : s.type === 'offer' ? 'bg-orange-50 text-orange-600' : 'bg-brand-soft text-brand-primary') : 'bg-white'}`}>
                                    {s.image ? (
                                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                    ) : (
                                        s.type === 'combo' ? <Layers size={24} /> : s.type === 'offer' ? <Percent size={24} /> : <Scissors size={24} />
                                    )}
                                </div>

                                <div>
                                    <div className="font-medium text-brand-text flex items-center gap-2 flex-wrap">
                                        {s.name}
                                        {s.category && <Badge variant="neutral" className="bg-brand-soft text-brand-primary border-none text-[10px] py-0 h-5 px-2">{s.category}</Badge>}
                                        {s.type === 'combo' && <Badge variant="primary" className="text-[10px] py-0 h-5">Combo</Badge>}
                                        {s.type === 'offer' && <Badge variant="warning" className="text-[10px] py-0 h-5">Oferta</Badge>}
                                        {s.validUntil && <Badge variant="neutral" className="text-[10px] py-0 h-5 bg-gray-100 text-gray-500">Expira: {new Date(s.validUntil).toLocaleDateString('pt-BR')}</Badge>}
                                    </div>
                                    <div className="text-sm text-brand-muted flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {s.duration} min</span>
                                        {s.includedServices && (
                                            <span className="text-xs text-brand-text bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border line-clamp-1">
                                                Inclui: {s.includedServices.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-brand-border pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <div className="text-right">
                                    {s.type === 'offer' && s.originalPrice && (
                                        <div className="text-xs text-brand-muted line-through decoration-red-400">R$ {s.originalPrice},00</div>
                                    )}
                                    <div className={`font-semibold text-lg ${s.type === 'offer' ? 'text-green-600' : 'text-brand-text'}`}>
                                        R$ {s.price},00
                                    </div>
                                    {s.usageCount && s.usageCount > 0 && (
                                        <div className="text-[10px] text-brand-primary font-medium mt-1">
                                            {s.usageCount} realizado{s.usageCount > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(s)}
                                        className="p-2 hover:bg-brand-surface rounded-full text-brand-muted hover:text-brand-primary transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2 hover:bg-red-50 rounded-full text-brand-muted hover:text-red-500 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredServices.length === 0 && (
                    <div className="text-center py-12 bg-brand-surface/50 rounded-card border border-brand-border border-dashed">
                        <Scissors className="mx-auto text-brand-muted mb-3 opacity-50" size={32} />
                        <BodyText>Nenhum item encontrado.</BodyText>
                    </div>
                )}
            </div>

            {/* Modal de Criação / Edição */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Item" : "Cadastrar Novo Item"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>{editingId ? "Salvar Alterações" : "Criar Item"}</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Tipo Selector */}
                    <div className="bg-brand-surface p-1 rounded-xl flex gap-1 border border-brand-border mb-4">
                        {[{ id: 'service', label: 'Serviço' }, { id: 'combo', label: 'Combo' }, { id: 'offer', label: 'Oferta' }].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setFormData({ ...formData, type: type.id as any })}
                                className={`
                                    flex-1 py-2 text-sm font-medium rounded-lg transition-all 
                                    ${formData.type === type.id
                                        ? 'bg-white text-brand-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-brand-muted hover:text-brand-text'
                                    }
                                `}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Image Upload Area */}
                    <div className="flex justify-center">
                        <div className="w-full">
                            <Label className="mb-2 block">Foto do Serviço</Label>
                            {formData.image ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-brand-border">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-brand-text hover:text-brand-primary">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={handleRemoveImage} className="p-2 bg-white rounded-full text-brand-danger hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-brand-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-soft/30 transition-all text-brand-muted hover:text-brand-primary"
                                >
                                    <ImageIcon size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Clique para adicionar foto</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <Input
                        label={formData.type === 'combo' ? "Nome do Combo" : "Nome do Serviço"}
                        placeholder={formData.type === 'combo' ? "Ex: Dia de Noiva" : "Ex: Corte e Escova"}
                        icon={formData.type === 'combo' ? <Layers size={18} /> : <Scissors size={18} />}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    {formData.type === 'offer' && (
                        <div className="space-y-2">
                            <Label>Basear em Serviço Existente (Smart Offer)</Label>
                            <Select
                                value=""
                                onChange={(e) => {
                                    const serviceId = e.target.value;
                                    const service = services.find(s => s.id === serviceId);
                                    if (service) {
                                        setFormData(prev => ({
                                            ...prev,
                                            name: `Oferta: ${service.name}`,
                                            originalPrice: service.price,
                                            price: Math.round(service.price * 0.8), // 20% off default
                                            duration: service.duration,
                                            image: service.image,
                                            description: service.description,
                                            category: service.category
                                        }));
                                    }
                                }}
                            >
                                <option value="">Selecione para preencher...</option>
                                {services.filter(s => s.type === 'service').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {formData.type === 'combo' && (
                        <div className="space-y-2">
                            <Label>Selecione os serviços inclusos</Label>
                            <div className="max-h-40 overflow-y-auto border border-brand-border rounded-input p-2 space-y-1 bg-brand-surface/30">
                                {services.filter(s => s.type === 'service').map(s => (
                                    <div key={s.id} className="flex items-center gap-2 p-2 hover:bg-brand-soft rounded cursor-pointer group">
                                        <input type="checkbox" className="rounded text-brand-primary focus:ring-brand-primary" />
                                        <span className="flex-1 text-sm text-brand-text">{s.name}</span>
                                        <span className="text-xs text-brand-muted">R$ {s.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {formData.type === 'offer' && (
                            <Input
                                label="Valor Original (R$)"
                                type="number"
                                placeholder="0,00"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                            />
                        )}
                        <Input
                            label={formData.type === 'offer' ? "Valor Promocional (R$)" : "Valor (R$)"}
                            type="number"
                            placeholder="0,00"
                            icon={<DollarSign size={18} />}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                        <Input
                            label="Duração Total (min)"
                            type="number"
                            placeholder="45"
                            icon={<Clock size={18} />}
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        />
                    </div>

                    {formData.type === 'offer' && (
                        <div className="flex flex-col gap-1.5">
                            <Input
                                label="Válido Até"
                                type="date"
                                value={formData.validUntil || ''}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label>Categoria</Label>
                        <div className="relative">
                            <Input
                                list="categories-list"
                                placeholder="Selecione ou digite uma nova..."
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                            <datalist id="categories-list">
                                {Array.from(new Set(services.map(s => s.category))).sort().map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Descrição (Opcional)</Label>
                        <TextArea
                            className="h-24"
                            placeholder="Descreva detalhes, regras ou inclusões..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
