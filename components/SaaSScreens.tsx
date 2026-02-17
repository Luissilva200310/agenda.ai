import React from 'react';
import { ViewMode } from '../types';
import { useAppContext } from '../context/AppContext';

// Views
import { DashboardView } from './screens/DashboardView';
import { ScheduleView } from './screens/ScheduleView';
import { ServicesView } from './screens/ServicesView';
import { ClientsView } from './screens/ClientsView';
import { CostsView } from './screens/CostsView';
import { ReportsView } from './screens/ReportsView';
import { AIChatView } from './screens/AIChatView';
import { PlansView } from './screens/PlansView';
import { SettingsView } from './screens/SettingsView';
import { ClientDetailsView } from './screens/ClientDetailsView';

// Components
import { Button } from './Button';
import { Heading2, BodyText } from './Typography';
import { NewAppointmentModal } from './NewAppointmentModal';

export const SaaSScreens: React.FC = () => {
    const {
        currentView: view,
        setCurrentView: onNavigate,
        isDarkMode,
    } = useAppContext();

    // --- RENDER ---
    const renderContent = () => {
        switch (view) {
            case ViewMode.DASHBOARD:
                return <DashboardView />;
            case ViewMode.SCHEDULE:
                return <ScheduleView />;
            case ViewMode.SERVICES:
                return <ServicesView />;
            case ViewMode.CLIENTS:
                return <ClientsView />;
            case ViewMode.COSTS:
                return <CostsView />;
            case ViewMode.REPORTS:
                return <ReportsView />;
            case ViewMode.AI_CHAT:
                return <AIChatView />;
            case ViewMode.PLANS:
                return <PlansView />;
            case ViewMode.SETTINGS:
                return <SettingsView />;
            case ViewMode.CLIENT_DETAILS:
                return <ClientDetailsView onNavigate={onNavigate} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
                        <Heading2>404</Heading2>
                        <BodyText>Tela não encontrada.</BodyText>
                        <Button onClick={() => onNavigate(ViewMode.DASHBOARD)}>Voltar ao Início</Button>
                    </div>
                );
        }
    };

    return (
        <>
            {renderContent()}
            <NewAppointmentModal />
        </>
    );
};
