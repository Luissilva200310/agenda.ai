import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-green-50 text-brand-success border-green-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    danger: 'bg-red-50 text-brand-danger border-red-100',
    neutral: 'bg-gray-50 text-brand-muted border-gray-200',
    primary: 'bg-brand-soft text-brand-primary border-brand-soft',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};