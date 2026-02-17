
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};
