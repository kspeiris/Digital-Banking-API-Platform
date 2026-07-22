import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-md p-1.5 transition-colors ${
          theme === 'light'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-md p-1.5 transition-colors ${
          theme === 'dark'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-md p-1.5 transition-colors ${
          theme === 'system'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
        aria-label="System theme"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
export default ThemeSwitcher;
