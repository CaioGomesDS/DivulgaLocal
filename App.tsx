
import React, { useState, useEffect, useMemo } from 'react';
import { DAYS_PT, MONTHS_PT, INITIAL_CATEGORIES } from './constants';
import { DailyData, Category, TaskItem } from './types';

const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="512" height="512" rx="128" fill="#4f46e5"/>
    <path d="M343.3 227.1L192 136v184l151.3-91.1a16.1 16.1 0 000-27.8zM160 160h-32a32 32 0 00-32 32v64a32 32 0 0032 32h32v-128z" fill="white"/>
    <path d="M192 352a32 32 0 01-32-32h-32a64.1 64.1 0 0064 64h16a16 16 0 000-32z" fill="white"/>
  </svg>
);

const App: React.FC = () => {
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [dailyData, setDailyData] = useState<DailyData>(() => {
    const saved = localStorage.getItem('divulgalocal_v3_data');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('divulgalocal_v3_data', JSON.stringify(dailyData));
  }, [dailyData]);

  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1);
  }, [selectedDate]);

  const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

  const currentDayData = useMemo(() => {
    if (!dailyData[dateKey]) {
      return { 
        categories: (JSON.parse(JSON.stringify(INITIAL_CATEGORIES)) as Category[]).map(c => ({ ...c, active: false })) 
      };
    }
    return dailyData[dateKey];
  }, [dailyData, dateKey]);

  const toggleCategory = (catId: string) => {
    const updatedCategories = currentDayData.categories.map(cat => {
      if (cat.id === catId) return { ...cat, active: !cat.active };
      return cat;
    });
    setDailyData(prev => ({ ...prev, [dateKey]: { categories: updatedCategories } }));
  };

  const updateTaskField = (catId: string, taskId: string, field: keyof TaskItem, value: any) => {
    const updatedCategories = currentDayData.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === taskId ? { ...item, [field]: value } : item)
        };
      }
      return cat;
    });
    setDailyData(prev => ({ ...prev, [dateKey]: { categories: updatedCategories } }));
  };

  const activeBtnStyles: Record<string, string> = {
    fb: 'bg-blue-600 text-white border-blue-600', 
    ig: 'bg-purple-600 text-white border-purple-600', 
    wa: 'bg-emerald-600 text-white border-emerald-600',
    olx: 'bg-orange-600 text-white border-orange-600', 
    tt: 'bg-slate-700 text-white border-slate-700', 
    ge: 'bg-indigo-600 text-white border-indigo-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Logo size={28} className="shadow-sm rounded-lg" />
              <h1 className="text-xl font-black text-indigo-600 tracking-tighter uppercase">DivulgaLocal</h1>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold block leading-none">{MONTHS_PT[selectedDate.getMonth()]}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedDate.getFullYear()}</span>
            </div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {daysInMonth.map((day) => {
              const isSelected = selectedDate.getDate() === day;
              const isToday = now.getDate() === day && now.getMonth() === selectedDate.getMonth();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'} ${isToday && !isSelected ? 'ring-2 ring-indigo-300' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Painel do Dia {selectedDate.getDate()}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentDayData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${cat.active ? activeBtnStyles[cat.id] : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {currentDayData.categories.filter(c => c.active).length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Logo size={32} className="opacity-20 grayscale" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Ative as redes que você vai usar hoje no menu acima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDayData.categories.filter(c => c.active).map((category) => (
              <div key={category.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black uppercase text-xs tracking-widest text-slate-700">{category.name}</h3>
                  <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {category.items.filter(i => i.completed).length} / {category.items.length}
                  </div>
                </div>
                <div className="p-6 space-y-6 flex-grow">
                  {category.items.map((item) => (
                    <div key={item.id} className="space-y-3 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateTaskField(category.id, item.id, 'completed', !item.completed)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-transparent'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                        </button>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${item.completed ? 'opacity-30 line-through' : 'text-slate-600'}`}>{item.label}</span>
                      </div>
                      <div className={`grid gap-2 transition-opacity ${item.completed ? 'opacity-40' : 'opacity-100'}`}>
                        <textarea
                          value={item.text}
                          onChange={(e) => updateTaskField(category.id, item.id, 'text', e.target.value)}
                          placeholder="Digite aqui o texto para copiar depois..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.images}
                            onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                            placeholder="Mídias (ex: Foto 1, Vídeo 2)"
                            className="flex-grow bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] outline-none"
                          />
                          <input
                            type="text"
                            value={item.tags}
                            onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                            placeholder="#Tags"
                            className="w-24 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-8 text-center bg-white border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">DivulgaLocal • Painel Estável Offline</p>
      </footer>
    </div>
  );
};

export default App;
