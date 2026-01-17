
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

  // Definição centralizada de cores por rede social
  const brandStyles: Record<string, { btn: string, border: string, text: string, bg: string, accent: string, shadow: string, borderCard: string }> = {
    fb: { 
      btn: 'bg-blue-600 text-white border-blue-600', 
      border: 'border-blue-600', 
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      accent: 'bg-blue-600',
      shadow: 'shadow-blue-100',
      borderCard: 'border-blue-200'
    }, 
    ig: { 
      btn: 'bg-purple-600 text-white border-purple-600', 
      border: 'border-purple-600', 
      text: 'text-purple-700',
      bg: 'bg-purple-50',
      accent: 'bg-purple-600',
      shadow: 'shadow-purple-100',
      borderCard: 'border-purple-200'
    }, 
    wa: { 
      btn: 'bg-emerald-600 text-white border-emerald-600', 
      border: 'border-emerald-600', 
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      accent: 'bg-emerald-600',
      shadow: 'shadow-emerald-100',
      borderCard: 'border-emerald-200'
    },
    olx: { 
      btn: 'bg-orange-600 text-white border-orange-600', 
      border: 'border-orange-600', 
      text: 'text-orange-700',
      bg: 'bg-orange-50',
      accent: 'bg-orange-600',
      shadow: 'shadow-orange-100',
      borderCard: 'border-orange-200'
    }, 
    tt: { 
      btn: 'bg-slate-800 text-white border-slate-800', 
      border: 'border-slate-800', 
      text: 'text-slate-800',
      bg: 'bg-slate-50',
      accent: 'bg-slate-800',
      shadow: 'shadow-slate-100',
      borderCard: 'border-slate-200'
    }, 
    ge: { 
      btn: 'bg-indigo-600 text-white border-indigo-600', 
      border: 'border-indigo-600', 
      text: 'text-indigo-700',
      bg: 'bg-indigo-50',
      accent: 'bg-indigo-600',
      shadow: 'shadow-indigo-100',
      borderCard: 'border-indigo-200'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-12">
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
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-110 z-10' : 'bg-white text-slate-500 border border-slate-200'} ${isToday && !isSelected ? 'ring-2 ring-indigo-300' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Painel do Dia {selectedDate.getDate()}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentDayData.categories.map(cat => {
              const style = brandStyles[cat.id] || brandStyles.ge;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all duration-200 ${cat.active ? `${style.btn} ${style.shadow} scale-105` : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {currentDayData.categories.filter(c => c.active).length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Logo size={40} className="opacity-10 grayscale" />
            </div>
            <p className="text-slate-400 font-black uppercase text-sm tracking-widest max-w-xs mx-auto leading-relaxed">
              Selecione as redes sociais acima para começar sua jornada de hoje
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {currentDayData.categories.filter(c => c.active).map((category) => {
              const style = brandStyles[category.id] || brandStyles.ge;
              return (
                <div key={category.id} className={`bg-white rounded-[32px] border-2 ${style.borderCard} shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl`}>
                  <div className={`px-6 py-5 border-b-2 ${style.borderCard} flex justify-between items-center ${style.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${style.accent} animate-pulse`}></div>
                      <h3 className={`font-black uppercase text-sm tracking-widest ${style.text}`}>{category.name}</h3>
                    </div>
                    <div className={`text-[11px] font-black ${style.text} bg-white bg-opacity-60 px-3 py-1 rounded-full border ${style.borderCard}`}>
                      {category.items.filter(i => i.completed).length} de {category.items.length} concluído
                    </div>
                  </div>
                  <div className="p-6 space-y-8 flex-grow">
                    {category.items.map((item) => (
                      <div key={item.id} className="space-y-4 pb-8 border-b-2 border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => updateTaskField(category.id, item.id, 'completed', !item.completed)}
                            className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${item.completed ? `${style.accent} border-transparent text-white scale-110 shadow-md` : 'bg-white border-slate-200 text-transparent hover:border-indigo-400'}`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          </button>
                          <span className={`text-xs font-black uppercase tracking-tight ${item.completed ? 'opacity-30 line-through' : 'text-slate-700'}`}>{item.label}</span>
                        </div>
                        <div className={`grid gap-3 transition-all duration-300 ${item.completed ? 'opacity-30 scale-[0.98]' : 'opacity-100'}`}>
                          <textarea
                            value={item.text}
                            onChange={(e) => updateTaskField(category.id, item.id, 'text', e.target.value)}
                            placeholder="Texto para copiar..."
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 min-h-[100px] resize-none transition-all`}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                              <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-slate-400 uppercase">Mídias</span>
                              <input
                                type="text"
                                value={item.images}
                                onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                                placeholder="Arquivos"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[11px] outline-none focus:bg-white focus:border-indigo-200 transition-all"
                              />
                            </div>
                            <div className="relative group">
                              <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-slate-400 uppercase">Hashtags</span>
                              <input
                                type="text"
                                value={item.tags}
                                onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                                placeholder="#Tags"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[11px] outline-none focus:bg-white focus:border-indigo-200 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="p-8 text-center bg-white border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">DivulgaLocal • Painel Estável Offline</p>
      </footer>
    </div>
  );
};

export default App;
