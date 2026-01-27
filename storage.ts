
const memoryStore: Record<string, string> = {};
let _isAvailable: boolean | null = null;

const checkAvailability = (): boolean => {
  if (_isAvailable !== null) return _isAvailable;
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      _isAvailable = false;
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    _isAvailable = true;
    return true;
  } catch (e) {
    _isAvailable = false;
    return false;
  }
};

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (checkAvailability()) {
      try { return window.localStorage.getItem(key); } catch {}
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (checkAvailability()) {
      try { window.localStorage.setItem(key, value); return; } catch {}
    }
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    if (checkAvailability()) {
      try { window.localStorage.removeItem(key); return; } catch {}
    }
    delete memoryStore[key];
  }
};
