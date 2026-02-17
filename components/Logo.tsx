
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ 
    size = 'md', 
    showText = true, 
    className = '', 
    textClassName = '',
    variant = 'dark'
}) => {
  const sizeMap = {
    sm: { w: 'w-8', h: 'h-8', radius: 'rounded-lg', text: 'text-lg', stroke: 3, sparkle: 10 },
    md: { w: 'w-10', h: 'h-10', radius: 'rounded-xl', text: 'text-xl', stroke: 3, sparkle: 12 },
    lg: { w: 'w-16', h: 'h-16', radius: 'rounded-2xl', text: 'text-3xl', stroke: 4, sparkle: 20 },
    xl: { w: 'w-24', h: 'h-24', radius: 'rounded-3xl', text: 'text-4xl', stroke: 5, sparkle: 28 },
  };

  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      <div className={`relative ${s.w} ${s.h} bg-gradient-to-tr from-[#8B5CF6] to-[#6C4CF1] ${s.radius} flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0`}>
         
         {/* Smile Curve */}
         <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             {/* Center smile */}
             <path d="M30 62 Q50 82 70 62" stroke="white" strokeWidth={s.stroke * 2} strokeLinecap="round" />
         </svg>

         {/* Sparkle (Top Right - positioned slightly overlapping the edge for dynamic feel) */}
         <div className="absolute top-[10%] right-[10%] text-white filter drop-shadow-sm animate-pulse-slow">
             <svg width={s.sparkle} height={s.sparkle} viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
             </svg>
         </div>
      </div>
      
      {showText && (
        <span className={`font-bold tracking-tight ${s.text} ${variant === 'dark' ? 'text-brand-text' : 'text-white'} ${textClassName}`}>
          Agenda.ai
        </span>
      )}
    </div>
  );
};
