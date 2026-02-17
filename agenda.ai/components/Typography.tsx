import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Titles: 24–32px / peso 600
export const Heading1: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-xl md:text-[32px] font-semibold text-brand-text leading-tight ${className}`}>
    {children}
  </h1>
);

export const Heading2: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-lg md:text-2xl font-semibold text-brand-text leading-snug ${className}`}>
    {children}
  </h2>
);

// Subtítulos: 16–18px / peso 500
export const Subtitle: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-base md:text-lg font-medium text-brand-text ${className}`}>
    {children}
  </h3>
);

// Texto padrão: 14–16px / peso 400
export const BodyText: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm md:text-base font-normal text-brand-muted ${className}`}>
    {children}
  </p>
);

// Labels: 12–14px / peso 500
export const Label: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-xs md:text-sm font-medium text-brand-muted uppercase tracking-wide ${className}`}>
    {children}
  </span>
);