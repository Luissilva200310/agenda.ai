import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false, 
  leftIcon,
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "rounded-btn font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-[44px] px-6 text-sm md:text-base",
    lg: "h-12 px-8 text-base md:text-lg"
  };

  const variants = {
    primary: "bg-brand-primary text-white hover:bg-[#583FD4] focus:ring-brand-primary shadow-sm hover:shadow-md",
    secondary: "bg-brand-soft text-brand-primary hover:bg-[#E6DBFF] focus:ring-brand-primary/50",
    danger: "bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 focus:ring-brand-danger",
    ghost: "bg-transparent text-brand-muted hover:bg-brand-soft hover:text-brand-primary",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="w-5 h-5">{leftIcon}</span>}
      {children}
    </button>
  );
};