import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ViewMode, ExtendedClient, ServiceItem, BusinessSettings, ThemeType, Client, Cost } from '../types';
import { initialAppointments, servicesList, costsList } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../utils/supabaseClient';

interface AppContextType {
    // State
    currentView: ViewMode;
    appointments: ExtendedClient[];
    clients: ExtendedClient[];
    services: ServiceItem[];
    costs: Cost[];
    businessSettings: BusinessSettings;
    currentTheme: ThemeType;
    isDarkMode: boolean;

    // UI State
    isNewApptOpen: boolean;
    setIsNewApptOpen: (open: boolean) => void;
    newApptDefaults: { date?: string; time?: string };
    setNewApptDefaults: (defaults: { date?: string; time?: string }) => void;
    appointmentStatus: Record<string, string>;
    selectedClientId: string | null;
    setSelectedClientId: (id: string | null) => void;

    // Actions
    setCurrentView: (view: ViewMode) => void;
    setAppointments: React.Dispatch<React.SetStateAction<ExtendedClient[]>>;
    setClients: React.Dispatch<React.SetStateAction<ExtendedClient[]>>;
    setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
    setCosts: React.Dispatch<React.SetStateAction<Cost[]>>;
    setBusinessSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
    changeTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    addAppointment: (appointment: ExtendedClient) => void;
    addClient: (client: ExtendedClient) => void;
    updateClient: (client: ExtendedClient) => void;
    startAppointment: (id: string) => void;
    finishAppointment: (clientId: string, paymentMethod?: string, nps?: number) => void;
    updateAppointment: (appointment: ExtendedClient) => void;

    getAppointmentStatus: (client: Client) => string;
    addCost: (cost: Cost) => void;
    updateCost: (cost: Cost) => void;
    deleteCost: (id: string) => void;
    uploadImage: (bucket: 'logos' | 'avatars', file: File) => Promise<string | null>;
    updateBusinessSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
    getSaaSMetrics: () => Promise<any>;
    getTenantsList: () => Promise<any[]>;
    resetData: () => void;
}



const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Navigation State
    const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.LOGIN);

    // 2. Data State
    const [appointments, setAppointments] = useState<ExtendedClient[]>([]);
    const [clients, setClients] = useState<ExtendedClient[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [costs, setCosts] = useState<Cost[]>([]);
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
        businessName: '',
        slug: '',
        description: '',
        coverColor: 'from-brand-primary to-purple-400',
        coverImage: null,
        logo: null,
        themeColor: '#6C4CF1',
        phone: '',
        address: '',
        openDays: [],
        openTime: '09:00',
        closeTime: '18:00',
        ownerName: '',
        ownerTitle: '',
        email: ''
    });

    const [loading, setLoading] = useState(true);

    const seedInitialData = useCallback(async (userId: string) => {
        try {
            console.log('Seeding initial data for user:', userId);
            // Seed Services
            const servicesToInsert = servicesList.map(s => ({
                name: s.name,
                price: s.price,
                duration: s.duration,
                category: s.category,
                type: s.type,
                user_id: userId
            }));
            await supabase.from('services').insert(servicesToInsert);

            // Seed Clients
            const clientsToInsert = Array.from(new Set(initialAppointments.map(a => a.phone))).map(phone => {
                const client = initialAppointments.find(a => a.phone === phone);
                return {
                    name: client?.name,
                    phone: client?.phone,
                    status: 'pending',
                    user_id: userId
                };
            });
            await supabase.from('clients').insert(clientsToInsert);

            // Seed Costs
            const costsToInsert = costsList.map(c => ({
                title: c.title,
                category: c.category,
                value: c.value,
                date: c.date,
                status: c.status,
                recurrence: c.recurrence,
                user_id: userId
            }));
            await supabase.from('costs').insert(costsToInsert);

            // Fetch everything after seeding
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch again to update state
                const [
                    { data: clientsData },
                    { data: servicesData },
                    { data: costsData },
                    { data: settingsData },
                    { data: appointmentsData }
                ] = await Promise.all([
                    supabase.from('clients').select('*'),
                    supabase.from('services').select('*'),
                    supabase.from('costs').select('*'),
                    supabase.from('business_settings').select('*').limit(1).maybeSingle(),
                    supabase.from('appointments').select('*, client:clients(*), service:services(*)')
                ]);

                if (clientsData) setClients(clientsData as any);
                if (servicesData) setServices(servicesData as any);
                if (costsData) setCosts(costsData as any);
                if (settingsData) setBusinessSettings(settingsData as any);

                if (appointmentsData) {
                    const mappedAppts = appointmentsData.map((a: any) => ({
                        ...a.client,
                        id: a.id,
                        clientId: a.client_id,
                        serviceId: a.service_id,
                        date: a.date,
                        time: a.time,
                        status: a.status,
                        value: a.value
                    }));
                    setAppointments(mappedAppts as any);
                }
            }
        } catch (error) {
            console.error('Error seeding data:', error);
        }
    }, []);

    // Fetch initial data from Supabase
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Check if user has any services, if count is 0, seed data
            const { count, error: countError } = await supabase
                .from('services')
                .select('*', { count: 'exact', head: true });

            if (!countError && count === 0) {
                await seedInitialData(session.user.id);
                return;
            }

            // Use Promise.all to fetch everything in parallel
            const [
                { data: clientsData },
                { data: servicesData },
                { data: costsData },
                { data: settingsData },
                { data: appointmentsData }
            ] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('services').select('*'),
                supabase.from('costs').select('*'),
                supabase.from('business_settings').select('*').limit(1).maybeSingle(),
                supabase.from('appointments').select('*, client:clients(*), service:services(*)')
            ]);

            if (clientsData) setClients(clientsData as any);
            if (servicesData) setServices(servicesData as any);
            if (costsData) setCosts(costsData as any);
            if (settingsData) setBusinessSettings(settingsData as any);

            // Map appointments back to the ExtendedClient interface format for compatibility
            if (appointmentsData) {
                const mappedAppts = appointmentsData.map((a: any) => ({
                    ...a.client,
                    id: a.id, // Use appointment id
                    clientId: a.client_id,
                    serviceId: a.service_id,
                    date: a.date,
                    time: a.time,
                    status: a.status,
                    value: a.value
                }));
                setAppointments(mappedAppts as any);
            }
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        } finally {
            setLoading(false);
        }
    }, [seedInitialData]);

    const resetData = useCallback(() => {
        setAppointments([]);
        setClients([]);
        setServices([]);
        setCosts([]);
        setBusinessSettings({
            businessName: '',
            slug: '',
            description: '',
            coverColor: 'from-brand-primary to-purple-400',
            coverImage: null,
            logo: null,
            themeColor: '#6C4CF1',
            phone: '',
            address: '',
            openDays: [],
            openTime: '09:00',
            closeTime: '18:00',
            ownerName: '',
            ownerTitle: '',
            email: ''
        });
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                fetchData();
            } else if (event === 'SIGNED_OUT') {
                resetData();
            }
        });

        fetchData(); // Initial load if already signed in

        // 5. Realtime Subscriptions
        const appointmentsChannel = supabase
            .channel('public:appointments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
            .subscribe();

        const clientsChannel = supabase
            .channel('public:clients')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .subscribe();

        const businessChannel = supabase
            .channel('public:business_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'business_settings' }, () => fetchData())
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(appointmentsChannel);
            supabase.removeChannel(clientsChannel);
            supabase.removeChannel(businessChannel);
        };
    }, [fetchData, resetData]);


    // 3. UI Global State
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isNewApptOpen, setIsNewApptOpen] = useState(false);
    const [newApptDefaults, setNewApptDefaults] = useState<{ date?: string; time?: string }>({});
    const [appointmentStatus, setAppointmentStatus] = useState<Record<string, string>>({});

    // 4. Theme & Persistence State
    const [currentTheme, setCurrentTheme] = useLocalStorage<ThemeType>('app-theme', 'default');
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('dark-mode', false);

    // Apply Theme Logic
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', currentTheme);

        if (isDarkMode && currentTheme === 'default') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode, currentTheme]);

    // Actions
    const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), [setIsDarkMode]);

    const changeTheme = useCallback((theme: ThemeType) => {
        setCurrentTheme(theme);
        if (theme === 'aurora') setIsDarkMode(false);
    }, [setCurrentTheme, setIsDarkMode]);

    const addAppointment = async (newAppt: ExtendedClient) => {
        const { data, error } = await supabase.from('appointments').insert({
            client_id: newAppt.id || newAppt.serviceId, // simplified for now
            date: newAppt.date,
            time: newAppt.time,
            status: 'pending',
            value: newAppt.value
        }).select().single();

        if (!error && data) {
            fetchData(); // Simplest way to keep sync
        }
    };

    const addClient = async (newClient: ExtendedClient) => {
        const { error } = await supabase.from('clients').insert({
            name: newClient.name,
            phone: newClient.phone,
            email: newClient.email,
            status: 'pending'
        });
        if (!error) fetchData();
    };

    const updateClient = async (updatedClient: ExtendedClient) => {
        const { error } = await supabase.from('clients').update({
            name: updatedClient.name,
            phone: updatedClient.phone,
            email: updatedClient.email,
            notes: updatedClient.notes
        }).eq('id', updatedClient.id);
        if (!error) fetchData();
    };

    const updateAppointment = async (updatedAppt: ExtendedClient) => {
        const { error } = await supabase.from('appointments').update({
            status: updatedAppt.status,
            date: updatedAppt.date,
            time: updatedAppt.time
        }).eq('id', updatedAppt.id);
        if (!error) fetchData();
    };

    const startAppointment = async (id: string) => {
        await supabase.from('appointments').update({ status: 'in_progress' }).eq('id', id);
        fetchData();
    };

    const finishAppointment = useCallback(async (appointmentId: string, paymentMethod?: string, nps?: number) => {
        await supabase.from('appointments')
            .update({
                status: 'completed',
                payment_method: paymentMethod,
                nps: nps
            })
            .eq('id', appointmentId);
        fetchData();
    }, [fetchData]);


    const addCost = async (newCost: Cost) => {
        await supabase.from('costs').insert({
            title: newCost.title,
            category: newCost.category,
            value: newCost.value,
            date: newCost.date,
            status: newCost.status,
            recurrence: newCost.recurrence
        });
        fetchData();
    };

    const updateCost = async (updatedCost: Cost) => {
        await supabase.from('costs').update({
            title: updatedCost.title,
            category: updatedCost.category,
            value: updatedCost.value,
            date: updatedCost.date,
            status: updatedCost.status
        }).eq('id', updatedCost.id);
        fetchData();
    };

    const deleteCost = async (id: string) => {
        await supabase.from('costs').delete().eq('id', id);
        fetchData();
    };

    const getAppointmentStatus = useCallback((client: Client) => {
        return client.status === 'confirmed' ? 'pending' : client.status;
    }, []);

    const uploadImage = async (bucket: 'logos' | 'avatars', file: File) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const updateBusinessSettings = async (updates: Partial<BusinessSettings>) => {
        const { error } = await supabase
            .from('business_settings')
            .upsert({
                ...businessSettings,
                ...updates,
                updated_at: new Date().toISOString()
            });
        if (!error) fetchData();
    };

    const getSaaSMetrics = async () => {
        const { data, error } = await supabase.rpc('get_saas_metrics');
        if (error) {
            console.error('Error fetching SaaS metrics:', error);
            return null;
        }
        return data;
    };

    const getTenantsList = async () => {
        const { data, error } = await supabase.rpc('get_tenants_list');
        if (error) {
            console.error('Error fetching tenants list:', error);
            return [];
        }
        return data;
    };



    const value = {
        currentView,
        appointments,
        clients,
        services,
        costs,
        businessSettings,
        currentTheme,
        isDarkMode,
        isNewApptOpen,
        newApptDefaults,
        appointmentStatus,
        selectedClientId,
        setIsNewApptOpen,
        setNewApptDefaults,
        setSelectedClientId,
        setCurrentView,
        setAppointments,
        setClients,
        setServices,
        setCosts,
        setBusinessSettings,
        changeTheme,
        toggleTheme,
        addAppointment,
        addClient,
        updateClient,
        updateAppointment,
        addCost,
        updateCost,
        deleteCost,
        uploadImage,
        updateBusinessSettings,
        startAppointment,
        finishAppointment,
        getAppointmentStatus,
        getSaaSMetrics,
        getTenantsList,
        resetData
    };



    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
