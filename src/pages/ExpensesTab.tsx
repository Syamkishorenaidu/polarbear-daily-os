import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Wallet, Plus, Trash2, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { uid, EXPENSE_CATEGORIES, type Expense } from '@/types/polarbear';

interface ExpensesTabProps { date: Date; }

const COLORS = ['hsl(187,75%,48%)', 'hsl(152,60%,42%)', 'hsl(38,85%,55%)', 'hsl(280,60%,58%)', 'hsl(0,72%,55%)', 'hsl(210,80%,55%)', 'hsl(320,65%,50%)', 'hsl(170,50%,45%)'];

export function ExpensesTab({ date }: ExpensesTabProps) {
  const dk = formatDateKey(date);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`pb_expenses_${dk}`, []);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'upi'>('upi');

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const handleAdd = () => {
    if (!amount || !description) return;
    setExpenses(prev => [...prev, { id: uid(), amount: parseFloat(amount), category, description, paymentType }]);
    setAmount(''); setDescription(''); setOpen(false);
  };

  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const paymentBadge = { cash: '💵', card: '💳', upi: '📱' };

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      <StatCard label="Total Spent" value={`₹${total.toLocaleString('en-IN')}`} icon={IndianRupee} variant="accent" subtitle="today" />

      {/* Category Donut */}
      {categoryData.length > 0 && (
        <div className="glass-card p-4">
          <p className="section-title mb-2">By Category</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold">₹{d.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Transactions</p>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-8 gap-1 rounded-full text-xs font-semibold"><Plus size={14} /> Add</Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-8">
              <DrawerHeader><DrawerTitle>Add Expense</DrawerTitle></DrawerHeader>
              <div className="space-y-3">
                <Input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
                <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={paymentType} onValueChange={v => setPaymentType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} className="w-full">Save Expense</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {expenses.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses" description="Start tracking your spending today." />
        ) : (
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{paymentBadge[e.paymentType]}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate">{e.description}</h4>
                    <span className="text-[10px] text-muted-foreground">{e.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => handleDelete(e.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
