
import React, { useState, useEffect } from 'react';
import { Experiment, ExperimentDataPoint } from '../types';

interface DataPanelProps {
  experiment: Experiment;
  dataPoints: ExperimentDataPoint[];
  onClear: () => void;
  onRemove: (id: string) => void;
  setDataPoints: React.Dispatch<React.SetStateAction<ExperimentDataPoint[]>>;
  cgValue?: number | null;
}

const COMMON_UNITS = [
  'cm', 'm', 'g', 'kg', 's', 'cm⁻¹', 'm⁻¹', 's⁻¹', 'g·cm', 'N', 'V', 'A', 'Ω', 'cm²', 'g/cm', 'g/cm²', 'Nm', 'Ncm'
];

const DataPanel: React.FC<DataPanelProps> = ({ experiment, dataPoints, onClear, onRemove, setDataPoints, cgValue }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [columnMeta, setColumnMeta] = useState<Record<string, { label: string, unit: string }>>({});

  useEffect(() => {
    if (experiment.variables.columns) {
      const keys = experiment.variables.columns.map(c => c.key);
      const meta: Record<string, { label: string, unit: string }> = {};
      experiment.variables.columns.forEach(c => {
        meta[c.key] = { label: c.label, unit: c.unit || '--' };
      });
      setColumns(keys);
      setColumnMeta(meta);
    } else {
      setColumns(['x', 'y', 'label']);
      setColumnMeta({
        x: { label: experiment.variables.x, unit: experiment.variables.xUnit || '--' },
        y: { label: experiment.variables.y, unit: experiment.variables.yUnit || '--' },
        label: { label: 'Observations', unit: '--' }
      });
    }
  }, [experiment]);

  const handleCellEdit = (id: string, key: string, value: string) => {
    setDataPoints(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const handleHeaderEdit = (key: string, value: string) => {
    setColumnMeta(prev => ({ ...prev, [key]: { ...prev[key], label: value } }));
  };

  const handleUnitChange = (key: string, unit: string) => {
    setColumnMeta(prev => ({ ...prev, [key]: { ...prev[key], unit: unit } }));
  };

  const addRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newPoint: ExperimentDataPoint = { id: newId };
    columns.forEach(col => { newPoint[col] = ''; });
    setDataPoints(prev => [...prev, newPoint]);
  };

  const addColumn = () => {
    const colName = prompt("Enter heading for the new column:");
    if (colName) {
      const internalKey = `custom_${Math.random().toString(36).substr(2, 5)}`;
      setColumns(prev => [...prev, internalKey]);
      setColumnMeta(prev => ({ ...prev, [internalKey]: { label: colName, unit: '--' } }));
      setDataPoints(prev => prev.map(p => ({ ...p, [internalKey]: '' })));
    }
  };

  const deleteColumn = (key: string) => {
    if (['x', 'y'].includes(key)) return alert("Core variables cannot be deleted.");
    if (window.confirm("Delete column?")) {
      setColumns(prev => prev.filter(c => c !== key));
      setColumnMeta(prev => { const { [key]: r, ...rest } = prev; return rest; });
      setDataPoints(prev => prev.map(p => { const { [key]: r, ...rest } = p; return rest as any; }));
    }
  };

  const formatValue = (val: any, colKey: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    const label = columnMeta[colKey]?.label?.toLowerCase() || '';
    const isDerived = label.includes('/') || label.includes('⁻¹') || label.includes('ratio');
    return num.toFixed(isDerived ? 3 : 2);
  };

  return (
    <div className="p-4 lg:p-8 max-w-full overflow-hidden flex flex-col h-full bg-[#f8fafc]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
             <span className="bg-blue-700 text-white p-1.5 rounded-lg text-sm">📋</span>
             Table of Results
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">WASSCE Standard</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addColumn} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-blue-100 hover:bg-blue-100 transition-all">Add Col</button>
          <button onClick={addRow} className="bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-md hover:bg-blue-800 transition-all">+ Row</button>
          <button onClick={onClear} className="bg-white text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-rose-100 hover:bg-rose-50 transition-all">Reset</button>
        </div>
      </div>

      {experiment.id === 'moments-2025-alt-b' && (
        <div className="mb-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-black">G</div>
              <div>
                 <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">Center of Gravity</h4>
                 <p className="text-[7px] text-slate-400 font-bold uppercase mt-1">Rule Calibration</p>
              </div>
           </div>
           <div className="text-right">
              <span className={`text-lg font-mono font-black ${cgValue ? 'text-emerald-700' : 'text-slate-300 italic'}`}>
                {cgValue ? `${cgValue.toFixed(2)} cm` : '--'}
              </span>
           </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto h-full overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-full">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 font-black text-slate-700 uppercase text-[9px] tracking-widest w-12 text-center border-r border-slate-200 bg-slate-100">S/N</th>
                {columns.map(col => (
                  <th key={col} className="px-3 py-3 border-r border-slate-200 group relative bg-slate-50 min-w-[120px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <input 
                          type="text" 
                          value={columnMeta[col]?.label || col} 
                          onChange={(e) => handleHeaderEdit(col, e.target.value)} 
                          className="bg-transparent text-slate-900 font-black uppercase text-[9px] tracking-tight outline-none border-b border-transparent hover:border-blue-400 focus:border-blue-600 w-full" 
                        />
                        {!['x', 'y', 'label'].includes(col) && !experiment.variables.columns?.some(c => c.key === col) && (
                          <button onClick={() => deleteColumn(col)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-0.5 hover:bg-rose-50 rounded">×</button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <input 
                            list={`units-${col}`}
                            value={columnMeta[col]?.unit || ''}
                            onChange={(e) => handleUnitChange(col, e.target.value)}
                            placeholder="Unit"
                            className="w-full text-[8px] font-black text-blue-600 bg-blue-50/50 rounded px-1.5 py-0.5 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, idx) => (
                <tr key={point.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-3 py-2 text-slate-400 font-mono text-[10px] text-center font-bold bg-slate-50/50 border-r border-slate-100">{idx + 1}</td>
                  {columns.map(col => (
                    <td key={col} className="px-0 py-0 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={point[col] ?? ''} 
                        onChange={(e) => handleCellEdit(point.id, col, e.target.value)} 
                        onBlur={(e) => { 
                          const f = formatValue(e.target.value, col); 
                          if (f !== e.target.value) handleCellEdit(point.id, col, f); 
                        }} 
                        className="w-full h-full px-3 py-3 text-xs font-mono font-bold text-slate-700 bg-transparent outline-none focus:bg-blue-50/30 text-center" 
                        placeholder="0.0" 
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => onRemove(point.id)} className="text-slate-200 hover:text-rose-500 transition-all font-bold">×</button>
                  </td>
                </tr>
              ))}
              {dataPoints.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-12 text-center text-slate-300 italic font-bold uppercase text-[9px] tracking-widest">
                    No data recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataPanel;
