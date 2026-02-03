
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WeekData, AppState, DayData } from './types';
import { INITIAL_WEEKS, APP_STORAGE_KEY } from './constants';
import WeeklyLog from './components/WeeklyLog';
import ProgressDashboard from './components/ProgressDashboard';
import Header from './components/Header';
import RuleInfo from './components/RuleInfo';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
    return { weeks: INITIAL_WEEKS };
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatikus mentés a localStorage-be
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
    const now = new Date();
    setLastSaved(now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
  }, [state]);

  const updateDay = useCallback((weekNum: number, dayId: string, updates: Partial<DayData>) => {
    setState(prev => ({
      ...prev,
      weeks: prev.weeks.map(w => {
        if (w.weekNumber !== weekNum) return w;
        return {
          ...w,
          days: w.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
        };
      })
    }));
  }, []);

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `fighter-reset-naplo-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const importedState = JSON.parse(content);
          if (importedState.weeks) {
            setState(importedState);
            alert("Adatok sikeresen importálva!");
          }
        } catch (error) {
          alert("Hiba: Érvénytelen fájlformátum.");
        }
      }
    };
    fileReader.readAsText(files[0]);
  };

  const resetData = () => {
    if (window.confirm("Biztosan törölni akarod az összes eddigi adatot? Ez nem vonható vissza.")) {
      setState({ weeks: INITIAL_WEEKS });
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#0f0f0f]">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {/* Rule info moved to top */}
                <RuleInfo />
                
                {/* Week selection grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {state.weeks.map(week => (
                    <Link 
                      key={week.weekNumber} 
                      to={`/week/${week.weekNumber}`}
                      className="group p-6 bg-[#1a1a1a] border-l-4 border-red-700 hover:bg-[#252525] transition-all rounded-r-lg flex items-center justify-between shadow-lg"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-red-500">{week.weekNumber}. hét</h3>
                        <p className="text-gray-400 text-sm">Self-check napló töltése</p>
                      </div>
                      <span className="text-red-600 font-bold text-2xl">→</span>
                    </Link>
                  ))}
                </div>
                
                {/* Statistics section */}
                <div className="mt-12">
                   <ProgressDashboard weeks={state.weeks} />
                </div>

                {/* Data management section moved to the bottom */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Adatok a böngészőben tárolva</span>
                    {lastSaved && <span className="text-[10px] text-gray-600 italic">Utolsó mentés: {lastSaved}</span>}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={exportData}
                      className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-white text-xs font-bold rounded-lg transition-colors border border-[#333] flex items-center gap-2"
                    >
                      📁 Exportálás
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-white text-xs font-bold rounded-lg transition-colors border border-[#333] flex items-center gap-2"
                    >
                      📤 Importálás
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={importData} 
                      className="hidden" 
                      accept=".json"
                    />
                  </div>
                </div>

                {/* Reset button at the very bottom */}
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={resetData}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Minden adat törlése (Alaphelyzet)
                  </button>
                </div>
              </div>
            } />
            
            <Route path="/week/:weekNum" element={<WeeklyLog weeks={state.weeks} onUpdate={updateDay} />} />
          </Routes>
        </main>

        <footer className="py-8 bg-[#0a0a0a] text-center text-gray-500 text-sm border-t border-[#1a1a1a]">
          <p>© 2025 Fighter Reset</p>
          <p className="mt-1">Minden jog fenntartva</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
