import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { BusinessSettings, ServiceItem } from '../types';

// Map DB snake_case to App camelCase
const mapFromDbSettings = (dbData: any): BusinessSettings => ({
    businessName: dbData.business_name || '',
    slug: dbData.slug || '',
    description: dbData.description || '',
    coverColor: dbData.cover_color || 'from-brand-primary to-purple-400',
    coverImage: dbData.cover_image || null,
    logo: dbData.logo || null,
    themeColor: dbData.theme_color || '#6C4CF1',
    phone: dbData.phone || '',
    address: dbData.address || '',
    openDays: dbData.open_days || [],
    openTime: dbData.open_time || '09:00',
    closeTime: dbData.close_time || '18:00',
    ownerName: dbData.owner_name || '',
    ownerTitle: dbData.owner_title || '',
    email: dbData.email || ''
});

interface PublicBookingData {
    loading: boolean;
    error: string | null;
    businessSettings: BusinessSettings | null;
    services: ServiceItem[];
    userId: string | null;
}

export function usePublicBookingData(slug: string | null): PublicBookingData {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!slug) {
            setLoading(false);
            setError('Slug não informado.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch business settings by slug
            const { data: settingsData, error: settingsError } = await supabase
                .from('business_settings')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (settingsError) throw settingsError;
            if (!settingsData) {
                setError('Negócio não encontrado.');
                setLoading(false);
                return;
            }

            const mappedSettings = mapFromDbSettings(settingsData);
            setBusinessSettings(mappedSettings);
            setUserId(settingsData.user_id);

            // 2. Fetch services for this business owner
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*')
                .eq('user_id', settingsData.user_id);

            if (servicesError) throw servicesError;
            setServices((servicesData || []) as ServiceItem[]);

        } catch (err: any) {
            console.error('[PublicBooking] Error loading data:', err);
            setError(err.message || 'Erro ao carregar dados do negócio.');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { loading, error, businessSettings, services, userId };
}
