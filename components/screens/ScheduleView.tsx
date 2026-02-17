
import React, { useState } from 'react';
import {
    Plus, CalendarDays, Columns, LayoutList, Play, CheckCircle2, Scissors, Calendar as CalendarIcon,
    User, Clock, Phone, AlertCircle, XCircle
} from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Heading2, BodyText, Subtitle } from '../Typography';
import { Calendar } from '../Calendar';
import { Modal } from '../Modal';
import { Label } from '../Typography';
import { Input } from '../Input';
import { CreditCard, Banknote, QrCode, Star } from 'lucide-react';
import { ViewMode, ExtendedClient, Client } from '../../types';
import { formatDateKey, isToday, isSameDay } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';

export const ScheduleView: React.FC = () => {
    const {
        onNavigate,
        appointments,
        setIsNewApptOpen,
        setNewApptDefaults,
        startAppointment: handleStartAppointment,
        finishAppointment,
        updateAppointment,
        getAppointmentStatus: getStatus
    } = useAppContext();

    // We still need a local handleFinishAppointment to wrap the submitFinish logic
    // which involves NPS and PaymentMethod (local to the view's modal)
    const handleFinishAppointment = (appt: ExtendedClient, paymentMethod: string, nps: number) => {
        finishAppointment(appt.id, paymentMethod, nps);
    };

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [scheduleMode, setScheduleMode] = useState<'day' | 'week' | 'list'>('day');

    // Drag State
    const [dragStart, setDragStart] = useState<string | null>(null);
    const [dragEnd, setDragEnd] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Modal States
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

    const [selectedAppointment, setSelectedAppointment] = useState<ExtendedClient | null>(null);
    const [draggedAppointment, setDraggedAppointment] = useState<ExtendedClient | null>(null);

    // Finish Flow State
    const [npsScore, setNpsScore] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');

    const getDailyAppointments = (date: Date) => {
        const key = formatDateKey(date);
        return appointments.filter(a => (a.date === key) || (!a.date && isToday(date)));
    };

    const activeAppointments = getDailyAppointments(selectedDate);

    // Helper for drag
    const handleDragStart = (time: string) => {
        setDragStart(time);
        setDragEnd(time);
        setIsDragging(true);
    };

    const handleDragEnter = (time: string) => {
        if (isDragging) {
            setDragEnd(time);
        }
    };

    const handleDragEnd = () => {
        if (draggedAppointment && dragEnd) {
            // Move appointment
            const [hours, minutes] = dragEnd.split(':');
            const newTime = `${hours.padStart(2, '0')}:${minutes.padEnd(2, '0')}`;

            // Calculate new End Time based on duration
            const durationArr = getDurationInMinutes(draggedAppointment.time, draggedAppointment.endTime || '');
            const startTotal = parseInt(hours) * 60 + parseInt(minutes || '0');
            const endTotal = startTotal + durationArr;
            const endH = Math.floor(endTotal / 60);
            const endM = endTotal % 60;
            const newEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            updateAppointment({
                ...draggedAppointment,
                time: newTime,
                endTime: newEndTime,
                date: formatDateKey(selectedDate), // Assume drop on same day for now (Day View) or handle Week View date
                status: 'confirmed' // Reset status on move? Or keep?
            });
            setDraggedAppointment(null);
        } else if (isDragging && dragStart && dragEnd) {
            let start = dragStart;
            let end = dragEnd;
            if (dragStart > dragEnd) {
                start = dragEnd;
                end = dragStart;
            }

            const [endHour] = end.split(':').map(Number);
            const formattedEnd = `${(endHour + 1).toString().padStart(2, '0')}:00`;

            setIsNewApptOpen(true);
        }
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };

    const checkIsDragged = (time: string) => {
        if (!isDragging || !dragStart || !dragEnd) return false;
        let start = dragStart;
        let end = dragEnd;
        if (dragStart > dragEnd) {
            start = dragEnd;
            end = dragStart;
        }
        return time >= start && time <= end;
    };

    const openDetailsModal = (appt: ExtendedClient) => {
        setSelectedAppointment(appt);
        setIsDetailsModalOpen(true);
    };

    const openFinishModal = (client: ExtendedClient) => {
        setSelectedAppointment(client);
        setNpsScore(0);
        setPaymentMethod('');
        setIsFinishModalOpen(true);
    };

    const submitFinish = () => {
        if (selectedAppointment) {
            handleFinishAppointment(selectedAppointment, paymentMethod, npsScore);
            setIsFinishModalOpen(false);
            setSelectedAppointment(null);
        }
    };

    const navigateToClientProfile = () => {
        setIsDetailsModalOpen(false);
        onNavigate(ViewMode.CLIENT_DETAILS);
    }

    // Helper to calculate duration in minutes
    const getDurationInMinutes = (start: string, end: string) => {
        if (!start) return 60;
        const [h1, m1] = start.split(':').map(Number);

        if (!end) return 60; // Default to 1h if no end time
        const [h2, m2] = end.split(':').map(Number);

        return (h2 * 60 + m2) - (h1 * 60 + m1);
    };

    const startOfWeek = new Date(selectedDate);
    // Adjust to start on Sunday
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const HOURS_START = 9; // 09:00
    const PIXELS_PER_HOUR = 96; // h-24 = 6rem = 96px

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 select-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Heading2>Minha Agenda</Heading2>
                        <span className="text-brand-muted hidden md:inline">|</span>
                        <span className="text-sm font-medium text-brand-primary hidden md:inline capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <BodyText className="mt-1">Organize seus atendimentos e gerencie seu tempo.</BodyText>
                </div>

                <div className="flex gap-3">
                    <div className="bg-brand-bg border border-brand-border p-1 rounded-lg flex items-center shadow-sm">
                        <button onClick={() => setScheduleMode('day')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${scheduleMode === 'day' ? 'bg-brand-soft text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}><Columns size={16} /> Dia</button>
                        <button onClick={() => setScheduleMode('week')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${scheduleMode === 'week' ? 'bg-brand-soft text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}><CalendarDays size={16} /> Semana</button>
                        <button onClick={() => setScheduleMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${scheduleMode === 'list' ? 'bg-brand-soft text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}><LayoutList size={16} /> Lista</button>
                    </div>
                    <Button leftIcon={<Plus size={18} />} onClick={() => setIsNewApptOpen(true)}>Novo</Button>
                </div>
            </div>

            {/* DAILY SUMMARY HEADER */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                <Card className="p-2 md:p-3 flex items-center justify-between bg-brand-soft border-brand-primary/20" noPadding>
                    <div><div className="text-xs text-brand-muted uppercase font-semibold">Faturamento do Dia</div><div className="text-lg font-bold text-brand-primary">R$ {activeAppointments.reduce((acc, curr) => acc + curr.value, 0)}</div></div>
                    <Banknote className="text-brand-primary opacity-50" size={20} />
                </Card>
                <Card className="p-2 md:p-3 flex items-center justify-between" noPadding>
                    <div><div className="text-xs text-brand-muted uppercase font-semibold">Realizados</div><div className="text-lg font-bold text-brand-text">{activeAppointments.filter(a => getStatus(a) === 'completed').length} <span className="text-xs text-brand-muted font-normal">/ {activeAppointments.length}</span></div></div>
                    <CheckCircle2 className="text-brand-success opacity-50" size={20} />
                </Card>
                <Card className="p-2 md:p-3 flex items-center justify-between" noPadding>
                    <div><div className="text-xs text-brand-muted uppercase font-semibold">Remarcados</div><div className="text-lg font-bold text-orange-600">{activeAppointments.filter(a => a.status === 'reschedule').length}</div></div>
                    <AlertCircle className="text-orange-500 opacity-50" size={20} />
                </Card>
            </div>

            {scheduleMode === 'day' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="bg-brand-bg relative min-h-[600px]" noPadding>
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => {
                                const appt = activeAppointments.find(c => c.time === time);
                                const isDragged = checkIsDragged(time);
                                return (
                                    <div key={time} className="flex border-b border-brand-border last:border-none min-h-[80px]">
                                        <div className="w-20 text-right text-brand-muted text-xs font-medium pt-3 pr-4 border-r border-brand-border bg-brand-surface/30 select-none">{time}</div>
                                        <div className={`flex-1 p-2 relative transition-colors duration-100 ${isDragged ? 'bg-brand-primary/10' : 'hover:bg-brand-surface/40'}`} onMouseDown={() => handleDragStart(time)} onMouseEnter={() => handleDragEnter(time)} onMouseUp={handleDragEnd}>
                                            <div className="absolute inset-0 top-1/2 border-t border-brand-border/30 border-dashed w-full pointer-events-none"></div>
                                            {isDragged && <div className="absolute inset-x-2 top-1 bottom-1 bg-brand-primary/20 border-2 border-brand-primary border-dashed rounded-lg flex items-center justify-center text-xs text-brand-primary font-bold z-10 pointer-events-none">Novo Horário</div>}
                                            {appt && !isDragged && (
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); openDetailsModal(appt); }}
                                                    className={`h-full border-l-4 rounded-r-lg p-2 flex justify-between items-center hover:shadow-md transition-all cursor-pointer shadow-sm z-20 relative
                                                        ${appt.status === 'reschedule' ? 'bg-orange-50 border-l-orange-500' : 'bg-brand-soft/80 border-l-brand-primary hover:bg-brand-soft'}
                                                    `}
                                                >
                                                    <div><div className="font-medium text-brand-text text-sm">{appt.name}</div><div className="text-xs text-brand-muted">{appt.service}</div></div>
                                                    <Badge variant={appt.status === 'confirmed' ? 'success' : appt.status === 'reschedule' ? 'warning' : 'neutral'}>
                                                        {appt.status === 'reschedule' ? 'Remarcar' : `R$ ${appt.value}`}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </Card>
                    </div>
                    <div className="hidden lg:block"><Calendar className="w-full sticky top-4" selectedDate={selectedDate} onDateChange={(date) => setSelectedDate(date)} /></div>
                </div>
            )}

            {scheduleMode === 'week' && (
                <Card className="overflow-x-auto min-h-[600px] animate-in fade-in" noPadding>
                    <div className="min-w-[800px] grid grid-cols-8 divide-x divide-brand-border bg-brand-bg">
                        {/* Time Column */}
                        <div className="col-span-1 bg-brand-surface/30">
                            <div className="h-12 border-b border-brand-border bg-brand-surface/50 sticky top-0 z-20"></div>
                            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(hour => (
                                <div key={hour} className="h-24 border-b border-brand-border flex items-start justify-center pt-2 text-xs font-medium text-brand-muted">
                                    {hour}
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                            const dayDate = new Date(startOfWeek);
                            dayDate.setDate(startOfWeek.getDate() + offset);

                            const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                            const dayNumber = dayDate.getDate();
                            const isCurrentDay = isSameDay(dayDate, new Date());

                            const dateKey = formatDateKey(dayDate);
                            const dayAppts = appointments.filter(a => a.date === dateKey);

                            return (
                                <div key={offset} className="col-span-1 relative">
                                    {/* Header */}
                                    <div className={`h-12 border-b border-brand-border flex flex-col items-center justify-center sticky top-0 z-10 transition-colors ${isCurrentDay ? 'bg-brand-soft text-brand-primary shadow-sm' : 'bg-brand-bg/95 text-brand-text backdrop-blur-sm'}`}>
                                        <span className="text-[10px] uppercase font-semibold opacity-70">{dayLabel}</span>
                                        <span className={`text-lg font-bold leading-none ${isCurrentDay ? 'scale-110' : ''}`}>{dayNumber}</span>
                                    </div>

                                    {/* Grid Background */}
                                    <div className="relative">
                                        {['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'].map(hour => (
                                            <div
                                                key={hour}
                                                className="h-24 border-b border-brand-border/50 box-border cursor-pointer hover:bg-brand-primary/5 transition-colors relative group"
                                                onClick={() => {
                                                    setNewApptDefaults({ date: dateKey, time: `${hour}:00` });
                                                    setIsNewApptOpen(true);
                                                }}
                                            >
                                                <div className="absolute inset-1 border-2 border-brand-primary/0 group-hover:border-brand-primary/30 border-dashed rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <span className="text-xs font-medium text-brand-primary/60">+ Novo às {hour}:00</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Appointment Cards */}
                                        {dayAppts.map(appt => {
                                            const [hours, minutes] = appt.time.split(':').map(Number);
                                            if (hours < HOURS_START) return null; // Skip if before start time

                                            // Calculate Position
                                            const startOffset = ((hours - HOURS_START) * PIXELS_PER_HOUR) + ((minutes / 60) * PIXELS_PER_HOUR);

                                            // Calculate Height
                                            const durationMinutes = getDurationInMinutes(appt.time, appt.endTime || '');
                                            const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

                                            return (
                                                <div
                                                    key={appt.id}
                                                    onClick={(e) => { e.stopPropagation(); openDetailsModal(appt); }}
                                                    className={`
                                                  absolute left-1 right-1 rounded-lg p-2 flex flex-col justify-start shadow-sm cursor-pointer hover:brightness-95 transition-all border-l-4 overflow-hidden z-10
                                                  ${appt.status === 'confirmed'
                                                            ? 'bg-brand-primary text-white border-l-brand-soft'
                                                            : appt.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800 border-l-yellow-500'
                                                                : 'bg-gray-100 text-gray-700 border-l-gray-400'
                                                        }
                                              `}
                                                    style={{
                                                        top: `${startOffset + 2}px`,
                                                        height: `${height - 4}px`
                                                    }}
                                                    title={`${appt.time} - ${appt.name} (${appt.service})`}
                                                >
                                                    <span className="font-bold text-xs truncate leading-tight">{appt.name}</span>
                                                    <span className="text-[10px] opacity-90 truncate leading-tight mt-0.5">{appt.service}</span>
                                                    {height > 50 && (
                                                        <span className="text-[10px] opacity-75 truncate mt-auto pt-1 flex items-center gap-1">
                                                            {appt.time}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}

            {scheduleMode === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                    <div className="lg:col-span-2 space-y-4">
                        {activeAppointments.length > 0 ? (
                            activeAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((appt) => {
                                const status = getStatus(appt);
                                return (
                                    <Card key={appt.id} onClick={() => openDetailsModal(appt)} className={`transition-all border-l-4 cursor-pointer hover:shadow-md ${status === 'in_progress' ? 'border-l-brand-primary bg-brand-soft/20' : status === 'completed' ? 'border-l-brand-success bg-brand-bg opacity-75' : 'border-l-brand-muted'}`} noPadding>
                                        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-shrink-0"><div className={`px-3 py-2 rounded-lg font-bold text-sm text-center min-w-[70px] ${status === 'in_progress' ? 'bg-brand-primary text-white' : status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-brand-surface text-brand-text border border-brand-border'}`}>{appt.time}</div></div>
                                            <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-brand-text text-base truncate">{appt.name}</h3>{status === 'completed' && <Badge variant="success">Concluído</Badge>}{status === 'in_progress' && <Badge variant="primary" className="animate-pulse">Em Atendimento</Badge>}</div><div className="text-sm text-brand-muted flex items-center gap-2"><Scissors size={14} />{appt.service}</div><div className="text-sm font-medium text-brand-text mt-1">R$ {appt.value}</div></div>
                                            <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col gap-2">
                                                {status === 'pending' && (<Button className="w-full md:w-auto h-9 text-sm" leftIcon={<Play size={14} fill="currentColor" />} onClick={(e) => { e.stopPropagation(); handleStartAppointment(appt.id); }}>Iniciar</Button>)}
                                                {status === 'in_progress' && (<Button className="w-full md:w-auto h-9 text-sm bg-green-600 hover:bg-green-700 text-white" leftIcon={<CheckCircle2 size={14} />} onClick={(e) => { e.stopPropagation(); openFinishModal(appt); }}>Finalizar</Button>)}
                                                {status === 'completed' && (<Button variant="ghost" className="w-full md:w-auto h-9 text-sm" onClick={(e) => { e.stopPropagation(); openDetailsModal(appt); }}>Ver Detalhes</Button>)}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        ) : (<div className="text-center py-12 bg-brand-surface rounded-card border border-brand-border border-dashed"><CalendarIcon className="mx-auto text-brand-muted mb-3" size={32} /><BodyText>Nenhum agendamento para este dia.</BodyText><Button variant="ghost" className="mt-2 text-sm" onClick={() => setIsNewApptOpen(true)}>Adicionar Horário</Button></div>)}
                    </div>
                    <div><Calendar className="w-full sticky top-4" selectedDate={selectedDate} onDateChange={(date) => setSelectedDate(date)} /></div>
                </div>
            )}

            {/* DETAILS POPUP MODAL */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalhes do Agendamento"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        {/* Header with Client Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary font-bold text-2xl">
                                {selectedAppointment.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <Heading2 className="text-lg">{selectedAppointment.name}</Heading2>
                                <div className="flex items-center gap-2 text-brand-muted text-sm mt-0.5">
                                    <Phone size={14} /> {selectedAppointment.phone}
                                </div>
                            </div>
                            <Badge variant={selectedAppointment.status === 'confirmed' ? 'success' : selectedAppointment.status === 'pending' ? 'warning' : 'neutral'}>
                                {selectedAppointment.status === 'confirmed' ? 'Confirmado' : selectedAppointment.status === 'pending' ? 'Pendente' : selectedAppointment.status}
                            </Badge>
                        </div>

                        {/* Service Card */}
                        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Label className="mb-1 block">Serviço</Label>
                                    <div className="font-semibold text-brand-text text-lg">{selectedAppointment.service}</div>
                                </div>
                                <div className="text-right">
                                    <Label className="mb-1 block">Valor</Label>
                                    <div className="font-bold text-brand-primary text-lg">R$ {selectedAppointment.value}</div>
                                </div>
                            </div>

                            <div className="border-t border-brand-border"></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1 block">Data</Label>
                                    <div className="flex items-center gap-2 text-sm text-brand-text font-medium">
                                        <CalendarIcon size={16} className="text-brand-muted" />
                                        {selectedAppointment.date ? new Date(selectedAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Hoje'}
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-1 block">Horário</Label>
                                    <div className="flex items-center gap-2 text-sm text-brand-text font-medium">
                                        <Clock size={16} className="text-brand-muted" />
                                        {selectedAppointment.time} - {selectedAppointment.endTime || '...'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="secondary" onClick={navigateToClientProfile} leftIcon={<User size={18} />}>
                                Ver Ficha
                            </Button>
                            <Button
                                variant="secondary"
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                onClick={() => {
                                    if (selectedAppointment) {
                                        setRescheduleData({
                                            date: selectedAppointment.date || formatDateKey(new Date()),
                                            time: selectedAppointment.time
                                        });
                                        setIsDetailsModalOpen(false);
                                        setIsRescheduleModalOpen(true);
                                    }
                                }}
                            >
                                Remarcar
                            </Button>
                            <Button variant="ghost" className="text-brand-danger hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100" leftIcon={<XCircle size={18} />}>
                                Cancelar
                            </Button>
                        </div>

                        {/* Main Action Button */}
                        <div className="pt-2 border-t border-brand-border">
                            {getStatus(selectedAppointment) === 'pending' || getStatus(selectedAppointment) === 'confirmed' ? (
                                <Button className="w-full h-12 text-lg" onClick={() => {
                                    handleStartAppointment(selectedAppointment.id);
                                    setIsDetailsModalOpen(false);
                                }} leftIcon={<Play size={20} fill="currentColor" />}>
                                    Iniciar Atendimento
                                </Button>
                            ) : getStatus(selectedAppointment) === 'in_progress' ? (
                                <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    openFinishModal(selectedAppointment);
                                }} leftIcon={<CheckCircle2 size={20} />}>
                                    Finalizar Atendimento
                                </Button>
                            ) : (
                                <Button variant="ghost" className="w-full text-brand-muted" disabled>Atendimento Concluído</Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* FINISH MODAL */}
            <Modal isOpen={isFinishModalOpen} onClose={() => setIsFinishModalOpen(false)} title="Resumo do Atendimento" footer={<><Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>Cancelar</Button><Button onClick={submitFinish} className="bg-green-600 hover:bg-green-700 text-white">Confirmar e Finalizar</Button></>}>
                {selectedAppointment && (
                    <div className="space-y-6">
                        <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-2"><div className="flex justify-between items-center"><span className="text-brand-muted text-sm">Cliente</span><span className="font-semibold text-brand-text">{selectedAppointment.name}</span></div><div className="flex justify-between items-center"><span className="text-brand-muted text-sm">Serviço</span><span className="font-semibold text-brand-text">{selectedAppointment.service}</span></div><div className="border-t border-brand-border my-2"></div><div className="flex justify-between items-center"><span className="text-brand-muted text-sm">Total a Receber</span><span className="font-bold text-xl text-green-600">R$ {selectedAppointment.value},00</span></div></div>
                        <div className="space-y-3"><Label>Forma de Pagamento</Label><div className="grid grid-cols-3 gap-3">{[{ id: 'credit', label: 'Cartão', icon: CreditCard }, { id: 'cash', label: 'Dinheiro', icon: Banknote }, { id: 'pix', label: 'Pix', icon: QrCode }].map((method) => (<button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${paymentMethod === method.id ? 'border-brand-primary bg-brand-soft text-brand-primary' : 'border-brand-border text-brand-muted hover:border-brand-primary/50'}`}><method.icon size={20} /><span className="text-xs font-medium">{method.label}</span></button>))}</div></div>
                        <div className="space-y-3"><div className="flex justify-between items-center"><Label>Satisfação do Cliente (NPS)</Label><span className="text-sm font-bold text-brand-primary">{npsScore > 0 ? npsScore : '-'}</span></div><div className="flex justify-between gap-1">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (<button key={score} onClick={() => setNpsScore(score)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${npsScore >= score ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-sm' : 'bg-brand-surface text-brand-muted hover:bg-brand-border'}`}><Star size={12} fill={npsScore >= score ? "currentColor" : "none"} /></button>))}</div></div>
                    </div>
                )}
            </Modal>

            {/* RESCHEDULE MODAL */}
            <Modal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                title="Remarcar Agendamento"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsRescheduleModalOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                if (selectedAppointment && rescheduleData.date && rescheduleData.time) {
                                    updateAppointment({
                                        ...selectedAppointment,
                                        date: rescheduleData.date,
                                        time: rescheduleData.time,
                                        status: 'confirmed'
                                    });
                                    setIsRescheduleModalOpen(false);
                                    setSelectedAppointment(null);
                                }
                            }}
                        >
                            Salvar Nova Data
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm mb-4">
                        Você está remarcando o atendimento de <strong>{selectedAppointment?.name}</strong>.
                    </div>
                    <Input
                        label="Nova Data"
                        type="date"
                        value={rescheduleData.date}
                        onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    />
                    <Input
                        label="Novo Horário"
                        type="time"
                        value={rescheduleData.time}
                        onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    />
                </div>
            </Modal>

        </div>
    );
};
