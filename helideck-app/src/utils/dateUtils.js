import { format, differenceInDays } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');

export const daysSince = (date) => differenceInDays(new Date(), new Date(date));

export const getInspectionStatus = (date) => {
  const days = daysSince(date);
  if (days >= 180) return { label: 'OVERDUE', color: 'bg-red-500' };
  if (days >= 150) return { label: 'Due in 30 days', color: 'bg-orange-400' };
  if (days >= 120) return { label: 'Due in 60 days', color: 'bg-yellow-300' };
  if (days >= 90) return { label: 'Due in 90 days', color: 'bg-blue-300' };
  return { label: 'Up to date', color: 'bg-green-500' };
};
