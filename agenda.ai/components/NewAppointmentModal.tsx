import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Select, TextArea } from './Input';
import { useAppContext } from '../context/AppContext';
import { formatDateKey } from '../utils/formatters';

export const NewAppointmentModal: React.FC = () => {
    const {
        isNewApptOpen,
        setIsNewApptOpen,
        services,
        clients,
        addClient,
        addAppointment,
        newApptDefaults,
        setNewApptDefaults
    } = useAppContext();

    const [showSuggestions, setShowSuggestions] = useState(false);

    const [newApptData, setNewApptData] = useState({
        clientName: '',
        clientPhone: '',
        date: formatDateKey(new Date()),
        startTime: '',
        endTime: '',
        serviceId: '',
        notes: ''
    });

    // Apply defaults when modal opens with pre-filled data
    useEffect(() => {
        if (isNewApptOpen && (newApptDefaults.date || newApptDefaults.time)) {
            setNewApptData(prev => ({
                ...prev,
                date: newApptDefaults.date || prev.date,
                startTime: newApptDefaults.time || prev.startTime
            }));
        }
    }, [isNewApptOpen, newApptDefaults]);

    const calculateEndTime = (startTime: string, durationMinutes: number) => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceId = e.target.value;
        const service = services.find(s => s.id === serviceId);

        let newEndTime = newApptData.endTime;
        if (service && newApptData.startTime) {
            newEndTime = calculateEndTime(newApptData.startTime, service.duration);
        }

        setNewApptData(prev => ({
            ...prev,
            serviceId,
            endTime: newEndTime
        }));
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const startTime = e.target.value;
        const service = services.find(s => s.id === newApptData.serviceId);

        let newEndTime = newApptData.endTime;
        if (service && startTime) {
            newEndTime = calculateEndTime(startTime, service.duration);
        }

        setNewApptData(prev => ({
            ...prev,
            startTime,
            endTime: newEndTime
        }));
    };

    const handleSaveAppointment = () => {
        if (!newApptData.clientName || !newApptData.serviceId || !newApptData.startTime) {
            alert('Por favor, preencha o nome, serviço e horário.');
            return;
        }

        const selectedService = services.find(s => s.id === newApptData.serviceId);

        // 1. Check if client exists
        const existingClient = clients.find(c =>
            c.phone === newApptData.clientPhone ||
            c.name.toLowerCase() === newApptData.clientName.toLowerCase()
        );

        // 2. If not, create them
        if (!existingClient) {
            const newClient = {
                id: Math.random().toString(36).substr(2, 9),
                name: newApptData.clientName,
                phone: newApptData.clientPhone || '(00) 00000-0000',
                service: selectedService ? selectedService.name : 'Novo Cliente',
                time: newApptData.startTime,
                status: 'confirmed' as const,
                value: 0,
                totalSpent: 0
            };
            addClient(newClient);
        }

        // 3. Save Appointment
        const newAppt = {
            id: Math.random().toString(36).substr(2, 9),
            name: newApptData.clientName,
            phone: newApptData.clientPhone || '(00) 00000-0000',
            serviceId: newApptData.serviceId,
            service: selectedService ? selectedService.name : 'Serviço Diverso',
            time: newApptData.startTime,
            endTime: newApptData.endTime,
            date: newApptData.date,
            status: 'confirmed' as const,
            value: selectedService ? selectedService.price : 0,
            totalSpent: 0
        };

        addAppointment(newAppt);
        setIsNewApptOpen(false);
        setNewApptDefaults({});

        // Reset state
        setNewApptData({
            clientName: '',
            clientPhone: '',
            date: formatDateKey(new Date()),
            startTime: '',
            endTime: '',
            serviceId: '',
            notes: ''
        });
    };

    return (
        <Modal
            isOpen={isNewApptOpen}
            onClose={() => setIsNewApptOpen(false)}
            title="Novo Agendamento"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={() => setIsNewApptOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveAppointment}>Agendar Cliente</Button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Input
                            label="Nome da Cliente"
                            placeholder="Ex: Maria Silva"
                            value={newApptData.clientName}
                            onChange={(e) => {
                                setNewApptData({ ...newApptData, clientName: e.target.value });
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            // Delay blur to allow click on suggestion
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            autoComplete="off"
                        />
                        {/* Suggestions Dropdown */}
                        {showSuggestions && newApptData.clientName.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {clients
                                    .filter((c) => c.name.toLowerCase().includes(newApptData.clientName.toLowerCase()))
                                    .slice(0, 5)
                                    .map((client, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-2 hover:bg-brand-soft cursor-pointer flex justify-between items-center border-b border-brand-border last:border-0"
                                            onClick={() => {
                                                setNewApptData({
                                                    ...newApptData,
                                                    clientName: client.name,
                                                    clientPhone: client.phone
                                                });
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <span className="font-medium text-brand-text text-sm">{client.name}</span>
                                            <span className="text-xs text-brand-muted">{client.phone}</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                    <Input
                        label="Telefone / WhatsApp"
                        placeholder="(00) 00000-0000"
                        value={newApptData.clientPhone}
                        onChange={(e) => setNewApptData({ ...newApptData, clientPhone: e.target.value })}
                    />
                </div>

                <Select
                    label="Serviço"
                    value={newApptData.serviceId}
                    onChange={handleServiceChange}
                >
                    <option value="">Selecione um serviço...</option>
                    {Array.from(new Set(services.map(s => s.category))).map(category => (
                        <optgroup key={category} label={category}>
                            {services.filter(s => s.category === category).map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name} ({service.duration} min) - R$ {service.price}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </Select>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
                    <div className="col-span-2 md:col-span-1">
                        <Input
                            label="Data"
                            type="date"
                            value={newApptData.date}
                            onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Início"
                        type="time"
                        value={newApptData.startTime}
                        onChange={handleStartTimeChange}
                    />
                    <Input
                        label="Fim (Previsto)"
                        type="time"
                        value={newApptData.endTime}
                        onChange={(e) => setNewApptData({ ...newApptData, endTime: e.target.value })}
                    />
                </div>

                <TextArea
                    label="Observações"
                    placeholder="Preferências, alergias ou notas importantes..."
                    value={newApptData.notes}
                    onChange={(e) => setNewApptData({ ...newApptData, notes: e.target.value })}
                    className="h-24"
                />
            </div>
        </Modal >
    );
};
