
import React from 'react';
import { Experiment, ExperimentDataPoint } from '../types';
import PendulumSim from './simulations/PendulumSim';
import MomentsSim from './simulations/MomentsSim';

interface SimulationStageProps {
  experiment: Experiment;
  gravity: number;
  airResistance: number;
  onCaptureData: (point: Omit<ExperimentDataPoint, 'id'>) => void;
  cgValue: number | null;
  setCGValue: (val: number) => void;
  isControlOpen?: boolean;
  onCloseControl?: () => void;
}

const SimulationStage: React.FC<SimulationStageProps> = ({ 
  experiment, 
  gravity, 
  airResistance, 
  onCaptureData,
  cgValue,
  setCGValue,
  isControlOpen,
  onCloseControl
}) => {
  if (experiment.id === 'pendulum-01') {
    return <PendulumSim experiment={experiment} gravity={gravity} onCaptureData={onCaptureData} />;
  }

  if (experiment.id === 'moments-2025-alt-b') {
    return (
      <MomentsSim 
        experiment={experiment} 
        gravity={gravity} 
        airResistance={airResistance} 
        onCaptureData={onCaptureData} 
        cgValue={cgValue}
        setCGValue={setCGValue}
        isControlOpen={isControlOpen || false}
      />
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-100 p-10 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <span className="text-6xl mb-4 block">🔬</span>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Simulation Ready</h2>
        <p className="text-slate-500 max-w-md">
          The virtual environment for <strong>{experiment.title}</strong> is being calibrated. 
          Please select an active experiment from the top menu or wait for the update.
        </p>
      </div>
    </div>
  );
};

export default SimulationStage;
