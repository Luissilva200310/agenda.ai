
export enum ViewMode {
  // Public / Auth
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING_1 = 'ONBOARDING_1',
  ONBOARDING_2 = 'ONBOARDING_2',
  ONBOARDING_3 = 'ONBOARDING_3',

  // Admin / God Mode
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',

  // Public Booking Flow
  PUBLIC_SERVICE = 'PUBLIC_SERVICE',
  PUBLIC_PROFESSIONAL = 'PUBLIC_PROFESSIONAL',
  PUBLIC_DATE = 'PUBLIC_DATE',
  PUBLIC_TIME = 'PUBLIC_TIME',
  PUBLIC_REVIEW = 'PUBLIC_REVIEW',
  PUBLIC_SUCCESS = 'PUBLIC_SUCCESS',
  PUBLIC_CLIENT_AREA = 'PUBLIC_CLIENT_AREA', // New view for client history
  PUBLIC_LOGIN = 'PUBLIC_LOGIN',

  // SaaS Internal
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE', // Atendimentos
  SERVICES = 'SERVICES',
  CLIENTS = 'CLIENTS',
  CLIENT_DETAILS = 'CLIENT_DETAILS',
  COSTS = 'COSTS',
  REPORTS = 'REPORTS',
  AI_CHAT = 'AI_CHAT',
  PLANS = 'PLANS',
  SETTINGS = 'SETTINGS',

  // Legacy
  DESIGN_SYSTEM = 'DESIGN_SYSTEM'
}

export type ThemeType = 'default' | 'aurora';

export interface Client {
  id: string;
  name: string;
  phone: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'canceled' | 'in_progress' | 'reschedule';
  value: number;
  lastVisit?: string;
  totalSpent?: number;
}

export interface ExtendedClient extends Client {
  nps?: number;
  visits?: number;
  lastServiceDate?: string;
  date?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  tags?: string[];
  origin?: string; // Canais: Instagram, Google, Indicação, etc.
  serviceId?: string;
  address?: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  avatar?: string; // Base64 or URL
  paymentMethod?: 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro';
  cost?: number; // Cost of providing the service
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: number;
  category: string;
  type: 'service' | 'combo' | 'offer';
  includedServices?: string[];
  image?: string; // URL or Base64
  description?: string;
  validUntil?: string; // YYYY-MM-DD
  usageCount?: number;
  totalRevenue?: number;
  totalProfit?: number;
}

export interface BusinessSettings {
  businessName: string;
  slug: string;
  description: string;
  coverColor: string;
  coverImage: string | null;
  logo: string | null;
  themeColor: string;
  phone: string;
  address: string;
  openDays: string[];
  openTime: string;
  closeTime: string;
  ownerName: string;
  ownerTitle: string;
  email: string;
}

export interface Cost {
  id: string;
  title: string;
  category: 'Fixo' | 'Variável' | 'Marketing' | 'Pessoal' | 'Impostos';
  value: number;
  date: string; // YYYY-MM-DD
  status: 'paid' | 'pending';
  recurrence?: 'none' | 'monthly' | 'yearly';
  notes?: string;
}
