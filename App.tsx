
import React, { useState, useEffect, useMemo } from 'react';
import { DAYS_PT, MONTHS_PT, INITIAL_CATEGORIES } from './constants';
import { DailyData, Category, TaskItem, SyncState } from './types';

const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const App: React.FC = () => {
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const saved = localStorage.getItem('divulgalocal_sync_info');
    return saved ? JSON.parse(saved) : {
      syncId: generateShortId(),
      lastSync: null,
      status: 'idle'
    };
  });

  useEffect(() => {
    localStorage.setItem('divulgalocal_sync_info', JSON.stringify(syncState));
  }, [syncState]);

  const [dailyData, setDailyData] = useState<DailyData>(() => {
    const saved = localStorage.getItem('divulgalocal_v3_data');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('divulgalocal_v3_data', JSON.stringify(dailyData));
  }, [dailyData]);

  // Lógica de Sincronização Corrigida
  const syncToCloud = async () => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    try {
      // Usamos PUT para garantir que o ID seja criado/sobrescrito com o JSON
      const response = await fetch(`https://kvdb.io/A2wGidH6z2Bv4YvX5zWnB8/${syncState.syncId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dailyData),
      });

      if (response.ok) {
        setSyncState(prev => ({ 
          ...prev, 
          status: 'success', 
          lastSync: new Date().toLocaleTimeString() 
        }));
        alert("✅ Dados enviados com sucesso! Agora você pode baixar no outro aparelho.");
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 2000);
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
      alert("❌ Erro ao enviar. Verifique sua internet.");
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
        if (Object.keys(data).length === 0) {
          alert("⚠️ O ID existe, mas não contém dados salvos.");
          setSyncState(prev => ({ ...prev, status: 'idle' }));
          return;
        }
        setDailyData(data);
        setSyncState({
          syncId: targetId,
          lastSync: new Date().toLocaleTimeString(),
          status: 'success'
        });
        alert("✅ Dados baixados e sincronizados!");
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 2000);
      } else {
        alert("❌ ID NÃO ENCONTRADO.\n\nCertifique-se de clicar em 'ENVIAR DADOS' no aparelho original antes de tentar conectar no novo.");
        setSyncState(prev => ({ ...prev, status: 'error' }));
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
      alert("❌ Erro de conexão.");
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
    fb: 'text-blue-900', ig: 'text-purple-900', wa: 'text-emerald-900',
    olx: 'text-orange-900', tt: 'text-slate-900', ge: 'text-indigo-900'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-indigo-600 tracking-tighter uppercase">DivulgaLocal</h1>
              <button 
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 border border-indigo-100 transition-all"
              >
                <span className={`w-2 h-2 rounded-full ${syncState.lastSync ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></span>
                {syncState.lastSync ? 'Conectado' : 'Sincronizar'}
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

      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Nuvem DivulgaLocal</h3>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-[11px] font-bold text-indigo-700 uppercase mb-3 text-center">PASSO 1: No celular, envie seus dados</p>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-mono font-black text-indigo-900 tracking-[0.2em]">
                    {syncState.syncId}
                  </div>
                  <button 
                    onClick={syncToCloud}
                    className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-lg font-black text-xs uppercase shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                  >
                    {syncState.status === 'syncing' ? 'Enviando...' : '⬆️ ENVIAR MEUS DADOS AGORA'}
                  </button>
                </div>
              </div>

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative px-3 bg-white text-[10px] font-black text-slate-400 uppercase">Ou conecte outro</span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold text-slate-600 uppercase text-center">PASSO 2: No computador, cole o código</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: AB12CD"
                    id="id-input"
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('id-input') as HTMLInputElement;
                      if(input.value) loadFromCloud(input.value.toUpperCase());
                    }}
                    className="bg-slate-800 text-white px-6 rounded-lg text-xs font-black uppercase"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                {syncState.lastSync ? `Sincronizado às: ${syncState.lastSync}` : 'Aguardando primeira sincronização'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dia {selectedDate.getDate()}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentDayData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${cat.active ? activeBtnStyles[cat.id] : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {currentDayData.categories.filter(c => c.active).length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <h3 className="text-slate-400 font-black uppercase text-sm">Selecione uma rede social acima</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDayData.categories.filter(c => c.active).map((category) => (
              <div key={category.id} className={`${categoryStyles[category.id]} rounded-2xl border shadow-sm overflow-hidden`}>
                <div className="bg-white/50 px-6 py-3 border-b border-inherit flex justify-between items-center">
                  <h3 className={`font-black uppercase text-sm ${titleStyles[category.id]}`}>{category.name}</h3>
                  <div className="text-[10px] font-black opacity-50 uppercase">{category.items.filter(i => i.completed).length}/{category.items.length}</div>
                </div>
                <div className="p-6 space-y-6">
                  {category.items.map((item) => (
                    <div key={item.id} className="bg-white/40 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateTaskField(category.id, item.id, 'completed', !item.completed)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                        </button>
                        <span className={`text-sm font-black uppercase tracking-tight ${item.completed ? 'opacity-30 line-through' : 'text-slate-700'}`}>{item.label}</span>
                      </div>
                      <div className="grid gap-2">
                        <textarea
                          value={item.text}
                          onChange={(e) => updateTaskField(category.id, item.id, 'text', e.target.value)}
                          placeholder="Texto..."
                          className="w-full bg-white/80 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.images}
                            onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                            placeholder="Mídia..."
                            className="flex-grow bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none"
                          />
                          <input
                            type="text"
                            value={item.tags}
                            onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                            placeholder="Tags..."
                            className="w-24 bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none"
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

      <footer className="p-8 text-center border-t border-slate-100 bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle Manual • Sem Risco de Bloqueio • Cloud Ativo</p>
      </footer>
    </div>
  );
};

export default App;
