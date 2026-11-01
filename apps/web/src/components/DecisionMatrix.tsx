"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Minus, Sparkles, Download, ShieldCheck, DollarSign, Droplets, SunMedium } from "lucide-react";
import type { ScenarioOption } from "../lib/types";

interface DecisionMatrixProps {
  scenarios: ScenarioOption[];
  onSelectOption?: (optionId: string) => void;
}

export function DecisionMatrix({ scenarios }: DecisionMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>("opt-d");
  const [adoptedOption, setAdoptedOption] = useState<string | null>(null);

  const selectedScenario = scenarios.find((s) => s.id === selectedId) || scenarios[3];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-cyan-950/60 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Objective Decision Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Pune & PCMC Climate Resilience Intervention Comparison
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Target Problem: Recurring monsoon flood risk across Pavana & Mula basins under a <strong className="text-emerald-300">Rs. 50 Crore</strong> municipal capital budget envelope. 
              The system calculates quantitative trade-offs across flood safety, groundwater replenishment, and urban heat.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-center">
              <div className="text-xs text-slate-400">Total Budget</div>
              <div className="text-lg font-bold text-emerald-400">₹50.0 Cr</div>
            </div>
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
              <div className="text-xs text-slate-400">Optimal Headroom</div>
              <div className="text-lg font-bold text-cyan-400">₹15.0 Cr Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* The 4-Option Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((option) => {
          const isSelected = selectedId === option.id;
          const isRec = option.is_recommended;

          return (
            <div
              key={option.id}
              onClick={() => setSelectedId(option.id)}
              className={`cursor-pointer rounded-xl p-5 transition-all duration-300 relative border flex flex-col justify-between ${
                isRec
                  ? "bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                  : isSelected
                  ? "bg-slate-900/80 border-cyan-500/50"
                  : "bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60"
              }`}
            >
              {isRec && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>AI Recommended</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-white text-base leading-snug">{option.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{option.description}</p>

                {/* Score Pills */}
                <div className="space-y-2 text-xs bg-slate-950/50 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" /> Flood Risk:
                    </span>
                    <span className="font-medium text-emerald-400 flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -{option.flood_risk_reduction_pct}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Groundwater:
                    </span>
                    <span className={`font-medium flex items-center ${option.groundwater_recharge_pct > 0 ? "text-cyan-400" : "text-rose-400"}`}>
                      {option.groundwater_recharge_pct > 0 ? (
                        <>+{option.groundwater_recharge_pct}%</>
                      ) : (
                        <>{option.groundwater_recharge_pct}% (Depletes)</>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Urban Heat:
                    </span>
                    <span className="font-medium text-amber-300">
                      -{option.urban_heat_reduction_deg}°C
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Est. Cost:
                    </span>
                    <span className="font-bold text-white">₹{option.cost_crores} Cr</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Timeline: {option.implementation_months} mo</span>
                <span className={`text-[11px] font-medium flex items-center gap-1 ${isSelected ? "text-cyan-300" : "text-slate-400"}`}>
                  {isSelected ? "Active View" : "Click to Inspect"} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Deep-Dive & Nugen AI Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Details & Hidden Trade-off */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs text-slate-400">Detailed Evaluation</div>
              <h2 className="text-xl font-bold text-white">{selectedScenario.name}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10">
                Budget: ₹{selectedScenario.cost_crores} Cr
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Feasibility: {selectedScenario.feasibility_score}/100
              </span>
            </div>
          </div>

          {/* The Hidden Trade-Off Explanation Callout */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Cross-System Trade-Off Analysis</span>
            </div>
            <p className="leading-relaxed">{selectedScenario.tradeoff_note}</p>
          </div>

          {/* Advantages vs Disadvantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-emerald-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key Advantages
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedScenario.advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/40 border border-rose-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Limitations & Bottlenecks
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedScenario.disadvantages.map((dis, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Municipal Human-in-the-Loop Decision Panel */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Human-In-The-Loop Governance</span>
            </div>
            <h3 className="text-lg font-bold text-white">Decision Executive Action</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The AI Decision Engine presents options, simulations, and trade-off rationales. The municipal authority makes the binding decision.
            </p>

            <div className="mt-5 space-y-3 bg-slate-950/50 rounded-xl p-4 border border-white/5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Strategy:</span>
                <span className="font-semibold text-white">{selectedScenario.name.split(":")[0]}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Allocated Capital:</span>
                <span className="font-semibold text-emerald-400">₹{selectedScenario.cost_crores} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Contingency Reserve:</span>
                <span className="font-semibold text-cyan-400">₹{50 - selectedScenario.cost_crores} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Status:</span>
                <span className={adoptedOption === selectedScenario.id ? "text-emerald-400 font-semibold" : "text-amber-400 font-medium"}>
                  {adoptedOption === selectedScenario.id ? "Approved & Logged" : "Pending Official Call"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setAdoptedOption(selectedScenario.id)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{adoptedOption === selectedScenario.id ? "Decision Approved ✓" : `Adopt ${selectedScenario.name.split(":")[0]}`}</span>
            </button>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(selectedScenario, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `climate-decision-${selectedScenario.id}.json`;
                a.click();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Municipal Decision Record (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
