
import React from 'react';
import { Experiment } from '../types';
import { EXPERIMENTS } from '../constants';

interface LabNavbarProps {
  currentExp: Experiment;
  onSelectExp: (exp: Experiment) => void;
  onToggleAI: () => void;
  onOpenSettings: () => void;
  onToggleApparatus: () => void;
  isApparatusOpen: boolean;
  onToggleControl: () => void;
  isControlOpen: boolean;
  isSplitView: boolean;
  onToggleSplitView: () => void;
}

const LabNavbar: React.FC<LabNavbarProps> = ({ 
  currentExp, 
  onSelectExp, 
  onToggleAI, 
  onOpenSettings, 
  onToggleApparatus,
  isApparatusOpen,
  onToggleControl,
  isControlOpen,
  isSplitView,
  onToggleSplitView
}) => {
  const supportsControl = currentExp.id === 'moments-2025-alt-b';

  return (
    <header className="h-16 bg-blue-900 border-b border-blue-800 flex items-center px-6 justify-between shadow-lg z-50">
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.location.reload()}>
          <span className="text-2xl">🧪</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white">WASSCE Physics Lab</h1>
          <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">Virtual Practicals</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <label className="text-[10px] text-blue-300 font-bold uppercase mb-1">Active Experiment</label>
          <select 
            className="bg-blue-800 text-white text-sm px-3 py-1.5 rounded border border-blue-700 focus:outline-none"
            value={currentExp.id}
            onChange={(e) => {
              const exp = EXPERIMENTS.find(ex => ex.id === e.target.value);
              if (exp) onSelectExp(exp);
            }}
          >
            {EXPERIMENTS.map(exp => (
              <option key={exp.id} value={exp.id}>{exp.title}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onToggleSplitView}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isSplitView ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            title="Toggle Split Screen View"
          >
            <span>🔲</span> {isSplitView ? 'Split On' : 'Split Off'}
          </button>
          
          {supportsControl && (
            <button 
              onClick={onToggleControl}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isControlOpen ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
              title="Toggle Simulation Controls"
            >
              <span>🎛️</span> Controls
            </button>
          )}
          <button 
            onClick={onToggleApparatus}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isApparatusOpen ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            title="Toggle Apparatus Shelf"
          >
            <span>🛠️</span> Apparatus
          </button>
          <button 
            onClick={onToggleAI}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md text-white"
          >
            <span>🤖</span> AI Proctor
          </button>
          <button 
            onClick={onOpenSettings}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-semibold transition-all text-slate-200"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};

export default LabNavbar;
