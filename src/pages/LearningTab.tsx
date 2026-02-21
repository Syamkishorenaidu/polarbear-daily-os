import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Trash2, Star } from 'lucide-react';
import { uid, type LearningSession } from '@/types/polarbear';

interface LearningTabProps { date: Date; }

export function LearningTab({ date }: LearningTabProps) {
  const dk = formatDateKey(date);
  const [sessions, setSessions] = useLocalStorage<LearningSession[]>(`pb_learning_${dk}`, []);
  const [activeSection, setActiveSection] = useState<'general' | 'dsa' | 'cert'>('general');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState(3);

  const filtered = useMemo(() => sessions.filter(s => s.section === activeSection), [sessions, activeSection]);
  const totalMins = useMemo(() => sessions.reduce((s, e) => s + e.duration, 0), [sessions]);
  const dsaCount = useMemo(() => sessions.filter(s => s.section === 'dsa').length, [sessions]);

  const handleAdd = () => {
    if (!title || !duration) return;
    setSessions(prev => [...prev, { id: uid(), title, notes, duration: parseInt(duration), difficulty, section: activeSection, tags: [] }]);
    setTitle(''); setNotes(''); setDuration(''); setOpen(false);
  };

  const handleDelete = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Study Time" value={`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`} icon={BookOpen} variant="primary" />
        <StatCard label="DSA Problems" value={dsaCount} subtitle="today" />
      </div>

      <Tabs value={activeSection} onValueChange={v => setActiveSection(v as any)}>
        <TabsList className="w-full bg-secondary">
          <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
          <TabsTrigger value="dsa" className="flex-1 text-xs">DSA</TabsTrigger>
          <TabsTrigger value="cert" className="flex-1 text-xs">Certification</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between">
        <p className="section-title">Sessions</p>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="sm" className="h-8 gap-1 rounded-full text-xs font-semibold"><Plus size={14} /> Add</Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-8">
            <DrawerHeader><DrawerTitle>Add {activeSection === 'dsa' ? 'DSA Problem' : activeSection === 'cert' ? 'Cert Session' : 'Study Session'}</DrawerTitle></DrawerHeader>
            <div className="space-y-3">
              <Input placeholder="Topic / Title" value={title} onChange={e => setTitle(e.target.value)} />
              <Input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
              <Input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(e.target.value)} />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Difficulty</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className="p-1">
                      <Star size={20} className={d <= difficulty ? 'fill-warning text-warning' : 'text-muted-foreground'} />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Save</Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No sessions yet" description={`Add your ${activeSection === 'dsa' ? 'DSA practice' : 'learning'} session.`} />
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="glass-card p-3 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{s.title}</h4>
                {s.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{s.notes}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{s.duration}m</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(d => (
                      <Star key={d} size={10} className={d <= s.difficulty ? 'fill-warning text-warning' : 'text-muted-foreground/30'} />
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
