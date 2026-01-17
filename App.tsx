
import React, { useState, useEffect, useMemo } from 'react';
import { DAYS_PT, MONTHS_PT, INITIAL_CATEGORIES } from './constants';
import { DailyData, Category, TaskItem, SyncState } from './types';

// Função auxiliar para gerar ID único curto
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const App: React.FC = () => {
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  // Estado de Sincronização
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const saved = localStorage.getItem('divulgalocal_sync_info');
    return saved ? JSON.parse(saved) : {
      syncId: generateShortId(),
      lastSync: null,
      status: 'idle'
    };
  });

  // Persistência do Sync Info
  useEffect(() => {
    localStorage.setItem('divulgalocal_sync_info', JSON.stringify(syncState));
  }, [syncState]);

  const categoryStyles: Record<string, string> = {
    fb: 'bg-blue-100 border-blue-200',
    ig: 'bg-purple-100 border-purple-200',
    wa: 'bg-emerald-100 border-emerald-200',
    olx: 'bg-orange-100 border-orange-200',
    tt: 'bg-slate-200 border-slate-300',
    ge: 'bg-indigo-100 border-indigo-200'
  };

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

  const [dailyData, setDailyData] = useState<DailyData>(() => {
    const saved = localStorage.getItem('divulgalocal_v3_data');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('divulgalocal_v3_data', JSON.stringify(dailyData));
  }, [dailyData]);

  // Lógica de Sincronização na Nuvem
  // Usaremos a API kvdb.io para persistência sem login (bucket público por ID)
  const syncToCloud = async () => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    try {
      // Usamos um bucket genérico prefixado para evitar colisões
      const response = await fetch(`https://kvdb.io/A2wGidH6z2Bv4YvX5zWnB8/${syncState.syncId}`, {
        method: 'POST',
        body: JSON.stringify(dailyData),
      });
      if (response.ok) {
        setSyncState(prev => ({ ...prev, status: 'success', lastSync: new Date().toLocaleString() }));
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 3000);
      } else {
        throw new Error();
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
      setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 3000);
    }
  };

  const loadFromCloud = async (idToLoad?: string) => {
    const targetId = idToLoad || syncState.syncId;
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    try {
      const response = await fetch(`https://kvdb.io/A2wGidH6z2Bv4YvX5zWnB8/${targetId}`);
      if (response.ok) {
        const data = await response.json();
        setDailyData(data);
        setSyncState({
          syncId: targetId,
          lastSync: new Date().toLocaleString(),
          status: 'success'
        });
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 3000);
      } else {
        alert("ID não encontrado na nuvem.");
        setSyncState(prev => ({ ...prev, status: 'error' }));
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
    }
  };

  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
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
      if (cat.id === catId) {
        return { ...cat, active: !cat.active };
      }
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

  const activeCategories = currentDayData.categories.filter(c => c.active);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 text-slate-900">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-indigo-600 tracking-tighter">DIVULGALOCAL</h1>
              <button 
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                {syncState.lastSync ? 'Sincronizado' : 'Nuvem'}
              </button>
            </div>
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
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'} ${isToday && !isSelected ? 'ring-2 ring-indigo-200' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Modal de Sincronização */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sincronização em Nuvem</h3>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Seu Código Único</label>
                <div className="flex gap-2">
                  <div className="flex-grow bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-mono font-bold text-lg text-indigo-700 tracking-widest">
                    {syncState.syncId}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(syncState.syncId);
                      alert("Código copiado!");
                    }}
                    className="bg-white border border-slate-200 px-4 rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Use este código no seu celular ou outro computador para acessar os mesmos dados.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={syncToCloud}
                  disabled={syncState.status === 'syncing'}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <span className="text-xs font-black uppercase">Enviar Dados</span>
                </button>
                <button 
                  onClick={() => loadFromCloud()}
                  disabled={syncState.status === 'syncing'}
                  className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                  <span className="text-xs font-black uppercase">Baixar Dados</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Conectar a outro dispositivo</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Cole o código aqui..."
                    id="id-input"
                    className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('id-input') as HTMLInputElement;
                      if(input.value) loadFromCloud(input.value.toUpperCase());
                    }}
                    className="bg-slate-800 text-white px-4 rounded-xl text-xs font-black uppercase"
                  >
                    Conectar
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100">
              <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest">
                {syncState.status === 'syncing' ? 'Sincronizando...' : syncState.lastSync ? `Última sincronização: ${syncState.lastSync}` : 'Não sincronizado com a nuvem'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-6 border-l-4 border-indigo-600 pl-4 py-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Painel do Dia {selectedDate.getDate()}</h2>
            <p className="text-slate-500 text-sm font-medium">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentDayData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${cat.active ? activeBtnStyles[cat.id] || 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
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
              <div key={category.id} className={`${categoryStyles[category.id] || 'bg-white border-slate-200'} rounded-2xl border shadow-md overflow-hidden transition-all hover:shadow-lg`}>
                <div className="bg-white/40 border-b border-inherit px-6 py-4 flex items-center justify-between">
                  <h3 className={`text-lg font-black uppercase tracking-wider ${titleStyles[category.id] || 'text-slate-800'}`}>{category.name}</h3>
                  <span className="bg-white/80 border border-inherit px-2 py-1 rounded-md text-[10px] font-black text-slate-600">{category.items.length} TAREFAS</span>
                </div>
                <div className="p-6 space-y-8">
                  {category.items.map((item) => (
                    <div key={item.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateTaskField(category.id, item.id, 'completed', !item.completed)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${item.completed ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-300 text-transparent hover:border-indigo-500 shadow-sm'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </button>
                        <h4 className={`text-base font-black tracking-tight ${item.completed ? 'text-slate-500 line-through opacity-60' : 'text-slate-800'}`}>{item.label}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 pl-10">
                        <textarea
                          value={item.text}
                          onChange={(e) => updateTaskField(category.id, item.id, 'text', e.target.value)}
                          placeholder="Texto da postagem..."
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[70px]"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.images}
                            onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                            placeholder="Imagens (Ex: Antes/Depois)"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <input
                            type="text"
                            value={item.tags}
                            onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                            placeholder="Tags (Ex: #limpeza #sp)"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

      <footer className="p-10 text-center border-t border-slate-200 bg-white">
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Painel Manual de Divulgação Local</p>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Sem automação • Sem riscos • Sincronização em Nuvem</p>
      </footer>
    </div>
  );
};

export default App;
