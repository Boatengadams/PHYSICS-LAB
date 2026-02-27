
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
  const [selectedDataPointId, setSelectedDataPointId] = useState<string | null>(null);
  const [activeMeasurement, setActiveMeasurement] = useState<{ colKey: string, rowId?: string } | null>(null);

  const handleAddDataPoint = (point: Omit<ExperimentDataPoint, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    setDataPoints(prev => [...prev, { ...point, id: newId }]);
    setSelectedDataPointId(newId);
  };

  const handleMeasurementComplete = (value: any) => {
    if (!activeMeasurement) return;
    const { colKey, rowId } = activeMeasurement;
    
    if (rowId) {
      setDataPoints(prev => prev.map(p => p.id === rowId ? { ...p, [colKey]: value } : p));
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      setDataPoints(prev => [...prev, { id: newId, [colKey]: value }]);
      setSelectedDataPointId(newId);
    }
    
    setActiveMeasurement(null);
    setActiveTab('table');
  };

  const handleUpdateDataPoint = (id: string, updates: Partial<ExperimentDataPoint>) => {
    setDataPoints(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleClearData = () => {
    if (window.confirm("Clear all experimental data?")) {
      setDataPoints([]);
      setCgValue(null);
      setSelectedDataPointId(null);
      setActiveMeasurement(null);
    }
  };

  const handleStartMeasurement = (colKey: string, rowId?: string) => {
    setActiveMeasurement({ colKey, rowId });
    setActiveTab('sim');
  };

  // Helper to determine if we should show the dual pane
  const showDualPane = isSplitView && (activeTab === 'sim' || activeTab === 'table');

  return (
    <div className="flex flex-col h-screen overflow-hidden relative text-white">
      {/* Global Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://storage.googleapis.com/static.run.app/v1/image/ais-dev-ddr65jjxdzgwwov45yicxn-376437820125/94/1.jpg" 
          alt="Lab Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-900/40"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
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
        <div className={`transition-all duration-300 ease-in-out flex flex-col absolute lg:relative h-full z-40 bg-slate-800 lg:bg-transparent ${isApparatusOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 overflow-hidden'}`}>
          <ApparatusSidebar category={currentExp.category} onClose={() => setIsApparatusOpen(false)} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isApparatusOpen && (
          <div 
            className="lg:hidden absolute inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setIsApparatusOpen(false)}
          />
        )}

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col relative bg-white/60 backdrop-blur-md text-slate-900 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-white/40 backdrop-blur-sm shadow-sm z-10 justify-between items-center pr-2 md:pr-4">
            <div className="flex overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('sim')}
                className={`px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'sim' && !isSplitView ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : activeTab === 'sim' && isSplitView ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Virtual Bench
              </button>
              <button 
                onClick={() => setActiveTab('table')}
                className={`px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'table' && !isSplitView ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : activeTab === 'table' && isSplitView ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Table of Results
              </button>
              <button 
                onClick={() => { setActiveTab('graph'); setIsSplitView(false); }}
                className={`px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'graph' ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Graph Analysis
              </button>
              <button 
                onClick={() => { setActiveTab('theory'); setIsSplitView(false); }}
                className={`px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'theory' ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
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
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isSplitView ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <span className="hidden xs:inline">{isSplitView ? '🔄 Standard' : '🔲 Dual Pane'}</span>
              <span className="xs:hidden">{isSplitView ? '🔄' : '🔲'}</span>
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {showDualPane ? (
              <div className="flex flex-col lg:flex-row h-full divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-slate-200">
                <div className="flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-slate-300 relative shadow-inner bg-slate-100 h-1/2 lg:h-full">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/10 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">Simulation</div>
                  <SimulationStage 
                    experiment={currentExp} 
                    gravity={gravity} 
                    airResistance={airResistance}
                    onCaptureData={handleAddDataPoint} 
                    onUpdateDataPoint={handleUpdateDataPoint}
                    cgValue={cgValue}
                    setCGValue={setCgValue}
                    isControlOpen={isControlOpen}
                    selectedDataPointId={selectedDataPointId}
                    dataPoints={dataPoints}
                    activeMeasurement={activeMeasurement}
                    onMeasurementComplete={handleMeasurementComplete}
                    onCancelMeasurement={() => setActiveMeasurement(null)}
                  />
                </div>
                <div className="flex-1 min-w-0 bg-white h-1/2 lg:h-full">
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-slate-900/10 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">Records</div>
                  <DataPanel 
                    experiment={currentExp} 
                    dataPoints={dataPoints} 
                    setDataPoints={setDataPoints}
                    onClear={handleClearData}
                    onRemove={(id) => {
                      setDataPoints(prev => prev.filter(p => p.id !== id));
                      if (selectedDataPointId === id) setSelectedDataPointId(null);
                    }}
                    cgValue={cgValue}
                    selectedId={selectedDataPointId}
                    onSelect={setSelectedDataPointId}
                    onStartMeasurement={handleStartMeasurement}
                    activeMeasurement={activeMeasurement}
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
                    onUpdateDataPoint={handleUpdateDataPoint}
                    cgValue={cgValue}
                    setCGValue={setCgValue}
                    isControlOpen={isControlOpen}
                    selectedDataPointId={selectedDataPointId}
                    dataPoints={dataPoints}
                    activeMeasurement={activeMeasurement}
                    onMeasurementComplete={handleMeasurementComplete}
                    onCancelMeasurement={() => setActiveMeasurement(null)}
                  />
                )}
                {activeTab === 'table' && (
                  <DataPanel 
                    experiment={currentExp} 
                    dataPoints={dataPoints} 
                    setDataPoints={setDataPoints}
                    onClear={handleClearData}
                    onRemove={(id) => {
                      setDataPoints(prev => prev.filter(p => p.id !== id));
                      if (selectedDataPointId === id) setSelectedDataPointId(null);
                    }}
                    cgValue={cgValue}
                    selectedId={selectedDataPointId}
                    onSelect={setSelectedDataPointId}
                    onStartMeasurement={handleStartMeasurement}
                    activeMeasurement={activeMeasurement}
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
          <div className="absolute top-20 right-4 w-[calc(100%-2rem)] sm:w-96 z-50 animate-in slide-in-from-right-10 duration-300">
            <AIAssistant 
              experiment={currentExp} 
              data={dataPoints} 
              onClose={() => setShowAI(false)} 
            />
          </div>
        )}
      </div>

      <footer className="h-10 bg-slate-800/40 backdrop-blur-sm border-t border-slate-700/30 flex items-center px-4 md:px-6 justify-between text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-widest">
        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> High Fidelity Physics Engine</span>
          <span className="hidden sm:inline">Gravity: {gravity.toFixed(2)} m/s²</span>
          <span className="hidden sm:inline">Air Resistance: {(airResistance * 100).toFixed(0)}%</span>
          {isSplitView && <span className="text-indigo-400">● Split Mode Active</span>}
        </div>
        <div className="flex-shrink-0 ml-2">WASSCE Virtual Lab © 2025</div>
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
    </div>
  );
};

export default App;
