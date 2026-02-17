import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Heading2 } from './Typography';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md'
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative bg-white rounded-card shadow-xl w-full ${sizeClasses[size]} 
        flex flex-col max-h-[90vh]
        animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <Heading2 className="text-xl md:text-xl">{title}</Heading2>
          <button 
            onClick={onClose}
            className="text-brand-muted hover:text-brand-text hover:bg-brand-surface p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-brand-border bg-brand-surface/30 rounded-b-card flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};