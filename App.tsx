
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

  // Sincronização Robusta usando PUT
  const syncToCloud = async () => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    try {
      const response = await fetch(`https://kvdb.io/A2wGidH6z2Bv4YvX5zWnB8/${syncState.syncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dailyData),
      });

      if (response.ok) {
        setSyncState(prev => ({ 
          ...prev, 
          status: 'success', 
          lastSync: new Date().toLocaleTimeString() 
        }));
        alert("✅ SUCESSO! Dados enviados para a nuvem.\nAgora você pode usar o código " + syncState.syncId + " em outro aparelho.");
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 2000);
      } else {
        throw new Error();
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
      alert("❌ ERRO AO ENVIAR. Tente novamente.");
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
          lastSync: new Date().toLocaleTimeString(),
          status: 'success'
        });
        alert("✅ DADOS RECUPERADOS! Seu painel foi atualizado.");
        setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' })), 2000);
      } else {
        alert("❌ ID NÃO ENCONTRADO.\n\nVerifique se você clicou em 'ENVIAR DADOS' no celular primeiro.");
        setSyncState(prev => ({ ...prev, status: 'error' }));
      }
    } catch (e) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
      alert("❌ ERRO DE CONEXÃO.");
    }
  };

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
    fb: 'bg-blue-600 text-white', ig: 'bg-purple-600 text-white', wa: 'bg-emerald-600 text-white',
    olx: 'bg-orange-600 text-white', tt: 'bg-slate-700 text-white', ge: 'bg-indigo-600 text-white'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-indigo-600 tracking-tighter uppercase">DivulgaLocal</h1>
              <button 
                onClick={() => setShowSyncModal(true)}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase border border-indigo-100 flex items-center gap-2"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${syncState.lastSync ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                Nuvem
              </button>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold block leading-none">{MONTHS_PT[selectedDate.getMonth()]}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedDate.getFullYear()}</span>
            </div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {daysInMonth.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${selectedDate.getDate() === day ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black uppercase tracking-widest">Sincronização</h3>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Seu ID Atual</p>
                <div className="text-3xl font-mono font-black text-indigo-900 tracking-widest mb-4">{syncState.syncId}</div>
                <button 
                  onClick={syncToCloud}
                  disabled={syncState.status === 'syncing'}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {syncState.status === 'syncing' ? 'Enviando...' : '⬆️ Enviar dados deste aparelho'}
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute w-full border-t border-slate-100"></div>
                <span className="relative px-4 bg-white text-[10px] font-black text-slate-300 uppercase">Ou conectar outro</span>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase text-center">Digite o ID do outro dispositivo</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="EX: AB12CD"
                    id="id-input-cloud"
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-mono font-black uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('id-input-cloud') as HTMLInputElement;
                      if(input.value) loadFromCloud(input.value.toUpperCase());
                    }}
                    className="bg-slate-800 text-white px-6 rounded-xl text-xs font-black uppercase hover:bg-black transition-all"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {syncState.lastSync ? `Última sincronização: ${syncState.lastSync}` : 'Dados salvos apenas localmente'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dia {selectedDate.getDate()}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{DAYS_PT[selectedDate.getDay()]}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentDayData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${cat.active ? activeBtnStyles[cat.id] : 'bg-white text-slate-400 border-slate-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {currentDayData.categories.filter(c => c.active).length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Escolha um canal acima para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDayData.categories.filter(c => c.active).map((category) => (
              <div key={category.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black uppercase text-xs tracking-widest text-slate-700">{category.name}</h3>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
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
                          placeholder="Texto da postagem..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.images}
                            onChange={(e) => updateTaskField(category.id, item.id, 'images', e.target.value)}
                            placeholder="Mídias..."
                            className="flex-grow bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] outline-none"
                          />
                          <input
                            type="text"
                            value={item.tags}
                            onChange={(e) => updateTaskField(category.id, item.id, 'tags', e.target.value)}
                            placeholder="Tags..."
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

      <footer className="p-8 text-center bg-white border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">DivulgaLocal • Painel de Gestão Direta</p>
      </footer>
    </div>
  );
};

export default App;
