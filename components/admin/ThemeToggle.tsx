'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all duration-200 ease-out shadow-lg hover:shadow-xl ${
        theme === 'dark'
          ? 'bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white'
          : 'bg-white/90 border border-gray-200/60 text-gray-600 hover:border-gray-300 hover:text-gray-900 shadow-gray-200/50'
      }`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="transition-all duration-200 ease-out" />
      ) : (
        <Moon size={20} className="transition-all duration-200 ease-out" />
      )}
    </button>
  );
};

export default ThemeToggle;

