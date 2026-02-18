import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] ❌ VARIÁVEIS DE AMBIENTE FALTANDO! Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
    console.error('[Supabase] URL:', supabaseUrl ? '✅ OK' : '❌ VAZIO');
    console.error('[Supabase] ANON KEY:', supabaseAnonKey ? '✅ OK' : '❌ VAZIO');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
