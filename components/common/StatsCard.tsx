'use client';

import React, { ReactNode } from 'react';

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
  return (
    <div
      className="rounded-xl p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 hover:border-gray-600/50 hover:bg-gray-800/80 cursor-default backdrop-blur-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 rounded-xl bg-gray-800/80 border border-gray-700/50 text-gray-300 shadow-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

