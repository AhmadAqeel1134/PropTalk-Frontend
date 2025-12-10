'use client';

import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  subtitle
}) => {
  const { theme } = useTheme();
  
  return (
    <div
      className={`rounded-xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl cursor-default backdrop-blur-sm ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:shadow-black/30 hover:border-gray-600/50 hover:bg-gray-800/80'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:shadow-blue-100/50 hover:border-blue-400 hover:bg-white shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-xs font-semibold mb-3 uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <h3 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`ml-4 p-3 rounded-xl border shadow-lg ${
              theme === 'dark'
                ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
                : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

