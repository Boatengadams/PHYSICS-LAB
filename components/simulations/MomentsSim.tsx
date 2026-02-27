
import React, { useState, useEffect, useRef } from 'react';
import { Experiment, ExperimentDataPoint } from '../../types';

interface MomentsSimProps {
  experiment: Experiment;
  gravity: number;
  airResistance: number;
  onCaptureData: (point: Omit<ExperimentDataPoint, 'id'>) => void;
  cgValue: number | null;
  setCGValue: (val: number) => void;
  isControlOpen: boolean;
  onCloseControl?: () => void;
  selectedDataPointId?: string | null;
  dataPoints?: ExperimentDataPoint[];
  onUpdateDataPoint?: (id: string, updates: Partial<ExperimentDataPoint>) => void;
  activeMeasurement?: { colKey: string, rowId?: string } | null;
  onMeasurementComplete?: (value: any) => void;
  onCancelMeasurement?: () => void;
}

const MomentsSim: React.FC<MomentsSimProps> = ({ 
  experiment, 
  gravity, 
  airResistance, 
  onCaptureData, 
  onUpdateDataPoint,
  cgValue, 
  setCGValue, 
  isControlOpen,
  onCloseControl,
  selectedDataPointId,
  dataPoints,
  activeMeasurement,
  onMeasurementComplete,
  onCancelMeasurement
}) => {
  const [ruleLength] = useState(100); 
  const [massAValue, setMassAValue] = useState(100.0);
  const [massBValue, setMassBValue] = useState(100.0);
  const [isMassAActive, setIsMassAActive] = useState(true);
  const [isMassBActive, setIsMassBActive] = useState(true);
  const [actualCG] = useState(50.42); 

  const [posB, setPosB] = useState(80.0); 
  const [posX, setPosX] = useState(15.0); 
  const [pivotY, setPivotY] = useState(50.0); 
  
  const [isMeasuringCG, setIsMeasuringCG] = useState(false);
  const [isDragging, setIsDragging] = useState<'pivot' | 'ruler' | 'massA' | 'massB' | null>(null);
  const [selectedItem, setSelectedItem] = useState<'pivot' | 'massA' | 'massB'>('pivot');
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const lastMouseX = useRef<number>(0);

  useEffect(() => {
    if (selectedDataPointId && dataPoints) {
      const point = dataPoints.find(p => p.id === selectedDataPointId);
      if (point) {
        if (point.posX !== undefined) setPosX(Number(point.posX));
        if (point.pivotY !== undefined) setPivotY(Number(point.pivotY));
        if (point.posB !== undefined) setPosB(Number(point.posB));
        if (point.massA !== undefined) {
          setMassAValue(Number(point.massA));
          setIsMassAActive(true);
        }
        if (point.massB !== undefined) {
          setMassBValue(Number(point.massB));
          setIsMassBActive(true);
        }
        // If it was a CG measurement, we might want to handle that too
        if (point.cg !== undefined && point.cg !== 0) {
          setCGValue(Number(point.cg));
        }
      }
    }
  }, [selectedDataPointId, dataPoints]);

  useEffect(() => {
    if (selectedDataPointId && onUpdateDataPoint) {
      onUpdateDataPoint(selectedDataPointId, {
        posX: Number(posX.toFixed(2)),
        pivotY: Number(pivotY.toFixed(2)),
        posB: Number(posB.toFixed(2)),
        massA: massAValue,
        massB: massBValue,
        x: Number((1 / posX).toFixed(4)),
        y: Number((pivotY / posX).toFixed(4)),
      });
    }
  }, [posX, pivotY, posB, massAValue, massBValue, selectedDataPointId]);

  // Precision Controls
  const [stepSize, setStepSize] = useState(0.5); 
  const [anchor, setAnchor] = useState<'ruler' | 'pivot'>('ruler'); 

  const [measurePoints, setMeasurePoints] = useState<{ x: number, y: number }[]>([]);

  const [tiltAngle, setTiltAngle] = useState(0);
  const angularVelocityRef = useRef(0);
  const currentTiltRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const RULE_MASS_PER_CM = 1.25; 
  const MAX_ROTATION = 18;
  const totalRuleMass = ruleLength * RULE_MASS_PER_CM;
  
  // Physics Factors based on User Settings
  const gravityScale = gravity / 9.81;

  const snapToStep = (val: number) => {
    const factor = 1 / stepSize;
    return Math.round(val * factor) / factor;
  };

  // Moment Calculation (Net Torque)
  const moments = {
    a: (isMassAActive && !isMeasuringCG) ? (massAValue * gravityScale) * (posX - pivotY) : 0,
    rule: (totalRuleMass * gravityScale) * (actualCG - pivotY),
    b: (isMassBActive && !isMeasuringCG) ? (massBValue * gravityScale) * (posB - pivotY) : 0
  };
  const netMoment = moments.a + moments.rule + moments.b;

  // Key requirement: Momentum Offset between ±9.7 to ±9.9 is "Perfect Balance"
  const absMoment = Math.abs(netMoment);
  const isLikenessRange = (absMoment >= 9.7 && absMoment <= 9.95);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveItem(selectedItem, -1);
      if (e.key === 'ArrowRight') moveItem(selectedItem, 1);
      if (e.key === '1') setSelectedItem('pivot');
      if (e.key === '2' && !isMeasuringCG && isMassAActive) setSelectedItem('massA');
      if (e.key === '3' && !isMeasuringCG && isMassBActive) setSelectedItem('massB');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, stepSize, isMeasuringCG, isMassAActive, isMassBActive]);

  useEffect(() => {
    const updatePhysics = () => {
      const effectiveMoment = isLikenessRange ? 0 : netMoment;
      let torque = effectiveMoment * 0.02 * gravityScale; 

      const distToCG = pivotY - actualCG;
      const IRule = (1/12) * totalRuleMass * Math.pow(ruleLength, 2) + totalRuleMass * Math.pow(distToCG, 2);
      const IMassA = (isMassAActive && !isMeasuringCG) ? massAValue * Math.pow(posX - pivotY, 2) : 0;
      const IMassB = (isMassBActive && !isMeasuringCG) ? massBValue * Math.pow(posB - pivotY, 2) : 0;
      const totalInertia = Math.max(IRule + IMassA + IMassB, 1800);
      
      const alpha = torque / (totalInertia * 0.001);
      const baseDamping = 0.99;
      const airDamping = airResistance * 0.35; 
      let damping = Math.max(0.6, baseDamping - airDamping);

      if (isLikenessRange) {
        if (Math.abs(currentTiltRef.current) < 10) {
          currentTiltRef.current *= 0.7; 
          angularVelocityRef.current *= 0.5; 
          if (Math.abs(currentTiltRef.current) < 0.01) {
            currentTiltRef.current = 0;
            angularVelocityRef.current = 0;
          }
        } else {
          damping = 0.8; 
        }
      }
      
      angularVelocityRef.current = (angularVelocityRef.current + alpha) * damping;
      currentTiltRef.current += angularVelocityRef.current;

      if (Math.abs(currentTiltRef.current) > MAX_ROTATION) {
        currentTiltRef.current = Math.sign(currentTiltRef.current) * MAX_ROTATION;
        angularVelocityRef.current *= -0.15;
      }

      setTiltAngle(currentTiltRef.current);
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [netMoment, ruleLength, totalRuleMass, pivotY, posX, posB, isMassAActive, isMassBActive, massAValue, massBValue, airResistance, isMeasuringCG, actualCG, gravityScale, isLikenessRange]);

  const handleCapture = () => {
    // Determine the descriptive label for the table based on balance
    const isActuallyBalanced = Math.abs(tiltAngle) < 0.05 && isLikenessRange;
    const statusLabel = isActuallyBalanced 
      ? `Balanced` 
      : `Unbalanced (Δ${netMoment.toFixed(1)} @ ${tiltAngle.toFixed(0)}°)`;

    const calibrationNote = cgValue === null ? " (Pre-G)" : "";

    onCaptureData({
      posX: Number(posX.toFixed(2)),
      pivotY: Number(pivotY.toFixed(2)),
      x: Number((1 / posX).toFixed(4)),
      y: Number((pivotY / posX).toFixed(4)),
      massA: massAValue,
      massB: massBValue,
      cg: cgValue || 0,
      label: `${statusLabel}${calibrationNote}`
    });

    // Trigger visual feedback
    setShowCaptureFlash(true);
    setTimeout(() => setShowCaptureFlash(false), 300);
  };

  const startCG = () => {
    if (confirm("Reset for Center of Gravity determination? Masses will be cleared.")) {
      setIsMeasuringCG(true);
      setIsMassAActive(false);
      setIsMassBActive(false);
      setSelectedItem('pivot');
    }
  };

  const finishCG = () => {
    if (Math.abs(tiltAngle) < 0.05) {
      setCGValue(Number(pivotY.toFixed(2)));
      setIsMeasuringCG(false);
      setIsMassAActive(true);
      setIsMassBActive(true);
    } else {
      alert("The ruler must be stabilized horizontal to determine rule mass (G).");
    }
  };

  const handleDragStart = (type: 'pivot' | 'ruler' | 'massA' | 'massB', e: React.MouseEvent) => {
    if (activeMeasurement) {
      // If we are in measurement mode, we might want to capture the value of the item clicked
      if (activeMeasurement.colKey === 'massA' && type === 'massA') {
        onMeasurementComplete?.(massAValue);
        return;
      }
      if (activeMeasurement.colKey === 'massB' && type === 'massB') {
        onMeasurementComplete?.(massBValue);
        return;
      }
      if (activeMeasurement.colKey === 'posX' && type === 'massA') {
        onMeasurementComplete?.(Number(posX.toFixed(2)));
        return;
      }
      if (activeMeasurement.colKey === 'pivotY' && type === 'pivot') {
        onMeasurementComplete?.(Number(pivotY.toFixed(2)));
        return;
      }
    }
    setIsDragging(type);
    if (type !== 'ruler') setSelectedItem(type as any);
    lastMouseX.current = e.clientX;
  };

  const handleSimClick = (e: React.MouseEvent) => {
    if (!activeMeasurement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentage or cm-like
    
    // If measuring distance between two points
    if (activeMeasurement.colKey.toLowerCase().includes('x') || activeMeasurement.colKey.toLowerCase().includes('distance')) {
      const newPoints = [...measurePoints, { x, y: e.clientY }];
      if (newPoints.length === 2) {
        const dist = Math.abs(newPoints[1].x - newPoints[0].x);
        onMeasurementComplete?.(Number(dist.toFixed(2)));
        setMeasurePoints([]);
      } else {
        setMeasurePoints(newPoints);
      }
    }
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width * 0.9;
    const deltaPixels = e.clientX - lastMouseX.current;
    const deltaCM = (deltaPixels / w) * ruleLength;
    
    if (Math.abs(deltaCM) < stepSize * 0.05) return;

    if (isDragging === 'pivot') {
      const nextY = Math.max(0, Math.min(100, pivotY + deltaCM));
      if (nextY !== pivotY) {
        setPivotY(nextY);
      }
      lastMouseX.current = e.clientX;
    } else if (isDragging === 'ruler') {
      const nextY = Math.max(0, Math.min(100, pivotY - deltaCM));
      if (nextY !== pivotY) {
        setPivotY(nextY);
      }
      lastMouseX.current = e.clientX;
    } else if (isDragging === 'massA') {
      const nextX = Math.max(0, Math.min(100, posX + deltaCM));
      if (nextX !== posX) {
        setPosX(nextX);
      }
      lastMouseX.current = e.clientX;
    } else if (isDragging === 'massB') {
      const nextB = Math.max(0, Math.min(100, posB + deltaCM));
      if (nextB !== posB) {
        setPosB(nextB);
      }
      lastMouseX.current = e.clientX;
    }
  };

  const moveItem = (target: 'pivot' | 'massA' | 'massB', dir: -1 | 1) => {
    const delta = stepSize * dir;
    if (target === 'pivot') setPivotY(prev => Math.max(0.05, Math.min(99.95, snapToStep(prev + delta))));
    if (target === 'massA') setPosX(prev => Math.max(0.05, Math.min(99.95, snapToStep(prev + delta))));
    if (target === 'massB') setPosB(prev => Math.max(0.05, Math.min(99.95, snapToStep(prev + delta))));
  };

  const ArrowPad = ({ onMove, active }: { onMove: (dir: -1 | 1) => void, active?: boolean }) => (
    <div className={`flex gap-1 items-center rounded-lg p-1 shadow-sm transition-all ${active ? 'bg-blue-600 border-2 border-blue-400' : 'bg-white border border-slate-200'}`}>
      <button onClick={() => onMove(-1)} className={`p-1.5 rounded text-[10px] font-bold transition-colors active:scale-90 ${active ? 'text-white hover:bg-blue-500' : 'text-slate-700 hover:bg-slate-100'}`}>◀</button>
      <div className={`w-[1px] h-3 mx-0.5 ${active ? 'bg-blue-400' : 'bg-slate-100'}`}></div>
      <button onClick={() => onMove(1)} className={`p-1.5 rounded text-[10px] font-bold transition-colors active:scale-90 ${active ? 'text-white hover:bg-blue-500' : 'text-slate-700 hover:bg-slate-100'}`}>▶</button>
    </div>
  );

  const ToggleSwitch = ({ active, onToggle, label, colorClass }: { active: boolean, onToggle: () => void, label: string, colorClass: string }) => (
    <div className="flex items-center justify-between group">
      <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-700 transition-colors">{label}</span>
      <button 
        onClick={onToggle}
        disabled={isMeasuringCG}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${active ? colorClass : 'bg-slate-200'} ${isMeasuringCG ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`${active ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
      </button>
    </div>
  );

  const HangingMass = ({ pos, mass, label, type, color, onMouseDown }: { pos: number, mass: number, label: string, type: 'massA' | 'massB', color: string, onMouseDown: (e: React.MouseEvent) => void }) => (
    <div 
      className={`absolute top-0 group/mass z-30 flex flex-col items-center transition-all ${selectedItem === type ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]' : ''}`} 
      style={{ left: `${(pos / ruleLength) * 100}%` }} 
      onMouseDown={onMouseDown}
    >
      <div className={`w-4 h-6 -mt-3 border-2 ${selectedItem === type ? 'border-blue-500 scale-125' : 'border-slate-800'} rounded-full bg-transparent shadow-sm transition-transform`}></div>
      <div className={`w-0.5 h-16 ${selectedItem === type ? 'bg-blue-500 w-1' : 'bg-slate-800'} shadow-sm -mt-2 transition-all`}></div>
      <div className={`relative w-16 h-14 -ml-0 bg-gradient-to-br ${color} rounded-sm border-2 border-black/30 flex flex-col items-center justify-center text-[10px] text-white font-black shadow-[0_6px_15px_rgba(0,0,0,0.4)] cursor-ew-resize hover:brightness-110 transition-all transform hover:scale-105 active:scale-95 ${selectedItem === type ? 'border-white brightness-125 scale-110' : ''}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-black/20"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/10"></div>
        <span className="drop-shadow-sm z-10 text-[9px]">{mass.toFixed(0)}g</span>
        <span className="text-[7px] uppercase opacity-70 tracking-tighter z-10">{pos.toFixed(2)} cm</span>
      </div>
      <div className={`bg-slate-800 text-white text-[7px] font-black px-1 mt-1 rounded uppercase tracking-tighter transition-opacity ${selectedItem === type ? 'opacity-100' : 'opacity-0 group-hover/mass:opacity-100'}`}>
        {label}
      </div>
    </div>
  );

  return (
    <div className="h-full flex overflow-hidden font-sans">
      <div 
        className={`flex-1 relative overflow-hidden cursor-crosshair select-none focus:outline-none ${activeMeasurement ? 'ring-4 ring-blue-400 ring-inset' : ''}`}
        tabIndex={0}
        onMouseMove={handleDrag}
        onMouseUp={() => setIsDragging(null)}
        onMouseLeave={() => setIsDragging(null)}
        onClick={handleSimClick}
      >
        {/* Pro Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://storage.googleapis.com/static.run.app/v1/image/ais-dev-ddr65jjxdzgwwov45yicxn-376437820125/94/1.jpg" 
            alt="Lab Background" 
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#f8f9fa]/20 backdrop-blur-[0.5px]"></div>
        </div>

        {/* Blueprint Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-200/20 to-transparent"></div>
        
        {activeMeasurement && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-2xl animate-bounce flex flex-col items-center">
            <span>📏 Measurement Mode: {activeMeasurement.colKey}</span>
            <span className="text-[9px] opacity-70 mt-1">
              {measurePoints.length === 0 ? 'Click first point' : 'Click second point to finish'}
            </span>
          </div>
        )}
        {activeMeasurement && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCancelMeasurement?.(); }}
            className="absolute top-4 right-4 z-50 bg-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md border border-slate-200 hover:bg-slate-50"
          >
            Exit Tool
          </button>
        )}
        
        {measurePoints.map((p, i) => (
          <div key={i} className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-50" style={{ left: `${p.x}%`, top: `${p.y - 100}px` }}></div>
        ))}
        
        {/* Capture Visual Feedback */}
        <div className={`absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-300 ${showCaptureFlash ? 'opacity-30' : 'opacity-0'}`}></div>

        {/* Bench / Stand */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center w-[80%]">
          <div className="w-full h-4 bg-slate-400 rounded-sm shadow-xl border-b-2 border-slate-500"></div>
          <div 
            className="absolute bottom-4 w-20 h-80 flex flex-col items-center z-10 transition-all duration-300 ease-out"
            style={{ 
              left: `${anchor === 'pivot' ? 50 : (pivotY / ruleLength) * 90 + 5}%`,
              transform: 'translateX(-50%)'
            }}
          >
             <div className="w-1.5 h-full bg-slate-300 border-x border-slate-400 shadow-inner"></div>
             <div 
                onMouseDown={(e) => handleDragStart('pivot', e)}
                className={`relative w-16 h-12 -mt-4 flex justify-center cursor-ew-resize group`}
             >
                <div className={`absolute bottom-0 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[36px] transition-all ${isMeasuringCG ? 'border-b-emerald-500' : 'border-b-slate-700'} shadow-2xl group-hover:border-b-blue-600 ${selectedItem === 'pivot' ? 'border-b-blue-500 scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}`}></div>
             </div>
          </div>
        </div>

        {/* Meter Rule */}
        <div 
          onMouseDown={(e) => { if (anchor === 'pivot') handleDragStart('ruler', e); }}
          className={`absolute top-[40%] left-0 right-0 flex items-center px-[5%] z-20 transition-all duration-300 ease-out ${anchor === 'pivot' ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ 
            transform: `translateY(-50%) rotate(${tiltAngle}deg) ${anchor === 'pivot' ? `translateX(${50 - (pivotY/ruleLength)*100}%)` : ''}`, 
            transformOrigin: `${(pivotY / ruleLength) * 100}% 80%`,
          }}
        >
          <div className="w-full h-12 bg-[#e3b04b] rounded-sm relative flex items-center shadow-[0_12px_35px_rgba(0,0,0,0.35)] border-y border-amber-900 transition-shadow">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(0,0,0,0.1) 41px, transparent 42px)' }}></div>
            <div className="absolute inset-0 flex items-end px-0 pointer-events-none">
              {Array.from({ length: 101 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div 
                    className="absolute bottom-0 bg-black/80" 
                    style={{ 
                      left: `${i}%`, 
                      height: i % 10 === 0 ? '85%' : i % 5 === 0 ? '60%' : '40%', 
                      width: i % 10 === 0 ? '2px' : '1px' 
                    }} 
                  />
                  {i % 10 === 0 && (
                    <span 
                      className="absolute top-1 text-[8px] font-black text-slate-900 select-none -translate-x-1/2"
                      style={{ left: `${i}%` }}
                    >
                      {i}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
            {!isMeasuringCG && isMassAActive && (
              <HangingMass 
                pos={posX} 
                mass={massAValue}
                label="Mass A" 
                type="massA"
                color="from-indigo-600 to-indigo-800" 
                onMouseDown={(e) => { e.stopPropagation(); handleDragStart('massA', e); }} 
              />
            )}
            {!isMeasuringCG && isMassBActive && (
              <HangingMass 
                pos={posB} 
                mass={massBValue}
                label="Mass B" 
                type="massB"
                color="from-rose-600 to-rose-800" 
                onMouseDown={(e) => { e.stopPropagation(); handleDragStart('massB', e); }} 
              />
            )}
          </div>
        </div>

        {/* Global Action Button */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 md:gap-4 z-30 w-full max-w-sm justify-center px-4">
           {isMeasuringCG ? (
             <button onClick={finishCG} className="flex-1 py-3 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs md:text-sm uppercase shadow-2xl transition-all border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">Record G @ {pivotY.toFixed(2)} cm</button>
           ) : (
             <button 
                onClick={handleCapture} 
                className={`flex-1 py-3 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase shadow-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 bg-blue-600 text-white border-blue-800 hover:bg-blue-500 hover:scale-[1.02] ${isLikenessRange ? 'ring-4 ring-emerald-400/30' : ''}`}
             >
                <div className="flex flex-col items-center">
                   <span className="flex items-center gap-2">📥 Snapshot</span>
                   <span className="text-[7px] md:text-[8px] opacity-60 font-bold lowercase tracking-widest leading-none mt-1">{isLikenessRange ? 'Balanced' : 'Unbalanced'}</span>
                </div>
             </button>
           )}
        </div>
      </div>

      {/* Lab Controls Sidebar */}
      {isControlOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onCloseControl}
        />
      )}
      <div className={`transition-all duration-300 ease-in-out border-l border-slate-200 bg-white flex flex-col shadow-2xl z-40 fixed lg:relative right-0 top-0 h-full lg:h-auto ${isControlOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 overflow-hidden'}`}>
         <div className="p-4 md:p-6 bg-slate-900 text-white flex justify-between items-center">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2"><span>🎛️</span> Lab Bench Controls</h3>
            <button onClick={onCloseControl} className="lg:hidden text-white p-1">✕</button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b pb-2">Measurement Precision</h4>
               <div className="grid grid-cols-3 gap-1">
                  {[0.05, 0.1, 0.5, 1.0, 10.0].map(s => (
                    <button key={s} onClick={() => setStepSize(s)} className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${stepSize === s ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500'}`}>{s} cm</button>
                  ))}
               </div>
            </div>
            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Experimental Anchor</h4>
               <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button onClick={() => setAnchor('ruler')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${anchor === 'ruler' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Fix Rule</button>
                 <button onClick={() => setAnchor('pivot')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${anchor === 'pivot' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Fix Bench</button>
               </div>
            </div>
            <div className="space-y-4 pt-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b pb-2 text-blue-800">Attachment Shelf</h4>
               <div className="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-inner">
                  <ToggleSwitch label="Attach Mass A" active={isMassAActive} onToggle={() => setIsMassAActive(!isMassAActive)} colorClass="bg-indigo-600" />
                  <ToggleSwitch label="Attach Mass B" active={isMassBActive} onToggle={() => setIsMassBActive(!isMassBActive)} colorClass="bg-rose-600" />
               </div>
            </div>
            <div className="space-y-6 pt-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b pb-2">Load Calibration</h4>
               <div className={`space-y-3 ${!isMassAActive ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-indigo-700">Mass A Value</label>
                    <div className="bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-mono font-black text-indigo-600 border border-indigo-100">{massAValue} g</div>
                  </div>
                  <input type="range" min="5" max="500" step="5" value={massAValue} onChange={(e) => setMassAValue(Number(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
               </div>
               <div className={`space-y-3 ${!isMassBActive ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-rose-700">Mass B Value</label>
                    <div className="bg-rose-50 px-2 py-0.5 rounded text-[10px] font-mono font-black text-rose-600 border border-rose-100">{massBValue} g</div>
                  </div>
                  <input type="range" min="5" max="500" step="5" value={massBValue} onChange={(e) => setMassBValue(Number(e.target.value))} className="w-full accent-rose-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
               </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fine Position Adjustment</h4>
               <div className={`bg-blue-50/50 p-4 rounded-2xl border transition-all space-y-3 ${selectedItem === 'pivot' ? 'border-blue-400 bg-blue-100/50 ring-2 ring-blue-100 shadow-md' : 'border-blue-100'}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-700">Knife Edge (Y)</label>
                    <ArrowPad onMove={(d) => moveItem('pivot', d)} active={selectedItem === 'pivot'} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-black text-blue-700">{pivotY.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">cm</span>
                  </div>
                  <input type="range" min="0.05" max="99.95" step={stepSize} value={pivotY} onFocus={() => setSelectedItem('pivot')} onChange={(e) => setPivotY(snapToStep(Number(e.target.value)))} className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
               </div>
            </div>
            <button onClick={startCG} className="w-full py-5 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl text-[10px] font-black uppercase text-indigo-700 hover:bg-indigo-100 transition-all flex flex-col items-center gap-1 shadow-sm mt-4 hover:border-indigo-400">
               <span>🔍 Lab Simulation Reset</span>
               <span className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Determine Meter Rule Mass (G)</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default MomentsSim;
