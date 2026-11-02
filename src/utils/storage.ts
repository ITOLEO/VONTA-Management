/**
 * Safe localStorage wrapper for VONTA
 * Surfaces quota/write errors and handles safe JSON reads/writes.
 */

export interface StorageWriteResult {
  success: boolean;
  error?: Error | unknown;
}

export function safeSetItem(key: string, value: string): StorageWriteResult {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    console.error(`[VONTA Storage Error] Failed to write key "${key}" to localStorage:`, error);
    return { success: false, error };
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`[VONTA Storage Error] Failed to read key "${key}" from localStorage:`, error);
    return null;
  }
}

export function safeRemoveItem(key: string): StorageWriteResult {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error(`[VONTA Storage Error] Failed to remove key "${key}" from localStorage:`, error);
    return { success: false, error };
  }
}
