
import React, { useState, useEffect, useMemo } from 'react';
import { DAYS_PT, MONTHS_PT, INITIAL_CATEGORIES } from './constants';
import { DailyData, Category, TaskItem } from './types';

const App: React.FC = () => {
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mapeamento de cores mais visíveis por categoria
  const categoryStyles: Record<string, string> = {
    fb: 'bg-blue-100 border-blue-200',
    ig: 'bg-purple-100 border-purple-200',
    wa: 'bg-emerald-100 border-emerald-200',
    olx: 'bg-orange-100 border-orange-200',
    tt: 'bg-slate-200 border-slate-300',
    ge: 'bg-indigo-100 border-indigo-200'
  };

  // Cores de botões ativos para o seletor
  const activeBtnStyles: Record<string, string> = {
    fb: 'bg-blue-600 text-white border-blue-600',
    ig: 'bg-purple-600 text-white border-purple-600',
    wa: 'bg-emerald-600 text-white border-emerald-600',
    olx: 'bg-orange-600 text-white border-orange-600',
    tt: 'bg-slate-700 text-white border-slate-700',
    ge: 'bg-indigo-600 text-white border-indigo-600'
  };

  const titleStyles: Record<string, string> = {
    fb: 'text-blue-900',
    ig: 'text-purple-900',
    wa: 'text-emerald-900',
    olx: 'text-orange-900',
    tt: 'text-slate-900',
    ge: 'text-indigo-900'
  };

  // Persistência de dados
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
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }, [selectedDate]);

  const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

  const currentDayData = useMemo(() => {
    if (!dailyData[dateKey]) {
      // Por padrão, categorias começam inativas para forçar a escolha, ou ativas se preferir.
      // Vamos iniciar com todas inativas para o usuário escolher o que quer fazer no dia.
      return { 
        categories: (JSON.parse(JSON.stringify(INITIAL_CATEGORIES)) as Category[]).map(c => ({ ...c, active: false })) 
      };
    }
    return dailyData[dateKey];
  }, [dailyData, dateKey]);

  const toggleCategory = (catId: string) => {
    const updatedCategories = currentDayData.categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, active: !cat.active };
      }
      return cat;
    });

    setDailyData(prev => ({
      ...prev,
      [dateKey]: { categories: updatedCategories }
    }));
  };

  const updateTaskField = (catId: string, taskId: string, field: keyof TaskItem, value: any) => {
    const updatedCategories = currentDayData.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === taskId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    });

    setDailyData(prev => ({
      ...prev,
      [dateKey]: { categories: updatedCategories }
    }));
  };

  const selectDay = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const activeCategories = currentDayData.categories.filter(c => c.active);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 text-slate-900">
      {/* Calendário Numérico Simplificado */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h1 className="text-xl font-black text-indigo-600 tracking-tighter">DIVULGALOCAL</h1>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-800">{MONTHS_PT[selectedDate.getMonth()]}</span>
              <span className="text-slate-400 font-medium">/ {selectedDate.getFullYear()}</span>
            </div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {daysInMonth.map((day) => {
              const isSelected = selectedDate.getDate() === day;
              const isToday = now.getDate() === day && now.getMonth() === selectedDate.getMonth() && now.getFullYear() === selectedDate.getFullYear();
              
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all
                    ${isSelected 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-indigo-200' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-6 border-l-4 border-indigo-600 pl-4 py-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Painel do Dia {selectedDate.getDate()}
            </h2>
            <p className="text-slate-500 text-sm font-medium">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          
          {/* Seletor de Categorias do Dia */}
          <div className="flex flex-wrap gap-2">
            {currentDayData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`
                  px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                  ${cat.active 
                    ? activeBtnStyles[cat.id] || 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {activeCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight">Nada planejado para hoje?</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Selecione os canais que você pretende utilizar hoje no menu acima para começar a preencher os dados.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCategories.map((category) => (
              <div 
                key={category.id} 
                className={`${categoryStyles[category.id] || 'bg-white border-slate-200'} rounded-2xl border shadow-md overflow-hidden transition-all hover:shadow-lg`}
              >
                <div className="bg-white/40 border-b border-inherit px-6 py-4 flex items-center justify-between">
                  <h3 className={`text-lg font-black uppercase tracking-wider ${titleStyles[category.id] || 'text-slate-800'}`}>
                    {category.name}
                  </h3>
                  <span className="bg-white/80 border border-inherit px-2 py-1 rounded-md text-[10px] font-black text-slate-600">
                    {category.items.length} TAREFAS
                  </span>
                </div>
                
                <div className="p-6 space-y-8">
                  {category.items.map((item) => (
                    <div key={item.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateTaskField(category.id, item.id, 'completed', !item.completed)}
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all
                            ${item.completed 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'bg-white border-slate-300 text-transparent hover:border-indigo-500 shadow-sm'
                            }
                          `}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </button>
                        <h4 className={`text-base font-black tracking-tight ${item.completed ? 'text-slate-500 line-through opacity-60' : 'text-slate-800'}`}>
                          {item.label}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 pl-10">
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1 ml-1">Texto</label>
                          <textarea
                            value={item.text}
                            onChange={(e) => updateTaskField(category.id, item.id, 'text', e.target.value)}
                            placeholder="Digite aqui o texto da postagem..."
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none min-h-[70px] placeholder:text-slate-400"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1 ml-1">Imagens</label>
                            <input
                              type="text"
                              value={item.images}
                              onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                              placeholder="Ex: Foto antes/depois"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1 ml-1">Tags</label>
                            <input
                              type="text"
                              value={item.tags}
                              onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                              placeholder="Ex: #limpeza #sp"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                            />
                          </div>
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

      <footer className="p-10 text-center border-t border-slate-200 bg-white">
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Painel Manual de Divulgação Local</p>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Sem automação • Sem riscos • Organização total</p>
      </footer>
    </div>
  );
};

export default App;
