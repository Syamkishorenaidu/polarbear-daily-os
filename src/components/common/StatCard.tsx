import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  unit?: string;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'glass-card',
  primary: 'glass-card glow-primary',
  accent: 'glass-card glow-accent',
  success: 'glass-card glow-success',
};

export function StatCard({ label, value, icon: Icon, unit, subtitle, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn(variantStyles[variant], 'p-4 animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="section-title mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="stat-value">{value}</span>
            {unit && <span className="text-sm text-muted-foreground font-medium">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-xl bg-secondary">
            <Icon size={18} className="text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
