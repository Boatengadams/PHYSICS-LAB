
import React from 'react';

interface SettingsModalProps {
  gravity: number;
  setGravity: (g: number) => void;
  airResistance: number;
  setAirResistance: (ar: number) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ gravity, setGravity, airResistance, setAirResistance, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Lab Settings</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Physics Parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl font-bold">×</button>
        </div>

        <div className="p-8 space-y-8">
          {/* Gravity Control */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <span>🌎</span> Gravity Level
              </label>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold text-sm">
                {gravity.toFixed(2)} m/s²
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              step="0.01" 
              value={gravity} 
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              <span>Moon (1.62)</span>
              <span>Earth (9.81)</span>
              <span>Jupiter (24.79)</span>
            </div>
          </div>

          {/* Air Resistance Control */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <span>🌬️</span> Air Resistance
              </label>
              <span className={`px-3 py-1 rounded-full font-mono font-bold text-sm ${airResistance === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {airResistance === 0 ? 'VACUUM' : `${(airResistance * 100).toFixed(0)}%`}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="0.5" 
              step="0.01" 
              value={airResistance} 
              onChange={(e) => setAirResistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              <span>Perfect Vacuum</span>
              <span>Dense Atmosphere</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
