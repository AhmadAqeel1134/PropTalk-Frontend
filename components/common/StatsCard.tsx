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
      className="rounded-lg p-6 bg-gray-900 border border-gray-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 hover:border-gray-700 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-3xl md:text-4xl font-semibold text-white mb-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 rounded-lg bg-gray-800 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

