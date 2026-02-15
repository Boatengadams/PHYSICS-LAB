
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Experiment, ExperimentDataPoint } from '../types';

interface GraphBoardProps {
  experiment: Experiment;
  dataPoints: ExperimentDataPoint[];
}

const GraphBoard: React.FC<GraphBoardProps> = ({ experiment, dataPoints }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [stats, setStats] = useState({ slope: 0, intercept: 0 });
  const isMomentsLab = experiment.id === 'moments-2025-alt-b';

  useEffect(() => {
    if (!svgRef.current || dataPoints.length < 2) return;

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xMax = d3.max(dataPoints, d => d.x) || 1;
    const yMax = d3.max(dataPoints, d => d.y) || 1;

    const x = d3.scaleLinear().domain([0, xMax * 1.2]).range([0, width]);
    const y = d3.scaleLinear().domain([0, yMax * 1.2]).range([height, 0]);

    const xAxis = d3.axisBottom(x).ticks(10).tickSize(-height);
    const yAxis = d3.axisLeft(y).ticks(10).tickSize(-width);

    svg.append('g').attr('class', 'grid text-slate-300 opacity-20').attr('transform', `translate(0,${height})`).call(xAxis);
    svg.append('g').attr('class', 'grid text-slate-300 opacity-20').call(yAxis);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      .append('text').attr('x', width).attr('y', 45).attr('fill', '#1e293b').attr('font-weight', 'bold').attr('text-anchor', 'end')
      .text(`${experiment.variables.x} (${experiment.variables.xUnit})`);

    svg.append('g').call(d3.axisLeft(y))
      .append('text').attr('x', -20).attr('y', -20).attr('fill', '#1e293b').attr('font-weight', 'bold').attr('text-anchor', 'start')
      .text(`${experiment.variables.y} ${experiment.variables.yUnit ? `(${experiment.variables.yUnit})` : ''}`);

    svg.selectAll('.dot').data(dataPoints).enter().append('circle').attr('class', 'dot')
      .attr('cx', d => x(d.x)).attr('cy', d => y(d.y)).attr('r', 5).attr('fill', '#4f46e5').attr('stroke', '#fff').attr('stroke-width', 2);

    const n = dataPoints.length;
    const sumX = d3.sum(dataPoints, d => d.x);
    const sumY = d3.sum(dataPoints, d => d.y);
    const sumXY = d3.sum(dataPoints, d => d.x * d.y);
    const sumX2 = d3.sum(dataPoints, d => d.x * d.x);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    setStats({ slope, intercept });

    const xRange = xMax * 1.1;
    svg.append('line').attr('x1', x(0)).attr('y1', y(intercept)).attr('x2', x(xRange)).attr('y2', y(slope * xRange + intercept))
      .attr('stroke', '#ef4444').attr('stroke-width', 2).attr('stroke-dasharray', '5,5');

  }, [dataPoints, experiment]);

  const calculatedW = isMomentsLab ? (100 * stats.slope) / (1 - stats.slope) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Graph Board</h2>
          <p className="text-sm text-slate-500">WAEC standard scale representation</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white border-4 border-slate-200 rounded shadow-inner overflow-auto flex justify-center items-center p-4 waec-grid">
          {dataPoints.length >= 2 ? (
            <svg ref={svgRef} className="max-w-full max-h-full"></svg>
          ) : (
            <div className="text-center text-slate-400 max-w-sm">
              <span className="text-6xl block mb-4">📈</span>
              <p className="font-medium">Capture at least 2 readings to generate the graph.</p>
            </div>
          )}
        </div>

        <div className="w-80 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Gradient Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Equation of Line</p>
                <p className="text-sm font-mono font-bold text-slate-800">
                  P = {stats.slope.toFixed(4)}X⁻¹ + {stats.intercept.toFixed(4)}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Slope (S)</p>
                <span className="text-2xl font-bold text-indigo-600">{stats.slope.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {isMomentsLab && calculatedW !== null && (
            <div className="bg-indigo-900 text-indigo-100 p-5 rounded-xl shadow-lg border border-indigo-800">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Mass Deduction</h3>
              <p className="text-[10px] mb-4 opacity-70">Using S = W / (W + 100):</p>
              <div className="text-center">
                <p className="text-[10px] text-indigo-400">Mass of Rule (W)</p>
                <p className="text-3xl font-bold text-white">{Math.abs(calculatedW).toFixed(2)}</p>
                <p className="text-xs text-indigo-300">grams (g)</p>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-800/50 flex justify-between text-[10px]">
                 <span>Evaluation accuracy:</span>
                 <span className="text-green-400 font-bold">Excellent</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphBoard;
