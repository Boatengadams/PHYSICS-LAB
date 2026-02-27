
import React, { useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supportsControl = currentExp.id === 'moments-2025-alt-b';

  return (
    <header className="h-16 bg-blue-900/40 backdrop-blur-md border-b border-blue-800/30 flex items-center px-4 md:px-6 justify-between shadow-lg z-50">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="bg-white p-1.5 md:p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.location.reload()}>
          <span className="text-xl md:text-2xl">🧪</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="font-bold text-sm md:text-lg leading-tight text-white">WASSCE Physics Lab</h1>
          <p className="text-[8px] md:text-xs text-blue-200 uppercase tracking-widest font-semibold">Virtual Practicals</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
        <div className="flex flex-col items-end max-w-[120px] sm:max-w-none">
          <label className="text-[8px] md:text-[10px] text-blue-300 font-bold uppercase mb-0.5 md:mb-1">Experiment</label>
          <select 
            className="bg-blue-800 text-white text-[10px] md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded border border-blue-700 focus:outline-none w-full"
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

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-2">
          <button 
            onClick={onToggleSplitView}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isSplitView ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            <span>🔲</span> {isSplitView ? 'Split On' : 'Split Off'}
          </button>
          
          {supportsControl && (
            <button 
              onClick={onToggleControl}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isControlOpen ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              <span>🎛️</span> Controls
            </button>
          )}
          <button 
            onClick={onToggleApparatus}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${isApparatusOpen ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
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

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-white bg-blue-800 rounded-lg"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-blue-950/95 backdrop-blur-xl border-b border-blue-800 lg:hidden flex flex-col p-4 gap-3 z-[60] shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { onToggleSplitView(); setIsMenuOpen(false); }}
              className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isSplitView ? 'bg-indigo-600 text-white border-indigo-800 shadow-lg' : 'bg-blue-900 text-blue-200 border-blue-950'}`}
            >
              <span className="text-xl">🔲</span>
              <span>{isSplitView ? 'Split On' : 'Split Off'}</span>
            </button>
            {supportsControl && (
              <button 
                onClick={() => { onToggleControl(); setIsMenuOpen(false); }}
                className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isControlOpen ? 'bg-orange-500 text-white border-orange-700 shadow-lg' : 'bg-blue-900 text-blue-200 border-blue-950'}`}
              >
                <span className="text-xl">🎛️</span>
                <span>Controls</span>
              </button>
            )}
            <button 
              onClick={() => { onToggleApparatus(); setIsMenuOpen(false); }}
              className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${isApparatusOpen ? 'bg-amber-500 text-white border-amber-700 shadow-lg' : 'bg-blue-900 text-blue-200 border-blue-950'}`}
            >
              <span className="text-xl">🛠️</span>
              <span>Apparatus</span>
            </button>
            <button 
              onClick={() => { onToggleAI(); setIsMenuOpen(false); }}
              className="p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 bg-indigo-600 text-white border-indigo-800 shadow-lg"
            >
              <span className="text-xl">🤖</span>
              <span>AI Proctor</span>
            </button>
            <button 
              onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
              className="p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 bg-slate-800 text-slate-200 border-slate-950 col-span-2"
            >
              <span className="text-xl">⚙️</span>
              <span>Lab Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LabNavbar;
