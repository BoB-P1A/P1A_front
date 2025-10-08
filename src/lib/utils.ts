import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get company-specific localStorage key
 * @param company - Company name (null for admin)
 * @param key - Base key name
 * @returns Company-specific key or base key for admin
 */
export function getCompanyStorageKey(company: string | null | undefined, key: string): string {
  if (!company || company === 'admin') {
    return key; // Admin uses global keys
  }
  return `company_${company}_${key}`;
}

/**
 * Get data from company-specific localStorage
 */
export function getCompanyData<T>(company: string | null | undefined, key: string, defaultValue: T): T {
  const storageKey = getCompanyStorageKey(company, key);
  const data = localStorage.getItem(storageKey);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

/**
 * Set data to company-specific localStorage
 */
export function setCompanyData<T>(company: string | null | undefined, key: string, data: T): void {
  const storageKey = getCompanyStorageKey(company, key);
  localStorage.setItem(storageKey, JSON.stringify(data));
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('storageUpdate', { detail: { key: storageKey } }));
}
