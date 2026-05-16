import { STORAGE_KEYS } from './constants';

/**
 * Generate a namespaced storage key
 */
export const getStorageKey = (key: string): string => {
  return `chatbot_${key}`;
};

/**
 * Load data from localStorage
 */
export const loadFromStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(getStorageKey(key));
    if (!item) return defaultValue ?? null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from storage (${key}):`, error);
    return defaultValue ?? null;
  }
};

/**
 * Save data to localStorage
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to storage (${key}):`, error);
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error(`Failed to remove from storage (${key}):`, error);
  }
};

/**
 * Clear all chatbot data from localStorage
 */
export const clearStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key);
  });
};
