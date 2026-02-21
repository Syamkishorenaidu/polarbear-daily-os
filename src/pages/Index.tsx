import { useState } from 'react';
import { format } from 'date-fns';
import { BottomTabs } from '@/components/layout/BottomTabs';
import { DateStrip } from '@/components/layout/DateStrip';
import { WorkTab } from './WorkTab';
import { LearningTab } from './LearningTab';
import { GymTab } from './GymTab';
import { NutritionTab } from './NutritionTab';
import { ExpensesTab } from './ExpensesTab';

const TAB_TITLES = ['Office Work', 'Learning', 'Gym & Activity', 'Nutrition', 'Expenses'];

const Index = () => {
  const [activeTab, setActiveTab] = useState(3); // Start on Nutrition (most important)
  const [selectedDate, setSelectedDate] = useState(new Date());

  

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="safe-area-top px-4 pt-3 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">🐻‍❄️ PolarBear</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{format(selectedDate, 'EEEE')}</p>
          <p className="text-xs font-semibold">{format(selectedDate, 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Date Strip */}
      <DateStrip selectedDate={selectedDate} onChange={setSelectedDate} />

      {/* Tab Title */}
      <div className="px-4 mb-3">
        <h2 className="text-xl font-bold">{TAB_TITLES[activeTab]}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 0 && <WorkTab date={selectedDate} />}
        {activeTab === 1 && <LearningTab date={selectedDate} />}
        {activeTab === 2 && <GymTab date={selectedDate} />}
        {activeTab === 3 && <NutritionTab date={selectedDate} />}
        {activeTab === 4 && <ExpensesTab date={selectedDate} />}
      </div>

      {/* Bottom Tabs */}
      <BottomTabs active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
