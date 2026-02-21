import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Wallet, Plus, Trash2, IndianRupee, ArrowDownCircle, ArrowUpCircle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isAfter, isSameDay } from 'date-fns';
import { uid, EXPENSE_CATEGORIES, type Expense } from '@/types/polarbear';

interface ExpensesTabProps { date: Date; }

interface IncomeEntry {
  id: string;
  amount: number;
  description: string;
  date: string; // yyyy-MM-dd
}

const COLORS = ['hsl(187,75%,48%)', 'hsl(152,60%,42%)', 'hsl(38,85%,55%)', 'hsl(280,60%,58%)', 'hsl(0,72%,55%)', 'hsl(210,80%,55%)', 'hsl(320,65%,50%)', 'hsl(170,50%,45%)'];

/**
 * Gather all expenses for a date range from localStorage
 */
function getExpensesForRange(from: Date, to: Date): Expense[] {
  const days = eachDayOfInterval({ start: from, end: to });
  const all: Expense[] = [];
  for (const day of days) {
    try {
      const data: Expense[] = JSON.parse(localStorage.getItem(`pb_expenses_${formatDateKey(day)}`) || '[]');
      all.push(...data);
    } catch { /* skip */ }
  }
  return all;
}

/**
 * Calculate balance: find the most recent income on or before `date`,
 * then sum all expenses from that income date through end of month.
 */
function useBalanceCalc(date: Date, incomes: IncomeEntry[], todayExpensesTotal: number) {
  return useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const dk = formatDateKey(date);

    // Sort incomes by date descending to find the most recent one on or before selected date
    const sorted = [...incomes]
      .filter(i => i.date >= formatDateKey(monthStart) && i.date <= formatDateKey(monthEnd))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Find the latest income on or before selected date
    const activeIncome = sorted.find(i => i.date <= dk);

    if (!activeIncome) {
      // No income added yet this month — total all month expenses
      const monthExpenses = getExpensesForRange(monthStart, monthEnd);
      const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
      return { balance: 0 - totalSpent, income: 0, totalSpent, incomeDate: null };
    }

    // Find the next income AFTER this one (to know the range end)
    const nextIncome = sorted.find(i => i.date > activeIncome.date && i.date <= formatDateKey(monthEnd));
    const rangeStart = new Date(activeIncome.date + 'T00:00:00');
    const rangeEnd = nextIncome ? new Date(nextIncome.date + 'T00:00:00') : monthEnd;

    // Get expenses in this income period
    const periodExpenses = getExpensesForRange(rangeStart, rangeEnd);
    const totalSpent = periodExpenses.reduce((s, e) => s + e.amount, 0);

    return {
      balance: activeIncome.amount - totalSpent,
      income: activeIncome.amount,
      totalSpent,
      incomeDate: activeIncome.date,
    };
  }, [date, incomes, todayExpensesTotal]);
}

export function ExpensesTab({ date }: ExpensesTabProps) {
  const dk = formatDateKey(date);
  const monthKey = format(date, 'yyyy-MM');
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`pb_expenses_${dk}`, []);
  const [incomes, setIncomes] = useLocalStorage<IncomeEntry[]>(`pb_incomes_${monthKey}`, []);
  const [open, setOpen] = useState(false);
  const [openIncome, setOpenIncome] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'upi'>('upi');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDesc, setIncomeDesc] = useState('');

  const todayTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const { balance, income, totalSpent, incomeDate } = useBalanceCalc(date, incomes, todayTotal);

  // Monthly category data (all expenses for the month)
  const monthlyCategoryData = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const allExpenses = getExpensesForRange(monthStart, monthEnd);
    const map: Record<string, number> = {};
    allExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [dk]);

  const monthlyTotal = useMemo(() => monthlyCategoryData.reduce((s, d) => s + d.value, 0), [monthlyCategoryData]);

  const handleAdd = () => {
    if (!amount || !description) return;
    setExpenses(prev => [...prev, { id: uid(), amount: parseFloat(amount), category, description, paymentType }]);
    setAmount(''); setDescription(''); setOpen(false);
  };

  const handleAddIncome = () => {
    if (!incomeAmount) return;
    setIncomes(prev => [...prev, { id: uid(), amount: parseFloat(incomeAmount), description: incomeDesc || 'Income', date: dk }]);
    setIncomeAmount(''); setIncomeDesc(''); setOpenIncome(false);
  };

  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  const handleDeleteIncome = (id: string) => setIncomes(prev => prev.filter(i => i.id !== id));

  const paymentBadge = { cash: '💵', card: '💳', upi: '📱' };

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      {/* Balance Card */}
      <div className="glass-card p-4 glow-primary">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Balance</p>
          <Drawer open={openIncome} onOpenChange={setOpenIncome}>
            <DrawerTrigger asChild>
              <Button size="sm" variant="secondary" className="h-7 gap-1 rounded-full text-[10px] font-semibold">
                <ArrowDownCircle size={12} className="text-success" /> Add Income
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-8">
              <DrawerHeader><DrawerTitle>Add Income / Money In</DrawerTitle></DrawerHeader>
              <div className="space-y-3">
                <Input type="number" placeholder="Amount (₹)" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} />
                <Input placeholder="Source (e.g. Salary, Freelance)" value={incomeDesc} onChange={e => setIncomeDesc(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">This income will be added for {format(date, 'MMM d, yyyy')}. Expenses from this date until the next income entry will be deducted from it.</p>
                <Button onClick={handleAddIncome} className="w-full">Add Income</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`stat-value ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
            ₹{Math.abs(balance).toLocaleString('en-IN')}
          </span>
          {balance < 0 && <span className="text-xs text-destructive font-medium">overspent</span>}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <ArrowDownCircle size={14} className="text-success" />
            <div>
              <p className="text-[9px] text-muted-foreground">Income</p>
              <p className="text-xs font-semibold text-success">₹{income.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpCircle size={14} className="text-destructive" />
            <div>
              <p className="text-[9px] text-muted-foreground">Spent</p>
              <p className="text-xs font-semibold text-destructive">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </div>
          {incomeDate && (
            <div className="ml-auto">
              <p className="text-[9px] text-muted-foreground">Since</p>
              <p className="text-[10px] font-medium">{format(new Date(incomeDate + 'T00:00:00'), 'MMM d')}</p>
            </div>
          )}
        </div>

        {/* Income entries for this month */}
        {incomes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Income entries this month</p>
            {incomes.map(inc => (
              <div key={inc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-success text-[10px]">+</span>
                  <span className="text-xs font-medium">{inc.description}</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(inc.date + 'T00:00:00'), 'MMM d')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-success">₹{inc.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => handleDeleteIncome(inc.id)} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's spend */}
      <StatCard label="Today's Spend" value={`₹${todayTotal.toLocaleString('en-IN')}`} icon={IndianRupee} variant="accent" subtitle={format(date, 'MMM d')} />

      {/* Monthly Category Donut */}
      {monthlyCategoryData.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="section-title">Monthly Breakdown</p>
            <span className="text-[10px] text-muted-foreground font-medium">{format(date, 'MMMM yyyy')} • ₹{monthlyTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={monthlyCategoryData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                  {monthlyCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {monthlyCategoryData.map((d, i) => (
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
          <p className="section-title">Today's Transactions</p>
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
