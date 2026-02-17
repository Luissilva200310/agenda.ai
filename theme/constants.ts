
export const CHART_COLORS = {
  primary: '#6C4CF1',
  secondary: '#F59E0B',
  success: '#22C55E',
  danger: '#EF4444',
  text: {
    dark: '#9CA3AF',
    light: '#6B7280'
  },
  grid: {
    dark: '#374151',
    light: '#F3F4F6'
  },
  categories: {
    hair: '#6C4CF1',
    nails: '#F472B6',
    esthetic: '#34D399'
  },
  channels: {
    instagram: '#6C4CF1',
    google: '#F59E0B',
    referral: '#22C55E',
    other: '#9CA3AF'
  }
};

export const TOOLTIP_STYLE = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
  color: isDarkMode ? '#F9FAFB' : '#111827',
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
});

export const METRICS = {
  billing: 'R$ 850,00',
  costs: 'R$ 120,00',
  profit: 'R$ 730,00',
  margin: '85%'
};
