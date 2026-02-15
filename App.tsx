
import React, { useState, useEffect } from 'react';
import { LabCategory, Experiment, ExperimentDataPoint } from './types';
import { EXPERIMENTS } from './constants';
import LabNavbar from './components/LabNavbar';
import ApparatusSidebar from './components/ApparatusSidebar';
import SimulationStage from './components/SimulationStage';
import DataPanel from './components/DataPanel';
import GraphBoard from './components/GraphBoard';
import TheoryPanel from './components/TheoryPanel';
import AIAssistant from './components/AIAssistant';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sim' | 'table' | 'graph' | 'theory'>('sim');
  const [isSplitView, setIsSplitView] = useState(false);
  const [currentExp, setCurrentExp] = useState<Experiment>(EXPERIMENTS[0]);
  const [dataPoints, setDataPoints] = useState<ExperimentDataPoint[]>([]);
  const [gravity, setGravity] = useState(9.8);
  const [airResistance, setAirResistance] = useState(0.05);
  const [cgValue, setCgValue] = useState<number | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApparatusOpen, setIsApparatusOpen] = useState(false); 
  const [isControlOpen, setIsControlOpen] = useState(true);

  const handleAddDataPoint = (point: Omit<ExperimentDataPoint, 'id'>) => {
    setDataPoints(prev => [...prev, { ...point, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleClearData = () => {
    if (window.confirm("Clear all experimental data?")) {
      setDataPoints([]);
      setCgValue(null);
    }
  };

  // Helper to determine if we should show the dual pane
  const showDualPane = isSplitView && (activeTab === 'sim' || activeTab === 'table');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-white">
      <LabNavbar 
        currentExp={currentExp} 
        onSelectExp={(exp) => {
          setCurrentExp(exp);
          setDataPoints([]);
          setCgValue(null);
        }} 
        onToggleAI={() => setShowAI(!showAI)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleApparatus={() => setIsApparatusOpen(!isApparatusOpen)}
        isApparatusOpen={isApparatusOpen}
        onToggleControl={() => setIsControlOpen(!isControlOpen)}
        isControlOpen={isControlOpen}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(!isSplitView)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Apparatus */}
        <div className={`transition-all duration-300 ease-in-out flex flex-col ${isApparatusOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <ApparatusSidebar category={currentExp.category} />
        </div>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col relative bg-slate-100 text-slate-900 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-white shadow-sm z-10 justify-between items-center pr-4">
            <div className="flex">
              <button 
                onClick={() => setActiveTab('sim')}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sim' && !isSplitView ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : activeTab === 'sim' && isSplitView ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Virtual Bench
              </button>
              <button 
                onClick={() => setActiveTab('table')}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'table' && !isSplitView ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : activeTab === 'table' && isSplitView ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Table of Results
              </button>
              <button 
                onClick={() => { setActiveTab('graph'); setIsSplitView(false); }}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'graph' ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Graph Analysis
              </button>
              <button 
                onClick={() => { setActiveTab('theory'); setIsSplitView(false); }}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'theory' ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                WAEC Instructions
              </button>
            </div>
            
            <button 
              onClick={() => {
                const next = !isSplitView;
                setIsSplitView(next);
                if (next && (activeTab === 'graph' || activeTab === 'theory')) {
                  setActiveTab('sim');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isSplitView ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <span>{isSplitView ? '🔄 Standard View' : '🔲 Dual Pane Mode'}</span>
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {showDualPane ? (
              <div className="flex h-full divide-x-4 divide-slate-200">
                <div className="flex-1 min-w-0 border-r border-slate-300 relative shadow-inner bg-slate-100">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/10 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">Simulation</div>
                  <SimulationStage 
                    experiment={currentExp} 
                    gravity={gravity} 
                    airResistance={airResistance}
                    onCaptureData={handleAddDataPoint} 
                    cgValue={cgValue}
                    setCGValue={setCgValue}
                    isControlOpen={isControlOpen}
                  />
                </div>
                <div className="flex-1 min-w-0 bg-white">
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-slate-900/10 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">Records</div>
                  <DataPanel 
                    experiment={currentExp} 
                    dataPoints={dataPoints} 
                    setDataPoints={setDataPoints}
                    onClear={handleClearData}
                    onRemove={(id) => setDataPoints(prev => prev.filter(p => p.id !== id))}
                    cgValue={cgValue}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'sim' && (
                  <SimulationStage 
                    experiment={currentExp} 
                    gravity={gravity} 
                    airResistance={airResistance}
                    onCaptureData={handleAddDataPoint} 
                    cgValue={cgValue}
                    setCGValue={setCgValue}
                    isControlOpen={isControlOpen}
                  />
                )}
                {activeTab === 'table' && (
                  <DataPanel 
                    experiment={currentExp} 
                    dataPoints={dataPoints} 
                    setDataPoints={setDataPoints}
                    onClear={handleClearData}
                    onRemove={(id) => setDataPoints(prev => prev.filter(p => p.id !== id))}
                    cgValue={cgValue}
                  />
                )}
                {activeTab === 'graph' && (
                  <GraphBoard experiment={currentExp} dataPoints={dataPoints} />
                )}
                {activeTab === 'theory' && (
                  <TheoryPanel experiment={currentExp} />
                )}
              </div>
            )}
          </div>
        </main>

        {showAI && (
          <div className="absolute top-20 right-4 w-96 z-50 animate-in slide-in-from-right-10 duration-300">
            <AIAssistant 
              experiment={currentExp} 
              data={dataPoints} 
              onClose={() => setShowAI(false)} 
            />
          </div>
        )}
      </div>

      <footer className="h-10 bg-slate-800 border-t border-slate-700 flex items-center px-6 justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> High Fidelity Physics Engine</span>
          <span>Gravity: {gravity.toFixed(2)} m/s²</span>
          <span>Air Resistance: {(airResistance * 100).toFixed(0)}%</span>
          {isSplitView && <span className="text-indigo-400">● Split Mode Active</span>}
        </div>
        <div>WASSCE Virtual Lab © 2025</div>
      </footer>

      {isSettingsOpen && (
        <SettingsModal 
          gravity={gravity} 
          setGravity={setGravity} 
          airResistance={airResistance} 
          setAirResistance={setAirResistance} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
