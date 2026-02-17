import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-brand-text ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full h-[44px] rounded-input border bg-white px-4 text-brand-text placeholder-brand-muted/70
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
            disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger' : 'border-brand-border'}
            ${icon ? 'pl-11' : ''}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-brand-danger ml-1">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, children, className = '', ...props }) => {
    return (
        <div className={`w-full flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-brand-text ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`
                        w-full h-[44px] rounded-input border bg-white px-4 text-brand-text placeholder-brand-muted/70
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
                        disabled:bg-gray-50 disabled:text-gray-400
                        appearance-none
                        ${error ? 'border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger' : 'border-brand-border'}
                        ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                   <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
            </div>
            {error && <span className="text-xs text-brand-danger ml-1">{error}</span>}
        </div>
    );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`w-full flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-brand-text ml-1">
                    {label}
                </label>
            )}
            <textarea
                className={`
            w-full rounded-input border bg-white p-4 text-brand-text placeholder-brand-muted/70
            transition-all duration-200 min-h-[100px]
            focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
            disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger' : 'border-brand-border'}
            ${className}
          `}
                {...props}
            />
            {error && <span className="text-xs text-brand-danger ml-1">{error}</span>}
        </div>
    );
};