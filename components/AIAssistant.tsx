
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Experiment, ExperimentDataPoint } from '../types';

interface AIAssistantProps {
  experiment: Experiment;
  data: ExperimentDataPoint[];
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ experiment, data, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const analyzeExperiment = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dataSummary = data.map(p => `X_inv=${p.x}, P=${p.y}`).join("; ");
      
      const prompt = `
        You are an expert Physics Practical Moderator for WASSCE/WAEC. 
        Analyze this student's work for: ${experiment.title}.
        Aim: ${experiment.aim}
        Data Captured: ${dataSummary}
        
        Provide professional feedback in three points:
        1. Numerical Integrity: Check if the relationship P vs X⁻¹ appears linear.
        2. Mark Scrutiny: Comment on the precision of the recordings (significant figures).
        3. Strategic Tip: Advise on how to handle the "Knife Edge" better or how to ensure the rule doesn't parallax during reading.
        Be concise, authoritative yet helpful.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setMessages([{ role: 'ai', text: response.text || "I've analyzed your results. Keep up the good work!" }]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'ai', text: "Unable to reach the lab server. Please continue your experiment." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      analyzeExperiment();
    } else {
      setMessages([{ role: 'ai', text: "Welcome to the physics lab. Perform at least one trial, and I will check your accuracy against WASSCE marking criteria." }]);
    }
  }, [data.length, experiment.id]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-indigo-200 overflow-hidden flex flex-col max-h-[500px] border-t-4 border-t-indigo-600">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-xl shadow-inner">🤖</div>
          <div>
            <h4 className="font-bold text-indigo-900 leading-none">AI Lab Proctor</h4>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Expert Feedback</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className="flex justify-start">
            <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm whitespace-pre-wrap">
              {loading && i === messages.length - 1 ? "Analyzing..." : m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 text-[10px] text-slate-400 text-center">
        WASSCE Evaluation System Active
      </div>
    </div>
  );
};

export default AIAssistant;
