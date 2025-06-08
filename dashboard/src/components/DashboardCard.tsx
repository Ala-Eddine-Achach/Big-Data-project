import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  subtitle?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  loading = false,
  error = null,
  onRetry,
  className = '',
  subtitle,
}) => {
  return (
    <div className={`bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      
      <div className="min-h-[200px] flex items-center justify-center">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};