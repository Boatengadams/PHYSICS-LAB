
import React from 'react';
import { LabCategory } from '../types';
import { APPARATUS_LIST } from '../constants';

interface ApparatusSidebarProps {
  category: LabCategory;
  onClose?: () => void;
}

const ApparatusSidebar: React.FC<ApparatusSidebarProps> = ({ category, onClose }) => {
  const filtered = APPARATUS_LIST.filter(a => a.category === category);

  return (
    <aside className="w-full h-full bg-slate-800/40 backdrop-blur-md border-r border-slate-700/30 flex flex-col shadow-xl z-20">
      <div className="p-5 border-b border-slate-700/30 bg-slate-800/30 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm uppercase tracking-widest">
            <span className="text-lg">🛠️</span> Apparatus Shelf
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter italic">Standard Lab Inventory</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">✕</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map(item => (
          <div 
            key={item.id}
            draggable
            className="bg-slate-700/30 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl group-hover:scale-110 transition-transform drop-shadow-md">{item.icon}</span>
              <div>
                <p className="text-xs font-black text-slate-200 uppercase tracking-tight leading-none mb-1">{item.name}</p>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{item.category}</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 opacity-30">
            <span className="text-4xl block mb-2">📦</span>
            <p className="text-[10px] uppercase font-bold">Shelf Empty</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/40 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase">Drag items to workbench</p>
      </div>
    </aside>
  );
};

export default ApparatusSidebar;
