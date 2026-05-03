/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  Table as TableIcon, 
  Zap, 
  ArrowRight, 
  RefreshCcw, 
  Plus, 
  Minus, 
  Target, 
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  Sparkles
} from 'lucide-react';

// --- Types ---

interface AnalysisResult {
  summary: string;
  prosCons: {
    pros: string[];
    cons: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  comparisonTable: {
    headers: string[];
    rows: string[][];
  };
}

type ViewMode = 'proscons' | 'table' | 'swot';

// --- Gemini Setup ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief summary of the decision context." },
    prosCons: {
      type: Type.OBJECT,
      properties: {
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["pros", "cons"]
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
    },
    comparisonTable: {
      type: Type.OBJECT,
      properties: {
        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          } 
        }
      },
      required: ["headers", "rows"]
    }
  },
  required: ["summary", "prosCons", "swot", "comparisonTable"]
};

// --- Main App Component ---

export default function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('proscons');

  const analyzeDecision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following decision or comparison topic: "${topic}". 
        Provide a comprehensive analysis including:
        1. Major Pros and Cons.
        2. A full SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats).
        3. A structured comparison table comparing the primary options or the choice vs. doing nothing.
        Keep descriptions concise but insightful.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA as any,
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const parsedResult: AnalysisResult = JSON.parse(text);
      setResult(parsedResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Something went wrong with the AI analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1F] font-sans selection:bg-[#E5E5E5]">
      {/* Background Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <header className="mb-12 text-center border-b border-[#E5E5E7] pb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4"
          >
            <BrainCircuit size={14} />
            The Tiebreaker
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-light tracking-tight mb-4"
          >
            Decide with <span className="italic">Clarity</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#86868B] max-w-xl mx-auto"
          >
            Input your dilemma and let AI break it down into actionable frameworks.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={analyzeDecision} className="relative group">
                <input
                  id="decision-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Should I start a masters degree? or Buy a Tesla vs BMW?"
                  disabled={loading}
                  className="w-full bg-white border border-[#D2D2D7] rounded-2xl px-6 py-5 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-[#AEAEB2] disabled:opacity-50"
                  autoFocus
                />
                <button
                  id="analyze-button"
                  type="submit"
                  disabled={loading || !topic}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-xl hover:bg-zinc-800 disabled:bg-zinc-300 transition-colors shadow-lg"
                >
                  {loading ? (
                    <RefreshCcw className="animate-spin" size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </form>

              {/* Suggestions */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  "Sushi vs Chinese food?", 
                  "Freemium vs $20 monthly premium?", 
                  "Living in NYC vs London",
                  "Switching to a remote job"
                ].map((s) => (
                  <button
                    key={s}
                    id={`suggestion-${s.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => {
                      setTopic(s);
                    }}
                    className="text-xs px-4 py-2 bg-white border border-[#E5E5E7] rounded-full text-[#515154] hover:bg-[#F2F2F7] hover:border-[#D2D2D7] transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Results Navigation */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#D2D2D7] pb-8">
                <div className="flex bg-[#F2F2F7] p-1 rounded-xl">
                  <button
                    id="view-proscons"
                    onClick={() => setViewMode('proscons')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'proscons' ? 'bg-white shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                  >
                    <Scale size={16} /> Pros & Cons
                  </button>
                  <button
                    id="view-table"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                  >
                    <TableIcon size={16} /> Comparison Table
                  </button>
                  <button
                    id="view-swot"
                    onClick={() => setViewMode('swot')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'swot' ? 'bg-white shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                  >
                    <Zap size={16} /> SWOT Analysis
                  </button>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                    id="reset-button"
                    onClick={reset} 
                    className="flex items-center gap-2 text-sm font-medium text-[#0066CC] hover:underline"
                  >
                    <Plus size={16} className="rotate-45" /> New Analysis
                  </button>
                </div>
              </div>

              {/* Summary Section */}
              <div id="result-summary" className="p-8 bg-zinc-900 border border-zinc-800 text-white rounded-[2rem] shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Sparkles size={240} className="text-white" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1 px-2 rounded-md bg-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                      Gemini Synthesis
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-light text-zinc-100 leading-tight italic">
                    "{result.summary}"
                  </h2>
                </div>
              </div>

              {/* Dynamic Content View */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {viewMode === 'proscons' && (
                    <motion.div 
                      key="v-proscons"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="grid md:grid-cols-2 gap-8"
                    >
                      <div id="pros-section" className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1D1D1F]">
                          <div className="p-1.5 bg-green-100 text-green-700 rounded-lg"><Plus size={18} /></div> Pros
                        </h3>
                        {result.prosCons.pros.map((pro, i) => (
                          <div key={i} className="flex gap-4 p-5 bg-white border border-[#E5E5E7] rounded-2xl hover:shadow-md transition-all">
                            <span className="text-[#86868B] font-mono text-xs mt-1">{(i+1).toString().padStart(2, '0')}</span>
                            <p className="text-[#1D1D1F] leading-snug">{pro}</p>
                          </div>
                        ))}
                      </div>
                      <div id="cons-section" className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1D1D1F]">
                          <div className="p-1.5 bg-red-100 text-red-700 rounded-lg"><Minus size={18} /></div> Cons
                        </h3>
                        {result.prosCons.cons.map((con, i) => (
                          <div key={i} className="flex gap-4 p-5 bg-white border border-[#E5E5E7] rounded-2xl hover:shadow-md transition-all">
                            <span className="text-[#86868B] font-mono text-xs mt-1">{(i+1).toString().padStart(2, '0')}</span>
                            <p className="text-[#1D1D1F] leading-snug">{con}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'table' && (
                    <motion.div 
                      key="v-table"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="overflow-x-auto bg-white border border-[#E5E5E7] rounded-3xl"
                    >
                      <table id="comparison-table" className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FBFBFD] border-b border-[#E5E5E7]">
                            {result.comparisonTable.headers.map((header, i) => (
                              <th key={i} className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#86868B]">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E7]">
                          {result.comparisonTable.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-[#FBFBFD] transition-colors group">
                              {row.map((cell, j) => (
                                <td key={j} className={`px-6 py-5 align-top ${j === 0 ? 'font-semibold text-[#1D1D1F]' : 'text-[#424245]'}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {viewMode === 'swot' && (
                    <motion.div 
                      key="v-swot"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D2D2D7] border border-[#D2D2D7] rounded-3xl overflow-hidden shadow-xl"
                    >
                      {/* Strengths */}
                      <div id="swot-strengths" className="p-8 bg-white space-y-4">
                        <div className="flex items-center gap-3 text-blue-600">
                          <Target size={24} />
                          <h3 className="text-xl font-bold">Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                          {result.swot.strengths.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[#424245]">
                              <ChevronRight className="shrink-0 text-blue-600 mt-1" size={14} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div id="swot-weaknesses" className="p-8 bg-white space-y-4">
                        <div className="flex items-center gap-3 text-orange-600">
                          <AlertTriangle size={24} />
                          <h3 className="text-xl font-bold">Weaknesses</h3>
                        </div>
                        <ul className="space-y-3">
                          {result.swot.weaknesses.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[#424245]">
                              <ChevronRight className="shrink-0 text-orange-600 mt-1" size={14} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div id="swot-opportunities" className="p-8 bg-white space-y-4">
                        <div className="flex items-center gap-3 text-green-600">
                          <Lightbulb size={24} />
                          <h3 className="text-xl font-bold">Opportunities</h3>
                        </div>
                        <ul className="space-y-3">
                          {result.swot.opportunities.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[#424245]">
                              <ChevronRight className="shrink-0 text-green-600 mt-1" size={14} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div id="swot-threats" className="p-8 bg-white space-y-4">
                        <div className="flex items-center gap-3 text-purple-600">
                          <ShieldCheck size={24} />
                          <h3 className="text-xl font-bold">Threats</h3>
                        </div>
                        <ul className="space-y-3">
                          {result.swot.threats.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[#424245]">
                              <ChevronRight className="shrink-0 text-purple-600 mt-1" size={14} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-12 text-center border-t border-[#E5E5E7] mt-12 bg-[#FBFBFD]">
        <p className="text-xs text-[#86868B] uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
          Analyzed by Gemini 3 Flash <RefreshCcw size={12} />
        </p>
      </footer>
    </div>
  );
}

