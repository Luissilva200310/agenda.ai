import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`bg-brand-bg border border-brand-border rounded-card shadow-sm ${noPadding ? '' : 'p-4 md:p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};