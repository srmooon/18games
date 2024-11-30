import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Função para combinar classes CSS de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
