import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer ${onClick ? 'hover:scale-105' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      
      {onClick && (
        <div className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
          Click to view details →
        </div>
      )}
    </div>
  );
};

export default DashboardWidget;
