'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'weather-bp-theme';
type Theme = 'light' | 'dark';

type SnapshotFn = () => Theme;

type Subscriber = () => void;

const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
};

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

let themeStore: Theme = getStoredTheme() ?? getPreferredTheme();
const subscribers = new Set<Subscriber>();
let listenersBound = false;

const notify = () => {
  subscribers.forEach((listener) => listener());
};

const setThemeStore = (nextTheme: Theme) => {
  if (themeStore === nextTheme) return;
  themeStore = nextTheme;
  applyTheme(nextTheme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }
  notify();
};

applyTheme(themeStore);

if (typeof window !== 'undefined' && !listenersBound) {
  listenersBound = true;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMedia = (event: MediaQueryListEvent) => {
    if (getStoredTheme()) return;
    setThemeStore(event.matches ? 'dark' : 'light');
  };
  media.addEventListener('change', handleMedia);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    const value = event.newValue === 'dark' ? 'dark' : 'light';
    setThemeStore(value);
  };
  window.addEventListener('storage', handleStorage);
}

const subscribe = (listener: Subscriber) => {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
};

const getSnapshot: SnapshotFn = () => themeStore;
const getServerSnapshot: SnapshotFn = () => 'light';

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => setThemeStore(theme === 'light' ? 'dark' : 'light');

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg border border-layer-3 bg-layer-1 text-text-secondary hover:text-text-primary hover:border-accent/50 hover:bg-layer-2 transition-colors"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
