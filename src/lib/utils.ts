import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, maxLen: number) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export function formatVintage(year?: number) {
  if (!year) return '';
  return year.toString();
}
