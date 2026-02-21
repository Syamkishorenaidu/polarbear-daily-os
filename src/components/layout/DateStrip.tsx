import { cn } from '@/lib/utils';
import { format, subDays, isToday, isSameDay } from 'date-fns';

interface DateStripProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function DateStrip({ selectedDate, onChange }: DateStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  return (
    <div className="px-4 pt-2 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {days.map((day) => {
          const active = isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onChange(day)}
              className={cn(
                'flex flex-col items-center min-w-[48px] py-2 px-2 rounded-xl transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {today ? 'Today' : format(day, 'EEE')}
              </span>
              <span className={cn('text-lg font-bold', active && 'text-primary-foreground')}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
