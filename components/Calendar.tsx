import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  className?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  className = '', 
  selectedDate = new Date(),
  onDateChange
}) => {
  // Internal state for the currently viewed month, distinct from the selected date
  const [viewDate, setViewDate] = useState(selectedDate);

  // Sync view if selectedDate changes significantly (optional, kept simple here)
  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= days; i++) {
      daysArray.push(new Date(year, month, i));
    }
    return daysArray;
  };

  const days = getDaysInMonth(viewDate);
  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <div className={`bg-white border border-brand-border rounded-card p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-brand-text capitalize">
          {monthName}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-brand-surface text-brand-muted hover:text-brand-text rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-brand-surface text-brand-muted hover:text-brand-text rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-2 mb-2">
        {daysOfWeek.map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-center text-xs font-medium text-brand-muted uppercase py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          
          const isSelected = isSameDay(date, selectedDate);
          const today = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange && onDateChange(date)}
              className={`
                h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition-all duration-200
                ${isSelected 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 font-medium' 
                  : 'text-brand-text hover:bg-brand-soft hover:text-brand-primary'
                }
                ${!isSelected && today ? 'border border-brand-primary text-brand-primary font-medium' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-brand-border">
        <div className="flex items-center gap-4 text-xs text-brand-muted justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-brand-primary"></div>
            <span>Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
};