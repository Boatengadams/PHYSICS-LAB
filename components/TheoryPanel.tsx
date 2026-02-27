
import React from 'react';
import { Experiment } from '../types';

interface TheoryPanelProps {
  experiment: Experiment;
}

const TheoryPanel: React.FC<TheoryPanelProps> = ({ experiment }) => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-10 pb-20 bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl my-4 md:my-8 border border-white/30 shadow-2xl">
      <section>
        <h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-2">{experiment.title}</h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-600 text-[10px] md:text-xs font-bold rounded-full uppercase">
          Category: {experiment.category}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-blue-600 mb-2 md:mb-3 flex items-center gap-2">
               <span>🎯</span> Aim
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">{experiment.aim}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-green-600 mb-2 md:mb-3 flex items-center gap-2">
               <span>📦</span> Apparatus
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {experiment.apparatus.map(item => (
                <li key={item} className="text-xs md:text-sm text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-800 text-slate-100 p-4 md:p-6 rounded-xl shadow-xl space-y-4">
           <h2 className="text-base md:text-lg font-bold text-yellow-400 flex items-center gap-2">
               <span>📜</span> Underlying Theory
            </h2>
            <p className="text-xs md:text-sm leading-relaxed text-slate-300 italic">{experiment.theory}</p>
            <div className="bg-slate-700 p-3 md:p-4 rounded-lg text-center font-mono text-lg md:text-xl border border-slate-600 text-white">
              {experiment.formula}
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 leading-relaxed pt-2">
              <strong>Variables:</strong><br/>
              - <strong>T:</strong> Period of oscillation (Time for one swing)<br/>
              - <strong>L:</strong> Effective length of the pendulum<br/>
              - <strong>g:</strong> Acceleration due to gravity
            </div>
        </div>
      </section>

      <section className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl border-2 border-slate-100 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
           <span>📝</span> Procedural Instructions
        </h2>
        <div className="space-y-3 md:space-y-4">
          {[
            "Mount the retort stand on a horizontal table.",
            "Suspend the pendulum bob from the thread attached to the stand.",
            "Adjust the thread such that the length L from the point of suspension to the center of the bob is 100cm (1.0m).",
            "Displace the bob through a small angle θ and release to allow for oscillations.",
            "Use the stopwatch to measure the time (t) for 20 complete oscillations.",
            "Calculate the period T = t/20 and determine T².",
            "Repeat the procedure for four other values of L = 80, 60, 40, and 20 cm.",
            "Tabulate your results including L, t, T, and T².",
            "Plot a graph of T² (s²) on the vertical axis against L (m) on the horizontal axis."
          ].map((step, i) => (
            <div key={i} className="flex gap-4">
               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                 {i + 1}
               </span>
               <p className="text-sm text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
         <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-2">
           <span>⚠️</span> Precautions for Accuracy
         </h3>
         <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
           <li>Avoid parallax error when reading the meter rule.</li>
           <li>Ensure the displacement angle θ is small (less than 15°) for SHM.</li>
           <li>Switch off fans to avoid effects of wind/air currents.</li>
           <li>Repeat readings and find average to minimize random errors.</li>
         </ul>
      </section>
    </div>
  );
};

export default TheoryPanel;
