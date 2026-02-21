import { useState, useMemo } from 'react';
import { useLocalStorage, formatDateKey } from '@/hooks/useLocalStorage';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Droplets, Plus, Trash2, UtensilsCrossed, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { uid, DEFAULT_GOALS, DEFAULT_CHECKLIST_ITEMS, type FoodItem, type MealData, type MealType, type Goals, type ChecklistItem } from '@/types/polarbear';

interface NutritionTabProps { date: Date; }

const MEAL_LABELS: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
const MEAL_EMOJIS: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍿' };

const emptyMeals: MealData = { breakfast: [], lunch: [], dinner: [], snacks: [] };

export function NutritionTab({ date }: NutritionTabProps) {
  const dk = formatDateKey(date);
  const [goals] = useLocalStorage<Goals>('pb_goals', DEFAULT_GOALS);
  const [checklistItems] = useLocalStorage<ChecklistItem[]>('pb_checklist_items', DEFAULT_CHECKLIST_ITEMS);
  const [water, setWater] = useLocalStorage<number>(`pb_water_${dk}`, 0);
  const [meals, setMeals] = useLocalStorage<MealData>(`pb_meals_${dk}`, emptyMeals);
  const [checklist, setChecklist] = useLocalStorage<Record<string, boolean>>(`pb_checklist_${dk}`, {});

  const [openFood, setOpenFood] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [foodCal, setFoodCal] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodQty, setFoodQty] = useState('');

  // Macro calculations
  const macros = useMemo(() => {
    const all = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snacks];
    return {
      calories: all.reduce((s, f) => s + f.calories, 0),
      protein: all.reduce((s, f) => s + f.protein, 0),
      carbs: all.reduce((s, f) => s + f.carbs, 0),
      fat: all.reduce((s, f) => s + f.fat, 0),
    };
  }, [meals]);

  const waterProgress = water / goals.waterGoal;
  const calProgress = macros.calories / goals.calorieTarget;
  const complianceCount = checklistItems.filter(item => checklist[item.id]).length;
  const complianceScore = checklistItems.length > 0 ? Math.round((complianceCount / checklistItems.length) * 100) : 0;

  const addWater = (ml: number) => setWater(prev => prev + ml);

  const handleAddFood = () => {
    if (!foodName) return;
    const item: FoodItem = { id: uid(), name: foodName, calories: +foodCal || 0, protein: +foodProtein || 0, carbs: +foodCarbs || 0, fat: +foodFat || 0, quantity: foodQty || '1 serving' };
    setMeals(prev => ({ ...prev, [activeMeal]: [...prev[activeMeal], item] }));
    setFoodName(''); setFoodCal(''); setFoodProtein(''); setFoodCarbs(''); setFoodFat(''); setFoodQty(''); setOpenFood(false);
  };

  const deleteFood = (meal: MealType, id: string) => setMeals(prev => ({ ...prev, [meal]: prev[meal].filter(f => f.id !== id) }));

  const toggleCheck = (id: string) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));

  const MacroBar = ({ label, value, target, color }: { label: string; value: number; target: number; color: string }) => {
    const pct = Math.min((value / target) * 100, 100);
    const delta = target - value;
    return (
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className="text-xs font-bold">{value}<span className="text-muted-foreground font-normal">/{target}</span></span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        {delta > 0 && <p className="text-[9px] text-muted-foreground mt-1">{delta}{label === 'Calories' ? ' kcal' : 'g'} remaining</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4 px-4 animate-fade-in">
      {/* Water Tracker */}
      <div className="glass-card p-4 glow-primary">
        <div className="flex items-center gap-4">
          <ProgressRing progress={waterProgress} size={80} strokeWidth={6} color="hsl(var(--info))">
            <div className="text-center">
              <Droplets size={16} className="text-info mx-auto" />
              <span className="text-xs font-bold">{(water / 1000).toFixed(1)}L</span>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <p className="section-title mb-1">Water Intake</p>
            <p className="text-sm text-muted-foreground mb-2">{water}ml / {goals.waterGoal}ml</p>
            <div className="flex gap-2">
              {[100, 250, 500].map(ml => (
                <Button key={ml} variant="secondary" size="sm" className="h-7 text-xs rounded-full" onClick={() => addWater(ml)}>
                  +{ml}ml
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Summary */}
      <div className="grid grid-cols-2 gap-2">
        <MacroBar label="Calories" value={macros.calories} target={goals.calorieTarget} color="hsl(var(--primary))" />
        <MacroBar label="Protein" value={macros.protein} target={goals.proteinTarget} color="hsl(var(--success))" />
        <MacroBar label="Carbs" value={macros.carbs} target={goals.carbsTarget} color="hsl(var(--warning))" />
        <MacroBar label="Fat" value={macros.fat} target={goals.fatTarget} color="hsl(var(--chart-4))" />
      </div>

      {/* Macro Suggestions */}
      {macros.protein < goals.proteinTarget && macros.calories > 0 && (
        <div className="glass-card p-3 flex items-start gap-2 border-warning/30">
          <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            You're short on protein by <span className="text-warning font-semibold">{goals.proteinTarget - macros.protein}g</span>. Consider adding a protein shake or eggs.
          </p>
        </div>
      )}

      {/* Meals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Meals</p>
          <Drawer open={openFood} onOpenChange={setOpenFood}>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-8 gap-1 rounded-full text-xs font-semibold"><Plus size={14} /> Add Food</Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-8">
              <DrawerHeader><DrawerTitle>Add Food Item</DrawerTitle></DrawerHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                    <Button key={m} variant={activeMeal === m ? 'default' : 'secondary'} size="sm" className="flex-1 text-xs h-8" onClick={() => setActiveMeal(m)}>
                      {MEAL_EMOJIS[m]} {MEAL_LABELS[m]}
                    </Button>
                  ))}
                </div>
                <Input placeholder="Food name" value={foodName} onChange={e => setFoodName(e.target.value)} />
                <Input placeholder="Quantity (e.g. 1 bowl)" value={foodQty} onChange={e => setFoodQty(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Calories" value={foodCal} onChange={e => setFoodCal(e.target.value)} />
                  <Input type="number" placeholder="Protein (g)" value={foodProtein} onChange={e => setFoodProtein(e.target.value)} />
                  <Input type="number" placeholder="Carbs (g)" value={foodCarbs} onChange={e => setFoodCarbs(e.target.value)} />
                  <Input type="number" placeholder="Fat (g)" value={foodFat} onChange={e => setFoodFat(e.target.value)} />
                </div>
                <Button onClick={handleAddFood} className="w-full">Add to {MEAL_LABELS[activeMeal]}</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {(Object.keys(MEAL_LABELS) as MealType[]).map(mealType => {
          const items = meals[mealType];
          if (items.length === 0) return null;
          const mealCal = items.reduce((s, f) => s + f.calories, 0);
          return (
            <div key={mealType} className="glass-card p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">{MEAL_EMOJIS[mealType]} {MEAL_LABELS[mealType]}</span>
                <span className="text-[10px] text-muted-foreground">{mealCal} kcal</span>
              </div>
              {items.map(f => (
                <div key={f.id} className="flex items-center justify-between py-1.5 border-t border-border/30">
                  <div>
                    <span className="text-xs font-medium">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{f.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{f.calories}cal • P{f.protein} C{f.carbs} F{f.fat}</span>
                    <button onClick={() => deleteFood(mealType, f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Fatloss Checklist */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-xs font-semibold">Daily Checklist</span>
          </div>
          <span className="text-xs font-bold text-success">{complianceScore}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${complianceScore}%` }} />
        </div>
        <div className="space-y-2.5">
          {checklistItems.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <Switch checked={!!checklist[item.id]} onCheckedChange={() => toggleCheck(item.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
