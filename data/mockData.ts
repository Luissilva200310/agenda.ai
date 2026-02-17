
import { ExtendedClient, ServiceItem, Cost } from '../types';
import { formatDateKey } from '../utils/formatters';
import { CHART_COLORS } from '../theme/constants';

export const initialAppointments: ExtendedClient[] = [
  { id: '1', name: 'Ana Clara', phone: '(11) 99999-1234', service: 'Corte + Hidratação', time: '09:00', endTime: '10:00', date: formatDateKey(new Date()), status: 'completed', value: 180, cost: 40, paymentMethod: 'Pix', lastVisit: '10/10/2023', totalSpent: 1250, nps: 5, visits: 12, origin: 'Instagram' },
  { id: '2', name: 'Beatriz Costa', phone: '(11) 99999-5678', service: 'Manicure', time: '10:30', endTime: '11:30', date: formatDateKey(new Date()), status: 'completed', value: 45, cost: 10, paymentMethod: 'Dinheiro', lastVisit: '15/10/2023', totalSpent: 320, nps: 4, visits: 3, origin: 'Indicação' },
  { id: '3', name: 'Carla Dias', phone: '(11) 98888-9999', service: 'Mechas', time: '13:00', endTime: '16:00', date: formatDateKey(new Date()), status: 'completed', value: 350, cost: 120, paymentMethod: 'Crédito', lastVisit: '05/09/2023', totalSpent: 2100, nps: 5, visits: 8, origin: 'Instagram' },
  { id: '4', name: 'Diana Lima', phone: '(11) 97777-1111', service: 'Corte Feminino', time: '16:30', endTime: '17:30', date: formatDateKey(new Date()), status: 'confirmed', value: 80, cost: 15, paymentMethod: 'Crédito', lastVisit: '20/10/2023', totalSpent: 450, nps: 4, visits: 5, origin: 'Google' },
  { id: '5', name: 'Elena Souza', phone: '(11) 96666-2222', service: 'Hidratação Profunda', time: '09:00', endTime: '09:45', date: formatDateKey(new Date(Date.now() + 86400000)), status: 'confirmed', value: 120, cost: 30, paymentMethod: 'Pix', lastVisit: '12/10/2023', totalSpent: 600, nps: 5, visits: 4, origin: 'Instagram' },
];

export const servicesList: ServiceItem[] = [
  { id: '1', name: 'Corte Feminino', price: 80, duration: 60, category: 'Cabelo', type: 'service' },
  { id: '2', name: 'Hidratação Profunda', price: 120, duration: 45, category: 'Cabelo', type: 'service' },
  { id: '3', name: 'Manicure', price: 45, duration: 45, category: 'Unhas', type: 'service' },
  { id: '4', name: 'Mechas', price: 350, duration: 180, category: 'Cabelo', type: 'service' },
  { id: '5', name: 'Dia de Rainha', price: 200, duration: 120, category: 'Pacote', type: 'combo', includedServices: ['Corte Feminino', 'Hidratação', 'Manicure'] },
  { id: '6', name: 'Escova Progressiva (Promo)', price: 180, originalPrice: 250, duration: 120, category: 'Cabelo', type: 'offer' },
  { id: '7', name: 'Pé e Mão', price: 80, duration: 60, category: 'Unhas', type: 'combo', includedServices: ['Manicure', 'Pedicure'] },
];

export const costsList: Cost[] = [
  { id: '1', title: 'Aluguel do Espaço', category: 'Fixo', date: '2023-10-05', value: 2500, status: 'paid', recurrence: 'monthly' },
  { id: '2', title: 'Produtos L\'Oréal', category: 'Variável', date: '2023-10-10', value: 850, status: 'paid', recurrence: 'none' },
  { id: '3', title: 'Conta de Luz', category: 'Fixo', date: '2023-10-15', value: 320, status: 'pending', recurrence: 'monthly' },
  { id: '4', title: 'Marketing Instagram', category: 'Marketing', date: '2023-10-20', value: 150, status: 'pending', recurrence: 'none' },
];

export const financeData = [
  { name: 'Seg', valor: 450, custos: 100 },
  { name: 'Ter', valor: 620, custos: 150 },
  { name: 'Qua', valor: 580, custos: 120 },
  { name: 'Qui', valor: 890, custos: 200 },
  { name: 'Sex', valor: 1200, custos: 300 },
  { name: 'Sáb', valor: 1450, custos: 400 },
];

export const servicesShareData = [
  { name: 'Cabelo', value: 65, color: CHART_COLORS.categories.hair },
  { name: 'Unhas', value: 25, color: CHART_COLORS.categories.nails },
  { name: 'Estética', value: 10, color: CHART_COLORS.categories.esthetic },
];

export const paymentMethodsData = [
  { name: 'Pix', value: 45, color: CHART_COLORS.success },
  { name: 'Crédito', value: 35, color: CHART_COLORS.primary },
  { name: 'Dinheiro', value: 20, color: CHART_COLORS.secondary },
];

export const clientDetailsMock = {
  id: '1',
  name: 'Ana Clara',
  email: 'ana.clara@email.com',
  phone: '(11) 99999-1234',
  instagram: '@ana.clara_beauty',
  avatar: 'A',
  status: 'VIP',
  totalSpent: 1250,
  visits: 8,
  avgTicket: 156.25,
  lastVisit: '10/10/2023',
  since: '05/01/2023',
  origin: 'Instagram',
  tags: ['VIP', 'Pontual', 'Gosta de Café'],
  history: [
    { id: 101, date: '10/10/2023', service: 'Corte + Hidratação', value: 180, status: 'completed' },
    { id: 102, date: '15/09/2023', service: 'Manicure', value: 45, status: 'completed' },
    { id: 103, date: '01/08/2023', service: 'Mechas', value: 350, status: 'completed' },
  ],
  reviews: [
    { id: 1, date: '10/10/2023', stars: 5, comment: 'Amei o corte! A Dra. Júlia é fantástica.' }
  ],
  spendingHistory: [
    { name: 'Jul', valor: 0 },
    { name: 'Ago', valor: 350 },
    { name: 'Set', valor: 45 },
    { name: 'Out', valor: 180 },
  ],
  photos: [
    { id: 1, url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', date: '10/10/2023' },
    { id: 2, url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', date: '05/09/2023' },
  ]
};
