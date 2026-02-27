
import React, { useState, useEffect, useRef } from 'react';
import { Experiment, ExperimentDataPoint } from '../../types';

interface PendulumSimProps {
  experiment: Experiment;
  gravity: number;
  onCaptureData: (point: Omit<ExperimentDataPoint, 'id'>) => void;
  selectedDataPointId?: string | null;
  dataPoints?: ExperimentDataPoint[];
  activeMeasurement?: { colKey: string, rowId?: string } | null;
  onMeasurementComplete?: (value: any) => void;
  onCancelMeasurement?: () => void;
}

const PendulumSim: React.FC<PendulumSimProps> = ({ 
  experiment, 
  gravity, 
  onCaptureData,
  onUpdateDataPoint,
  selectedDataPointId,
  dataPoints,
  activeMeasurement,
  onMeasurementComplete,
  onCancelMeasurement
}) => {
  const [length, setLength] = useState(150);
  const [angle, setAngle] = useState(Math.PI / 6);
  const [velocity, setVelocity] = useState(0);
  const [isOscillating, setIsOscillating] = useState(false);
  const [time, setTime] = useState(0);
  const [oscillationsCount, setOscillationsCount] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const prevAngleRef = useRef<number>(0);

  useEffect(() => {
    if (selectedDataPointId && dataPoints) {
      const point = dataPoints.find(p => p.id === selectedDataPointId);
      if (point && point.x) {
        const newLength = parseFloat(point.x) * 200;
        if (!isNaN(newLength)) {
          setLength(newLength);
          resetExperiment();
        }
      }
    }
  }, [selectedDataPointId, dataPoints]);

  useEffect(() => {
    if (selectedDataPointId && onUpdateDataPoint) {
      onUpdateDataPoint(selectedDataPointId, {
        x: Number((length / 200).toFixed(3))
      });
    }
  }, [length, selectedDataPointId]);

  useEffect(() => {
    let animationId: number;
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isOscillating) {
        const simLength = length / 200;
        const accel = -(gravity / simLength) * Math.sin(angle);
        const newVelocity = velocity + accel * deltaTime;
        const newAngle = angle + newVelocity * deltaTime;
        if (prevAngleRef.current <= 0 && newAngle > 0) setOscillationsCount(c => c + 1);
        setVelocity(newVelocity);
        setAngle(newAngle);
        setTime(t => t + deltaTime);
        prevAngleRef.current = newAngle;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isOscillating, length, angle, velocity, gravity]);

  const resetExperiment = () => {
    setIsOscillating(false);
    setAngle(Math.PI / 6);
    setVelocity(0);
    setTime(0);
    setOscillationsCount(0);
  };

  const captureMeasurement = () => {
    if (oscillationsCount > 0) {
      const period = time / oscillationsCount;
      onCaptureData({
        x: Number((length / 200).toFixed(3)),
        y: Number((period * period).toFixed(3)),
        label: `Trial ${oscillationsCount} osc`
      });
    }
  };

  const handleSimClick = (e: React.MouseEvent) => {
    if (!activeMeasurement) return;
    
    // If activeMeasurement is x (length), we can just use the current length
    // Or we could implement a more complex "click two points" logic
    // For now, let's assume clicking anywhere in the sim area while measuring 'x' 
    // captures the current length.
    
    if (activeMeasurement.colKey === 'x') {
      onMeasurementComplete?.(Number((length / 200).toFixed(3)));
    } else if (activeMeasurement.colKey === 'y') {
      if (oscillationsCount > 0) {
        const period = time / oscillationsCount;
        onMeasurementComplete?.(Number((period * period).toFixed(3)));
      } else {
        alert("Please let the pendulum oscillate to measure period squared (y).");
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-200 p-2 md:p-3 flex flex-wrap justify-between items-center z-10 gap-2">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsOscillating(!isOscillating)} className={`px-3 md:px-4 py-1.5 rounded-full font-bold text-[10px] md:text-sm ${isOscillating ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {isOscillating ? '⏸️ Stop' : '▶️ Release'}
          </button>
          <button onClick={resetExperiment} className="px-3 md:px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] md:text-sm">🔄 Reset</button>
          <div className="flex items-center gap-2">
            <input type="range" min="50" max="350" value={length} onChange={(e) => { setLength(Number(e.target.value)); resetExperiment(); }} className="accent-blue-600 w-24 md:w-32" />
            <span className="text-[10px] md:text-xs font-bold text-slate-700">{(length/200).toFixed(2)} m</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <div className="bg-slate-900 text-yellow-400 font-mono px-2 md:px-3 py-0.5 md:py-1 rounded-md border-2 border-slate-700 shadow-inner flex flex-col items-center">
             <span className="text-[8px] md:text-[10px] text-slate-400 font-sans uppercase leading-none">Timer</span>
             <span className="text-sm md:text-lg">{time.toFixed(2)}s</span>
          </div>
          <button onClick={captureMeasurement} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md font-bold text-[10px] md:text-sm shadow-lg transition-transform active:scale-95">📥 Record</button>
        </div>
      </div>
      <div 
        className={`flex-1 relative overflow-hidden flex justify-center items-start pt-10 ${activeMeasurement ? 'cursor-crosshair ring-4 ring-blue-400 ring-inset' : ''}`}
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
          <div className="absolute inset-0 bg-slate-200/10 backdrop-blur-[0.5px]"></div>
        </div>
        {activeMeasurement && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-xl animate-bounce text-center">
            Click on the Bench to Record {activeMeasurement.colKey}
          </div>
        )}
        {activeMeasurement && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCancelMeasurement?.(); }}
            className="absolute top-4 right-4 z-20 bg-white text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-md border border-slate-200"
          >
            Cancel
          </button>
        )}
        <svg viewBox="0 0 600 500" width="100%" height="100%" preserveAspectRatio="xMidYMin meet" className="drop-shadow-2xl max-h-full">
          <rect x="250" y="20" width="100" height="10" fill="#334155" />
          <g transform={`translate(300, 30) rotate(${(angle * 180) / Math.PI})`}>
            <line x1="0" y1="0" x2="0" y2={length} stroke="#1e293b" strokeWidth="2" strokeDasharray="2,2" />
            <circle cx="0" cy={length} r="15" fill="#1e293b" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default PendulumSim;
