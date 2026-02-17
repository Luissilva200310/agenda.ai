
import React, { useState, useRef } from 'react';
import {
    User, Building2, Bell, Shield, Moon, Sun, Camera,
    MapPin, Clock, LogOut, Check, Mail, Smartphone, Globe,
    LayoutTemplate, Image as ImageIcon, Palette, Link as LinkIcon, Upload, Sparkles, Layout
} from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input, Select, TextArea } from '../Input';
import { Heading2, Subtitle, BodyText, Label } from '../Typography';
import { Badge } from '../Badge';
import { BusinessSettings } from '../../types';
import { useAppContext } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
    const {
        isDarkMode,
        toggleTheme,
        currentTheme,
        changeTheme,
        businessSettings: settings,
        updateBusinessSettings,
        uploadImage
    } = useAppContext();

    const [isSaving, setIsSaving] = useState(false);


    const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'booking_page' | 'preferences' | 'security'>('profile');

    // Password Change State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        await updateBusinessSettings(settings);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };


    const handlePasswordChange = () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            setPasswordError('Preencha todos os campos.');
            return;
        }
        if (passwordData.new.length < 6) {
            setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            setPasswordError('As senhas não coincidem.');
            return;
        }
        // Mock success
        setPasswordSuccess('Senha atualizada com sucesso!');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    // Helper to update settings both locally and globally
    const updateSettings = (updates: Partial<BusinessSettings>) => {
        updateBusinessSettings(updates);
    };


    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsSaving(true);
            const url = await uploadImage('logos', file);
            if (url) updateSettings({ coverImage: url });
            setIsSaving(false);
        }
    };


    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsSaving(true);
            const url = await uploadImage('logos', file);
            if (url) updateSettings({ logo: url });
            setIsSaving(false);
        }
    };


    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const tabs = [
        { id: 'profile', label: 'Meu Perfil', icon: User },
        { id: 'business', label: 'Dados do Negócio', icon: Building2 },
        { id: 'booking_page', label: 'Página de Agendamento', icon: LayoutTemplate },
        { id: 'preferences', label: 'Preferências', icon: Bell },
        { id: 'security', label: 'Segurança', icon: Shield },
    ];

    const themeColors = [
        { name: 'Roxo (Padrão)', class: 'from-brand-primary to-purple-400', hex: '#6C4CF1' },
        { name: 'Rosa', class: 'from-pink-500 to-rose-400', hex: '#EC4899' },
        { name: 'Dourado', class: 'from-amber-500 to-yellow-400', hex: '#F59E0B' },
        { name: 'Verde', class: 'from-emerald-500 to-teal-400', hex: '#10B981' },
        { name: 'Preto', class: 'from-gray-900 to-gray-700', hex: '#111827' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="mb-6">
                <Heading2>Configurações</Heading2>
                <BodyText className="mt-1">Gerencie seu perfil, preferências e dados do negócio.</BodyText>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <Card className="lg:w-64 h-fit p-2" noPadding>
                    <div className="flex flex-col">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left
                                    ${activeTab === tab.id
                                        ? 'bg-brand-soft text-brand-primary'
                                        : 'text-brand-muted hover:bg-brand-surface hover:text-brand-text'
                                    }
                                `}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Content Area */}
                <div className="flex-1 space-y-6">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in">
                            <Card className="relative overflow-hidden" noPadding>
                                <div className={`h-32 bg-gradient-to-r ${settings.coverColor} w-full`}>
                                    {settings.coverImage && <img src={settings.coverImage} alt="Cover" className="w-full h-full object-cover" />}
                                </div>
                                <div className="relative px-6 pb-6 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                            <div className="w-full h-full rounded-full bg-brand-surface flex items-center justify-center text-xl font-bold text-brand-primary overflow-hidden relative group cursor-pointer">
                                                {settings.logo ? (
                                                    <img src={settings.logo} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>Logo</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 mb-2 pt-12 md:pt-0 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-brand-text">{settings.ownerName}</h3>
                                        <p className="text-brand-muted">{settings.ownerTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {saveSuccess && <Badge variant="success" className="animate-in fade-in zoom-in h-8">Salvo!</Badge>}
                                        <Button
                                            className="mb-2 w-full md:w-auto"
                                            onClick={handleSaveSettings}
                                            loading={isSaving}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                    </div>

                                </div>
                            </Card>

                            <Card className="space-y-4">
                                <Subtitle>Informações Pessoais</Subtitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nome Completo"
                                        value={settings.ownerName}
                                        onChange={(e) => updateSettings({ ownerName: e.target.value })}
                                    />
                                    <Input
                                        label="Cargo / Título"
                                        value={settings.ownerTitle}
                                        onChange={(e) => updateSettings({ ownerTitle: e.target.value })}
                                    />
                                    <Input
                                        label="E-mail"
                                        value={settings.email}
                                        onChange={(e) => updateSettings({ email: e.target.value })}
                                        icon={<Mail size={18} />}
                                    />
                                    <Input
                                        label="Telefone"
                                        value={settings.phone}
                                        onChange={(e) => updateSettings({ phone: e.target.value })}
                                        icon={<Smartphone size={18} />}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>Bio (Sobre mim)</Label>
                                    <TextArea
                                        placeholder="Conte um pouco sobre sua experiência..."
                                        value={settings.description}
                                        onChange={(e) => updateSettings({ description: e.target.value })}
                                        className="h-24"
                                    />
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* BOOKING PAGE CUSTOMIZATION TAB */}
                    {activeTab === 'booking_page' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Subtitle>Personalizar Link de Agendamento</Subtitle>
                                    <BodyText className="text-sm">Edite como seus clientes veem sua página.</BodyText>
                                </div>
                                <Button variant="secondary" leftIcon={<Globe size={16} />} onClick={() => window.open(`?view=public`, '_blank')}>
                                    Visualizar Página
                                </Button>
                            </div>

                            {/* Live Preview / Visual Editor */}
                            <Card className="relative overflow-hidden group" noPadding>
                                {/* Cover Area */}
                                <div className={`h-40 bg-gradient-to-r ${settings.coverColor} w-full relative transition-all duration-500 overflow-hidden`}>
                                    {settings.coverImage && <img src={settings.coverImage} alt="Cover" className="w-full h-full object-cover" />}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        <Button variant="ghost" className="text-white hover:bg-white/20 border-white/40 border" onClick={() => coverInputRef.current?.click()}>
                                            <ImageIcon size={18} className="mr-2" /> Alterar Capa
                                        </Button>
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="relative px-6 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16">
                                    {/* Logo/Avatar */}
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl">
                                            <div
                                                className="w-full h-full rounded-full bg-brand-surface flex items-center justify-center text-3xl font-bold text-brand-primary overflow-hidden relative group/avatar cursor-pointer border border-brand-border"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                {settings.logo ? (
                                                    <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-brand-primary">SG</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                    <Camera size={24} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Info Preview */}
                                    <div className="flex-1 mb-2 pt-16 md:pt-0 text-center md:text-left space-y-1">
                                        <h3 className="text-2xl font-bold text-brand-text">{settings.businessName}</h3>
                                        <p className="text-brand-muted max-w-lg mx-auto md:mx-0 text-sm">{settings.description}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Hidden Inputs for File Upload */}
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />

                            {/* Forms */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <LinkIcon size={20} className="text-brand-primary" />
                                        <Subtitle>Endereço do Link</Subtitle>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="mb-1.5 block">URL do seu negócio</Label>
                                            <div className="flex items-center">
                                                <span className="bg-brand-surface border border-r-0 border-brand-border rounded-l-input px-3 py-2.5 text-brand-muted text-sm h-[44px] flex items-center">
                                                    agenda.beauty/
                                                </span>
                                                <input
                                                    type="text"
                                                    value={settings.slug}
                                                    onChange={(e) => updateSettings({ slug: e.target.value })}
                                                    className="flex-1 h-[44px] rounded-r-input border border-brand-border px-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            label="Nome Público do Negócio"
                                            value={settings.businessName}
                                            onChange={(e) => updateSettings({ businessName: e.target.value })}
                                        />
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Descrição Curta (Bio)</Label>
                                            <TextArea
                                                className="h-24 text-sm"
                                                value={settings.description}
                                                onChange={(e) => updateSettings({ description: e.target.value })}
                                                maxLength={150}
                                            />
                                            <div className="text-xs text-right text-brand-muted">{settings.description.length}/150</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Palette size={20} className="text-brand-primary" />
                                        <Subtitle>Aparência e Cores</Subtitle>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Cor Principal do Tema</Label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {themeColors.map((color) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => updateSettings({ coverColor: color.class, themeColor: color.hex })}
                                                    className={`
                                                        aspect-square rounded-full bg-gradient-to-br ${color.class}
                                                        flex items-center justify-center transition-transform hover:scale-110 shadow-sm
                                                        ${settings.coverColor === color.class ? 'ring-4 ring-brand-surface ring-offset-2 ring-offset-brand-border scale-110' : ''}
                                                    `}
                                                    title={color.name}
                                                >
                                                    {settings.coverColor === color.class && <Check size={16} className="text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-brand-surface rounded-xl border border-brand-border mt-4">
                                            <Label className="mb-2 block">Uploads Personalizados</Label>
                                            <div className="space-y-3">
                                                <Button variant="secondary" className="w-full justify-start text-sm h-10" leftIcon={<Upload size={16} />} onClick={() => logoInputRef.current?.click()}>
                                                    Carregar Logo do Negócio
                                                </Button>
                                                <Button variant="secondary" className="w-full justify-start text-sm h-10" leftIcon={<Upload size={16} />} onClick={() => coverInputRef.current?.click()}>
                                                    Carregar Foto de Capa
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-brand-border">
                                <Button className="w-full md:w-auto">Salvar Alterações</Button>
                            </div>
                        </div>
                    )}

                    {/* BUSINESS TAB */}
                    {activeTab === 'business' && (
                        <div className="space-y-6 animate-in fade-in">
                            <Card className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Subtitle>Dados do Estabelecimento</Subtitle>
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Nome do Negócio" value={settings.businessName} onChange={(e) => updateSettings({ businessName: e.target.value })} icon={<Building2 size={18} />} />
                                    <Select label="Segmento">
                                        <option>Salão de Beleza</option>
                                        <option>Estética</option>
                                        <option>Barbearia</option>
                                    </Select>
                                    <Input label="CNPJ (Opcional)" placeholder="00.000.000/0000-00" />
                                    <Input
                                        label="Instagram"
                                        value={settings.slug ? `@${settings.slug}` : ''}
                                        onChange={(e) => updateSettings({ slug: e.target.value.replace('@', '') })}
                                    />
                                </div>
                            </Card>

                            <Card className="space-y-4">
                                <Subtitle>Endereço e Localização</Subtitle>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <Input label="CEP" placeholder="00000-000" icon={<MapPin size={18} />} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Endereço"
                                            value={settings.address}
                                            onChange={(e) => updateSettings({ address: e.target.value })}
                                            placeholder="Rua das Flores, 123"
                                        />
                                    </div>
                                    <Input label="Bairro" placeholder="Centro" />
                                    <Input label="Cidade" placeholder="São Paulo" />
                                    <Input label="Estado" placeholder="SP" />
                                </div>
                            </Card>

                            <Card className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Subtitle>Horário de Funcionamento</Subtitle>
                                    <Badge variant="success">Aberto Agora</Badge>
                                </div>
                                <div className="space-y-3">
                                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => (
                                        <div key={day} className="flex items-center justify-between p-3 border border-brand-border rounded-lg bg-brand-surface/30">
                                            <span className="font-medium text-brand-text w-24">{day}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-white border border-brand-border px-3 py-1 rounded-md text-sm text-brand-text">{settings.openTime}</div>
                                                <span className="text-brand-muted">-</span>
                                                <div className="bg-white border border-brand-border px-3 py-1 rounded-md text-sm text-brand-text">{settings.closeTime}</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.openDays.includes(day.substring(0, 3))}
                                                    onChange={() => {
                                                        const shortDay = day.substring(0, 3);
                                                        const newDays = settings.openDays.includes(shortDay)
                                                            ? settings.openDays.filter(d => d !== shortDay)
                                                            : [...settings.openDays, shortDay];
                                                        updateSettings({ openDays: newDays });
                                                    }}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>
                                    ))}
                                    <div key="Domingo" className="flex items-center justify-between p-3 border border-brand-border rounded-lg bg-brand-surface/30 opacity-60">
                                        <span className="font-medium text-brand-text w-24">Domingo</span>
                                        <span className="text-sm text-brand-muted flex-1 text-center">Fechado</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6 animate-in fade-in">
                            <Card className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout size={20} className="text-brand-primary" />
                                    <Subtitle>Tema do Sistema</Subtitle>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => changeTheme?.('default')}
                                        className={`relative p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left group ${currentTheme === 'default' ? 'border-brand-primary bg-brand-soft/20' : 'border-brand-border hover:border-brand-primary/50'}`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-white border border-brand-border shadow-sm flex items-center justify-center text-brand-primary">
                                            <LayoutTemplate size={24} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-brand-text">Padrão Clean</div>
                                            <div className="text-xs text-brand-muted mt-1">Design minimalista e profissional.</div>
                                        </div>
                                        {currentTheme === 'default' && <div className="absolute top-4 right-4 text-brand-primary"><Check size={20} /></div>}
                                    </button>

                                    <button
                                        onClick={() => changeTheme?.('aurora')}
                                        className={`relative p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left group overflow-hidden ${currentTheme === 'aurora' ? 'border-brand-primary' : 'border-brand-border hover:border-brand-primary/50'}`}
                                    >
                                        {/* Aurora Preview Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#A98BFF] via-[#8FA8FF] to-[#FF9DCE] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                                        <div className="w-12 h-12 rounded-lg bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm flex items-center justify-center text-[#7B61FF] relative z-10">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="font-semibold text-brand-text">Aurora Glass</div>
                                            <div className="text-xs text-brand-muted mt-1">Gradientes, blur e modernidade.</div>
                                        </div>
                                        {currentTheme === 'aurora' && <div className="absolute top-4 right-4 text-brand-primary relative z-10"><Check size={20} /></div>}
                                    </button>
                                </div>
                            </Card>

                            <Card className="space-y-6">
                                <Subtitle>Aparência</Subtitle>
                                <div className="flex items-center justify-between p-4 border border-brand-border rounded-xl bg-brand-surface">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-brand-text">Modo Escuro</p>
                                            <p className="text-sm text-brand-muted">Ajuste o tema para reduzir o cansaço visual.</p>
                                        </div>
                                    </div>
                                    <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-brand-primary' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </Card>

                            <Card className="space-y-4">
                                <Subtitle>Notificações</Subtitle>
                                <div className="space-y-2">
                                    {[
                                        { title: 'Lembretes de Agendamento', desc: 'Receba alertas quando um cliente agendar.' },
                                        { title: 'Relatórios Semanais', desc: 'Resumo do seu desempenho por e-mail.' },
                                        { title: 'Novidades e Dicas', desc: 'Dicas de gestão para seu negócio.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-brand-surface rounded-lg transition-colors">
                                            <div>
                                                <p className="font-medium text-brand-text">{item.title}</p>
                                                <p className="text-sm text-brand-muted">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in">
                            <Card className="space-y-4">
                                <Subtitle>Alterar Senha</Subtitle>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Senha Atual"
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    />
                                    <Input
                                        label="Nova Senha"
                                        type="password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                    <Input
                                        label="Confirmar Nova Senha"
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    />
                                    {passwordError && <p className="text-sm text-brand-danger">{passwordError}</p>}
                                    {passwordSuccess && <p className="text-sm text-brand-success">{passwordSuccess}</p>}
                                    <Button variant="secondary" onClick={handlePasswordChange}>Atualizar Senha</Button>
                                </div>
                            </Card>

                            <Card className="border-l-4 border-l-brand-danger bg-red-50/10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Subtitle className="text-brand-danger">Zona de Perigo</Subtitle>
                                        <BodyText className="text-sm mt-1">Ações que não podem ser desfeitas.</BodyText>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-3">
                                    <Button variant="ghost" className="justify-start text-brand-danger hover:bg-red-50 hover:text-red-600">
                                        <LogOut size={18} /> Sair da Conta
                                    </Button>
                                    <Button variant="ghost" className="justify-start text-brand-danger hover:bg-red-50 hover:text-red-600">
                                        Excluir minha conta permanentemente
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
