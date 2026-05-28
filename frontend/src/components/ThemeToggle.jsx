import { useTheme } from '../contexts/ThemeContext';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex p-1 bg-zinc-100 dark:bg-[#1A1A1A] rounded-xl border border-zinc-200 dark:border-white/[0.05] w-fit">
      {[
        { name: 'light', icon: IconSun },
        { name: 'dark', icon: IconMoon },
        { name: 'system', icon: IconDeviceDesktop },
      ].map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`p-2 rounded-lg transition-all ${
            theme === t.name 
              ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-zinc-900 dark:text-white' 
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <t.icon size={16} />
        </button>
      ))}
    </div>
  );
};