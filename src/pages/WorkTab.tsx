import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Clock, Plus, Briefcase, Trash2, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { uid, WORK_CATEGORIES, type WorkEntry } from '@/types/polarbear';

interface WorkTabProps {
  date: Date;
}

export function WorkTab({ date }: WorkTabProps) {
  const dk = formatDateKey(date);
  const [entries, setEntries] = useLocalStorage<WorkEntry[]>(`pb_work_${dk}`, []);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Development');
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const totalMinutes = useMemo(() => entries.reduce((s, e) => s + e.duration, 0), [entries]);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  // Weekly data for chart
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = formatDateKey(d);
      try {
        const data: WorkEntry[] = JSON.parse(localStorage.getItem(`pb_work_${key}`) || '[]');
        return { day: format(d, 'EEE'), hours: +(data.reduce((s, e) => s + e.duration, 0) / 60).toFixed(1) };
      } catch { return { day: format(d, 'EEE'), hours: 0 }; }
    });
  }, [dk]);

  const handleAdd = () => {
    if (!title || !duration) return;
    setEntries(prev => [...prev, { id: uid(), title, notes, category, duration: parseInt(duration), priority }]);
    setTitle(''); setNotes(''); setDuration(''); setOpen(false);
  };

  const handleDelete = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const priorityColor = { low: 'text-info', medium: 'text-warning', high: 'text-destructive' };

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Time" value={`${hours}h ${mins}m`} icon={Clock} variant="primary" />
        <StatCard label="Tasks Done" value={entries.length} icon={Briefcase} subtitle="today" />
      </div>

      {/* Weekly chart */}
      <div className="glass-card p-4">
        <p className="section-title mb-3">This Week</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={weekData}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'hsl(215 12% 48%)', fontSize: 10 }} />
            <Bar dataKey="hours" fill="hsl(187 75% 48%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Today's Work</p>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-8 gap-1 rounded-full text-xs font-semibold">
                <Plus size={14} /> Add
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-8">
              <DrawerHeader><DrawerTitle>Add Work Entry</DrawerTitle></DrawerHeader>
              <div className="space-y-3">
                <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
                <Input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                <Input type="number" placeholder="Duration (minutes)" value={duration} onChange={e => setDuration(e.target.value)} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WORK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={priority} onValueChange={v => setPriority(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} className="w-full">Save Entry</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {entries.length === 0 ? (
          <EmptyState icon={Briefcase} title="No work logged" description="Tap + to log your first work entry for today." />
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="glass-card p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityColor[entry.priority]} bg-current`} />
                    <h4 className="font-semibold text-sm truncate">{entry.title}</h4>
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground truncate">{entry.notes}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{entry.category}</span>
                    <span className="text-[10px] text-muted-foreground">{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
