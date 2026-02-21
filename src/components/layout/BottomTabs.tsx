import { cn } from '@/lib/utils';
import { Briefcase, BookOpen, Dumbbell, Apple, Wallet } from 'lucide-react';

const tabs = [
  { icon: Briefcase, label: 'Work' },
  { icon: BookOpen, label: 'Learn' },
  { icon: Dumbbell, label: 'Gym' },
  { icon: Apple, label: 'Nutrition' },
  { icon: Wallet, label: 'Expenses' },
];

interface BottomTabsProps {
  active: number;
  onChange: (index: number) => void;
}

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="relative flex justify-around items-center h-16">
        {/* Animated indicator line */}
        <div
          className="absolute top-0 h-[2px] bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ left: `${active * 20 + 4}%`, width: '12%' }}
        />
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = active === i;
          return (
            <button
              key={tab.label}
              onClick={() => onChange(i)}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2 transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
