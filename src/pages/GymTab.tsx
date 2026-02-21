import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { StatCard } from '@/components/common/StatCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Dumbbell, Plus, Trash2, Footprints, Weight, TrendingDown } from 'lucide-react';
import { uid, MUSCLE_GROUPS, type DayGymData, type Exercise } from '@/types/polarbear';
import { DEFAULT_GOALS } from '@/types/polarbear';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface GymTabProps { date: Date; }

export function GymTab({ date }: GymTabProps) {
  const dk = formatDateKey(date);
  const [goals] = useLocalStorage('pb_goals', DEFAULT_GOALS);
  const [data, setData] = useLocalStorage<DayGymData>(`pb_gym_${dk}`, { workouts: [], steps: 0, weight: 0 });
  const [openWorkout, setOpenWorkout] = useState(false);
  const [wName, setWName] = useState('');
  const [wGroup, setWGroup] = useState('Chest');
  const [wDuration, setWDuration] = useState('');
  const [wExercises, setWExercises] = useState<Exercise[]>([]);
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('');
  const [exReps, setExReps] = useState('');
  const [exWeight, setExWeight] = useState('');

  const stepsProgress = data.steps / goals.stepsGoal;

  // Weekly steps
  const weekSteps = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      try {
        const gd: DayGymData = JSON.parse(localStorage.getItem(`pb_gym_${formatDateKey(d)}`) || '{}');
        return { day: format(d, 'EEE'), steps: gd.steps || 0 };
      } catch { return { day: format(d, 'EEE'), steps: 0 }; }
    });
  }, [dk]);

  const addExercise = () => {
    if (!exName) return;
    setWExercises(prev => [...prev, { id: uid(), name: exName, sets: +exSets || 0, reps: +exReps || 0, weight: +exWeight || 0 }]);
    setExName(''); setExSets(''); setExReps(''); setExWeight('');
  };

  const handleAddWorkout = () => {
    if (!wName) return;
    setData(prev => ({
      ...prev,
      workouts: [...prev.workouts, { id: uid(), name: wName, muscleGroup: wGroup, duration: +wDuration || 0, exercises: wExercises, notes: '' }],
    }));
    setWName(''); setWDuration(''); setWExercises([]); setOpenWorkout(false);
  };

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      {/* Steps Ring + Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col items-center glow-primary">
          <p className="section-title mb-2">Steps</p>
          <ProgressRing progress={stepsProgress} size={90} strokeWidth={7}>
            <div className="text-center">
              <span className="text-lg font-bold">{data.steps.toLocaleString()}</span>
              <p className="text-[9px] text-muted-foreground">/ {(goals.stepsGoal / 1000).toFixed(0)}k</p>
            </div>
          </ProgressRing>
          <Input
            type="number" placeholder="Steps" className="mt-3 text-center h-8 text-sm"
            value={data.steps || ''}
            onChange={e => setData(prev => ({ ...prev, steps: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <p className="section-title mb-2">Weight</p>
          <div className="flex items-center gap-1 mb-2">
            <Weight size={18} className="text-accent" />
            <span className="stat-value text-2xl">{data.weight || '—'}</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <Input
            type="number" placeholder="Weight (kg)" className="text-center h-8 text-sm"
            value={data.weight || ''}
            onChange={e => setData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {/* Weekly steps chart */}
      <div className="glass-card p-4">
        <p className="section-title mb-3">Weekly Steps</p>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={weekSteps}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'hsl(215 12% 48%)', fontSize: 10 }} />
            <Bar dataKey="steps" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Workouts */}
      <div className="flex items-center justify-between">
        <p className="section-title">Workouts</p>
        <Drawer open={openWorkout} onOpenChange={setOpenWorkout}>
          <DrawerTrigger asChild>
            <Button size="sm" className="h-8 gap-1 rounded-full text-xs font-semibold"><Plus size={14} /> Add</Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-8 max-h-[85vh] overflow-y-auto">
            <DrawerHeader><DrawerTitle>Add Workout</DrawerTitle></DrawerHeader>
            <div className="space-y-3">
              <Input placeholder="Workout name" value={wName} onChange={e => setWName(e.target.value)} />
              <Select value={wGroup} onValueChange={setWGroup}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MUSCLE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Duration (min)" value={wDuration} onChange={e => setWDuration(e.target.value)} />
              
              <div className="border border-border rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold">Exercises ({wExercises.length})</p>
                {wExercises.map(ex => (
                  <div key={ex.id} className="text-xs text-muted-foreground">{ex.name} — {ex.sets}×{ex.reps} @ {ex.weight}kg</div>
                ))}
                <div className="grid grid-cols-4 gap-1">
                  <Input placeholder="Name" className="col-span-4 h-8 text-xs" value={exName} onChange={e => setExName(e.target.value)} />
                  <Input type="number" placeholder="Sets" className="h-8 text-xs" value={exSets} onChange={e => setExSets(e.target.value)} />
                  <Input type="number" placeholder="Reps" className="h-8 text-xs" value={exReps} onChange={e => setExReps(e.target.value)} />
                  <Input type="number" placeholder="kg" className="h-8 text-xs" value={exWeight} onChange={e => setExWeight(e.target.value)} />
                  <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={addExercise}>+</Button>
                </div>
              </div>
              <Button onClick={handleAddWorkout} className="w-full">Save Workout</Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {data.workouts.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No workouts" description="Log your gym session for today." />
      ) : (
        <div className="space-y-2">
          {data.workouts.map(w => (
            <div key={w.id} className="glass-card p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">{w.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{w.muscleGroup}</span>
              </div>
              <p className="text-xs text-muted-foreground">{w.duration}min • {w.exercises.length} exercises</p>
              {w.exercises.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {w.exercises.map(ex => (
                    <p key={ex.id} className="text-[11px] text-muted-foreground">{ex.name}: {ex.sets}×{ex.reps} @ {ex.weight}kg</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
