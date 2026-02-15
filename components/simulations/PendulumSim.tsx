
import React, { useState, useEffect, useRef } from 'react';
import { Experiment, ExperimentDataPoint } from '../../types';

interface PendulumSimProps {
  experiment: Experiment;
  gravity: number;
  onCaptureData: (point: Omit<ExperimentDataPoint, 'id'>) => void;
}

const PendulumSim: React.FC<PendulumSimProps> = ({ experiment, gravity, onCaptureData }) => {
  const [length, setLength] = useState(150);
  const [angle, setAngle] = useState(Math.PI / 6);
  const [velocity, setVelocity] = useState(0);
  const [isOscillating, setIsOscillating] = useState(false);
  const [time, setTime] = useState(0);
  const [oscillationsCount, setOscillationsCount] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const prevAngleRef = useRef<number>(0);

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

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 p-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOscillating(!isOscillating)} className={`px-4 py-1.5 rounded-full font-bold text-sm ${isOscillating ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {isOscillating ? '⏸️ Stop' : '▶️ Release'}
          </button>
          <button onClick={resetExperiment} className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">🔄 Reset</button>
          <input type="range" min="50" max="350" value={length} onChange={(e) => { setLength(Number(e.target.value)); resetExperiment(); }} className="accent-blue-600" />
          <span className="text-xs font-bold text-slate-700">{(length/200).toFixed(2)} m</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-slate-900 text-yellow-400 font-mono px-3 py-1 rounded-md border-2 border-slate-700 shadow-inner flex flex-col items-center">
             <span className="text-[10px] text-slate-400 font-sans uppercase">Timer</span>
             <span className="text-lg">{time.toFixed(2)}s</span>
          </div>
          <button onClick={captureMeasurement} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-lg transition-transform active:scale-95">📥 Record Data</button>
        </div>
      </div>
      <div className="flex-1 bg-slate-200 relative overflow-hidden flex justify-center items-start pt-10">
        <svg width="600" height="500" className="drop-shadow-2xl">
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
