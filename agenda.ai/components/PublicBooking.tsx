
import React, { useState } from 'react';
import { ChevronLeft, Calendar as CalIcon, Clock, CheckCircle, Smartphone, User, Sparkles, LogOut, Scissors, Layers, Percent, MapPin, Phone, History } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Heading1, Heading2, Subtitle, BodyText, Label } from './Typography';
import { Modal } from './Modal';
import { Input, Select } from './Input';
import { ViewMode, ServiceItem, ExtendedClient, BusinessSettings } from '../types';
import { formatDateKey } from '../utils/formatters';

interface PublicProps {
    view: ViewMode;
    onNavigate: (view: ViewMode) => void;
    services: ServiceItem[];
    appointments: ExtendedClient[];
    businessSettings: BusinessSettings;
    onBookingComplete: (appt: ExtendedClient) => void;
}

// --- Layout Component (Moved Outside to prevent re-renders) ---
interface PublicLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    noPadding?: boolean;
    businessSettings: BusinessSettings;
    onBack?: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
    children,
    title,
    showBack = true,
    noPadding = false,
    businessSettings,
    onBack
}) => (
    <div className="min-h-screen bg-brand-surface flex justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Branding Header */}
            <div className="text-center mb-8 relative">
                <div className={`h-32 w-full absolute top-0 left-0 rounded-t-3xl -z-10 overflow-hidden transform -translate-y-10 scale-110`}>
                    {businessSettings.coverImage ? (
                        <img src={businessSettings.coverImage} className="w-full h-full object-cover blur-sm opacity-50" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${businessSettings.coverColor} opacity-20 blur-xl`}></div>
                    )}
                </div>

                <div className="w-20 h-20 bg-white rounded-full mx-auto shadow-md flex items-center justify-center text-2xl mb-3 border-4 border-white overflow-hidden relative">
                    {businessSettings.logo ? (
                        <img src={businessSettings.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-brand-primary">{businessSettings.businessName.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
                <Heading2>{businessSettings.businessName}</Heading2>
                <BodyText className="text-sm max-w-xs mx-auto mt-1">{businessSettings.description}</BodyText>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-brand-muted">
                    {businessSettings.phone && <span className="flex items-center gap-1"><Phone size={12} /> {businessSettings.phone}</span>}
                    {businessSettings.address && <span className="flex items-center gap-1"><MapPin size={12} /> {businessSettings.address}</span>}
                </div>
            </div>

            {/* Content Card */}
            <Card className={`relative overflow-hidden shadow-xl border-0 ${noPadding ? '' : 'p-6'}`} noPadding={noPadding}>
                {showBack && onBack && (
                    <button
                        onClick={onBack}
                        className="absolute left-4 top-4 text-brand-muted hover:text-brand-text z-10 bg-white/80 p-1 rounded-full backdrop-blur-sm"
                    >
                        <ChevronLeft />
                    </button>
                )}
                <div className={`${showBack && !noPadding ? 'pt-8' : ''} space-y-6`}>
                    {title && <Heading2 className="text-center text-lg">{title}</Heading2>}
                    {children}
                </div>
            </Card>
        </div>
    </div>
);

export const PublicBooking: React.FC<PublicProps> = ({
    view,
    onNavigate,
    services,
    appointments,
    businessSettings,
    onBookingComplete
}) => {

    // Booking State
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos'); // New state

    // Client Form State
    const [clientForm, setClientForm] = useState({
        name: '',
        phone: '',
        origin: ''
    });

    // Logged In Client State (for History View)
    const [loggedInClientPhone, setLoggedInClientPhone] = useState<string | null>(null);

    const selectedService = services.find(s => s.id === selectedServiceId);


    // Mock Popularity Tags
    const getServiceTags = (index: number) => {
        if (index === 0) return { label: 'Mais Pedido', color: 'bg-rose-100 text-rose-700' };
        if (index === 1) return { label: 'Popular', color: 'bg-blue-100 text-blue-700' };
        return null;
    };

    // --- HELPERS ---

    // Generate available slots based on duration and existing appointments
    const getAvailableSlots = (date: Date, durationMinutes: number) => {
        const dateKey = formatDateKey(date);
        const dayAppointments = appointments.filter(a => a.date === dateKey);

        const slots: string[] = [];
        const startHour = 9; // 09:00
        const endHour = 18; // 18:00

        // Simple slot generation every 30 mins
        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                // Basic overlap check
                const isTaken = dayAppointments.some(appt => {
                    return appt.time === timeString;
                });

                if (!isTaken) {
                    slots.push(timeString);
                }
            }
        }
        return slots;
    };

    const calculateEndTime = (startTime: string, duration: number) => {
        const [h, m] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + duration);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleConfirmBooking = () => {
        if (!selectedService || !selectedTime) return;

        const newAppt: ExtendedClient = {
            id: Math.random().toString(36).substr(2, 9),
            name: clientForm.name,
            phone: clientForm.phone,
            service: selectedService.name,
            time: selectedTime,
            endTime: calculateEndTime(selectedTime, selectedService.duration),
            date: formatDateKey(selectedDate),
            status: 'confirmed', // Auto-confirm for this demo
            value: selectedService.price,
            totalSpent: 0,
            origin: clientForm.origin
        };

        onBookingComplete(newAppt);
        setLoggedInClientPhone(clientForm.phone); // Log them in automatically
        onNavigate(ViewMode.PUBLIC_SUCCESS);
    };

    const getClientHistory = () => {
        if (!loggedInClientPhone) return [];
        return appointments.filter(a => a.phone === loggedInClientPhone).sort((a, b) => b.date?.localeCompare(a.date || '') || 0);
    };

    const getPrevView = (current: ViewMode) => {
        if (current === ViewMode.PUBLIC_DATE) return ViewMode.PUBLIC_SERVICE;
        if (current === ViewMode.PUBLIC_TIME) return ViewMode.PUBLIC_DATE;
        if (current === ViewMode.PUBLIC_REVIEW) return ViewMode.PUBLIC_TIME;
        return ViewMode.PUBLIC_SERVICE;
    }

    // Categories
    const categories = ['Todos', ...Array.from(new Set(services.map(s => s.category)))];
    const filteredServices = selectedCategory === 'Todos' ? services : services.filter(s => s.category === selectedCategory);

    // --- RENDERERS ---

    // 1. SELECT SERVICE
    if (view === ViewMode.PUBLIC_SERVICE) {
        return (
            <PublicLayout
                title="Escolha um serviço"
                showBack={false}
                noPadding
                businessSettings={businessSettings}
            >
                <div className="flex justify-end px-4 pt-2">
                    <button onClick={() => onNavigate(ViewMode.PUBLIC_LOGIN)} className="text-xs text-brand-primary font-medium hover:underline">
                        Já sou cliente? Entrar
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${selectedCategory === cat
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="max-h-[55vh] overflow-y-auto custom-scrollbar px-2">
                    <div className="space-y-3 pb-4">
                        {filteredServices.map((s, index) => {
                            const tag = getServiceTags(index);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedServiceId(s.id)}
                                    className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 border ${selectedServiceId === s.id
                                        ? 'bg-brand-soft border-brand-primary shadow-md ring-1 ring-brand-primary/20'
                                        : 'bg-white border-brand-border hover:border-brand-primary/50 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 ${selectedServiceId === s.id ? 'scale-105 shadow-sm' : ''} ${s.image ? 'bg-white' : 'bg-brand-surface text-brand-primary'}`}>
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                s.type === 'combo' ? <Layers size={22} /> : s.type === 'offer' ? <Percent size={22} /> : <Scissors size={22} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <Subtitle className={`text-[15px] font-bold transition-colors ${selectedServiceId === s.id ? 'text-brand-primary' : 'text-brand-text'}`}>
                                                        {s.name}
                                                    </Subtitle>
                                                </div>
                                                <div className="flex gap-1 items-center">
                                                    {tag && <span className={`${tag.color} text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider`}>{tag.label}</span>}
                                                    {s.type === 'offer' && <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">OFERTA</span>}
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedServiceId === s.id ? 'bg-brand-primary border-brand-primary' : 'border-brand-border group-hover:border-brand-primary/30'}`}>
                                                        {selectedServiceId === s.id && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-brand-muted mt-1.5 line-clamp-2 leading-relaxed">{s.description || 'Sem descrição.'}</div>
                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-border/30">
                                                <span className="text-[11px] font-medium text-brand-muted flex items-center gap-1.5 bg-brand-surface px-2 py-1 rounded-md">
                                                    <Clock size={12} className="text-brand-primary/60" /> {s.duration} min
                                                </span>
                                                <div className="text-right">
                                                    {s.originalPrice && <span className="text-xs text-brand-muted line-through mr-2">R$ {s.originalPrice}</span>}
                                                    <span className={`font-bold text-base ${selectedServiceId === s.id ? 'text-brand-primary' : 'text-brand-text'}`}>
                                                        R$ {s.price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {filteredServices.length === 0 && (
                            <div className="p-12 text-center text-brand-muted italic bg-brand-surface rounded-2xl border border-dashed border-brand-border">
                                Nenhum serviço disponível nesta categoria.
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-brand-border bg-white/80 backdrop-blur-md sticky bottom-0 z-20 rounded-b-card">
                    <Button
                        className={`w-full h-12 text-base font-bold transition-all duration-500 ${!selectedServiceId ? 'opacity-50 scale-95 grayscale' : 'shadow-lg shadow-brand-primary/25'}`}
                        disabled={!selectedServiceId}
                        onClick={() => onNavigate(ViewMode.PUBLIC_DATE)}
                    >
                        Continuar para Data
                    </Button>
                </div>
            </PublicLayout>
        );
    }

    // 1.5. SELECT PROFESSIONAL (REMOVED FROM FLOW)

    // 2. SELECT DATE
    if (view === ViewMode.PUBLIC_DATE) {
        return (
            <PublicLayout
                title="Escolha a data"
                businessSettings={businessSettings}
                onBack={() => onNavigate(getPrevView(view))}
            >
                <Calendar
                    className="border-none shadow-none p-0"
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
                <Button className="w-full mt-4" onClick={() => onNavigate(ViewMode.PUBLIC_TIME)}>Continuar</Button>
            </PublicLayout>
        );
    }

    // 3. SELECT TIME
    if (view === ViewMode.PUBLIC_TIME) {
        const slots = selectedService ? getAvailableSlots(selectedDate, selectedService.duration) : [];

        return (
            <PublicLayout
                title="Escolha o horário"
                businessSettings={businessSettings}
                onBack={() => onNavigate(getPrevView(view))}
            >
                <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {slots.length > 0 ? slots.map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-3 px-2 rounded-lg border transition-all text-sm font-medium ${selectedTime === t ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'border-brand-border text-brand-text hover:border-brand-primary hover:text-brand-primary hover:bg-brand-soft'}`}
                        >
                            {t}
                        </button>
                    )) : (
                        <div className="col-span-3 text-center py-8 text-brand-muted">
                            Nenhum horário disponível nesta data.
                        </div>
                    )}
                </div>
                <Button className="w-full mt-6" disabled={!selectedTime} onClick={() => onNavigate(ViewMode.PUBLIC_REVIEW)}>Continuar</Button>
            </PublicLayout>
        );
    }

    // 4. REVIEW & FORM
    if (view === ViewMode.PUBLIC_REVIEW) {
        return (
            <PublicLayout
                title="Finalizar Agendamento"
                businessSettings={businessSettings}
                onBack={() => onNavigate(getPrevView(view))}
            >
                <div className="bg-brand-surface p-4 rounded-xl space-y-3 border border-brand-border">
                    <div className="flex gap-3">
                        <div className="p-2 bg-white rounded-lg border border-brand-border text-brand-primary h-fit">
                            <CalIcon size={20} />
                        </div>
                        <div>
                            <div className="font-medium text-brand-text capitalize">
                                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                            <div className="text-sm text-brand-primary font-bold">{selectedTime}</div>
                        </div>
                    </div>
                    <div className="border-t border-brand-border my-2"></div>
                    <div className="flex justify-between">
                        <span className="text-brand-muted">Serviço</span>
                        <span className="font-medium text-right">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-brand-muted">Valor</span>
                        <span className="font-medium">R$ {selectedService?.price},00</span>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <Heading2 className="text-sm font-medium text-brand-muted uppercase tracking-wider">Seus Dados</Heading2>
                    <Input
                        placeholder="Seu Nome Completo"
                        icon={<User size={18} />}
                        value={clientForm.name}
                        onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                    />
                    <Input
                        placeholder="WhatsApp / Celular"
                        icon={<Smartphone size={18} />}
                        value={clientForm.phone}
                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    />
                    <Select
                        value={clientForm.origin}
                        onChange={e => setClientForm({ ...clientForm, origin: e.target.value })}
                    >
                        <option value="">Por onde nos conheceu?</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Google">Google</option>
                        <option value="Indicação">Indicação de Amiga</option>
                        <option value="Passou na frente">Passei na frente</option>
                    </Select>
                </div>

                <Button
                    className="w-full mt-4 h-12 text-lg"
                    onClick={handleConfirmBooking}
                    disabled={!clientForm.name || !clientForm.phone}
                >
                    Confirmar Agendamento
                </Button>
            </PublicLayout>
        );
    }

    // 5. SUCCESS
    if (view === ViewMode.PUBLIC_SUCCESS) {
        return (
            <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
                <div className="bg-white rounded-card p-8 w-full max-w-sm text-center space-y-6 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in bounce-in duration-700">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <Heading2>Agendado!</Heading2>
                        <BodyText className="mt-2 text-sm">
                            Seu horário para <strong>{selectedService?.name}</strong> está confirmado.
                        </BodyText>
                        <div className="mt-4 p-3 bg-brand-surface rounded-lg border border-brand-border">
                            <div className="text-lg font-bold text-brand-text">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {selectedTime}</div>
                        </div>
                    </div>
                    <div className="text-xs text-brand-muted">
                        Enviamos um comprovante para seu WhatsApp.
                    </div>
                    <Button className="w-full" onClick={() => onNavigate(ViewMode.PUBLIC_CLIENT_AREA)}>
                        Ver meus agendamentos
                    </Button>
                </div>
            </div>
        );
    }

    // 5.5 PUBLIC LOGIN
    if (view === ViewMode.PUBLIC_LOGIN) {
        return (
            <PublicLayout
                title="Acesso do Cliente"
                businessSettings={businessSettings}
                onBack={() => onNavigate(ViewMode.PUBLIC_SERVICE)}
            >
                <div className="space-y-4">
                    <BodyText className="text-center text-sm">Digite seu celular para acessar seus agendamentos.</BodyText>
                    <Input
                        placeholder="WhatsApp / Celular"
                        icon={<Smartphone size={18} />}
                        value={clientForm.phone}
                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    />
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (clientForm.phone) {
                                setLoggedInClientPhone(clientForm.phone);
                                onNavigate(ViewMode.PUBLIC_CLIENT_AREA);
                            }
                        }}
                        disabled={!clientForm.phone}
                    >
                        Entrar
                    </Button>
                </div>
            </PublicLayout>
        );
    }

    // 6. CLIENT AREA (History & Quick Actions)
    if (view === ViewMode.PUBLIC_CLIENT_AREA) {
        const history = getClientHistory();

        return (
            <div className="min-h-screen bg-brand-surface p-4">
                <div className="max-w-md mx-auto space-y-6 animate-in fade-in">

                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-brand-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary rounded-full text-white flex items-center justify-center font-bold">
                                {clientForm.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-brand-text">{clientForm.name}</div>
                                <div className="text-xs text-brand-muted">{clientForm.phone}</div>
                            </div>
                        </div>
                        <button onClick={() => {
                            setLoggedInClientPhone(null);
                            setClientForm({ name: '', phone: '', origin: '' });
                            onNavigate(ViewMode.PUBLIC_SERVICE);
                        }} className="p-2 text-brand-danger bg-red-50 rounded-full">
                            <LogOut size={16} />
                        </button>
                    </div>

                    {/* Next Appointment or Quick Book */}
                    <div className="bg-gradient-to-br from-brand-primary to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-brand-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <Heading2 className="text-white text-xl mb-1">Novo Visual?</Heading2>
                            <BodyText className="text-white/80 text-sm mb-4">Agende seu próximo horário agora mesmo.</BodyText>
                            <Button
                                className="bg-white text-brand-primary hover:bg-white/90 w-full"
                                onClick={() => {
                                    // Reset booking state but keep user logged in
                                    setSelectedServiceId(null);
                                    setSelectedTime(null);
                                    onNavigate(ViewMode.PUBLIC_SERVICE);
                                }}
                            >
                                Agendar Novo Horário
                            </Button>
                        </div>
                        <Sparkles className="absolute top-[-20px] right-[-20px] text-white/10 w-32 h-32" />
                    </div>

                    {/* History */}
                    <div>
                        <Heading2 className="text-lg mb-4 flex items-center gap-2"><History size={18} /> Meus Agendamentos</Heading2>
                        <div className="space-y-3">
                            {history.length > 0 ? history.map(appt => (
                                <Card key={appt.id} className="p-4 flex gap-4 items-center" noPadding>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${new Date(appt.date || '') >= new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {new Date(appt.date || '').getDate()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-brand-text">{appt.service}</div>
                                        <div className="text-xs text-brand-muted">{new Date(appt.date || '').toLocaleDateString('pt-BR', { month: 'long' })} às {appt.time}</div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${appt.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        {appt.status === 'confirmed' ? 'Confirmado' : 'Concluído'}
                                    </div>
                                </Card>
                            )) : (
                                <div className="text-center py-8 text-brand-muted bg-white rounded-xl border border-brand-border border-dashed">
                                    Nenhuma histórico encontrado.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return null;
}
