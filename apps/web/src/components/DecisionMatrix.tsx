"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Download, Printer } from "lucide-react";
import type { ScenarioOption } from "../lib/types";

interface DecisionMatrixProps {
  scenarios: ScenarioOption[];
  selectedRegion: string;
  onSelectOption?: (optionId: string) => void;
  onNavigateToChat?: (query: string) => void;
}

export function DecisionMatrix({ scenarios, selectedRegion, onNavigateToChat }: DecisionMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>("opt-d");
  const [adoptedOption, setAdoptedOption] = useState<string | null>("opt-d");
  const [sortBy, setSortBy] = useState<"default" | "cost" | "flood" | "groundwater">("default");

  const sortedScenarios = [...scenarios].sort((a, b) => {
    if (sortBy === "cost") return a.cost_crores - b.cost_crores;
    if (sortBy === "flood") return b.flood_risk_reduction_pct - a.flood_risk_reduction_pct;
    if (sortBy === "groundwater") return b.groundwater_recharge_pct - a.groundwater_recharge_pct;
    return 0;
  });

  const selectedScenario = scenarios.find((s) => s.id === selectedId) || scenarios[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
              Comparative Decision Intelligence
            </div>
            <h1 className="text-base font-semibold text-slate-100">
              {selectedRegion}: Climate Resilience Strategy Comparison
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Cross-system trade-off evaluation under a benchmark <strong>Rs. 50 Crore</strong> municipal capital budget envelope. The multi-objective engine calculates secondary impacts on aquifer recharge, downstream runoff velocity, and microclimate cooling.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Benchmark Budget</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">Rs. 50.0 Cr</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Optimal Savings</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">Rs. 15.0 Cr Headroom</span>
            </div>
          </div>
        </div>

        {/* Sort & Filter Controls */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sort Strategies:</span>
            <button
              onClick={() => setSortBy("default")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sortBy === "default"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Default Sequence
            </button>
            <button
              onClick={() => setSortBy("flood")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sortBy === "flood"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Highest Flood Safety
            </button>
            <button
              onClick={() => setSortBy("groundwater")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sortBy === "groundwater"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Best Aquifer Recharge
            </button>
            <button
              onClick={() => setSortBy("cost")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sortBy === "cost"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lowest Capex
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-xs flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export Memo</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 4-Option Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedScenarios.map((option) => {
          const isSelected = selectedId === option.id;
          const isRec = option.is_recommended;

          return (
            <div
              key={option.id}
              onClick={() => setSelectedId(option.id)}
              className={`cursor-pointer rounded-lg p-4 transition-all border flex flex-col justify-between ${
                isRec
                  ? "bg-slate-900 border-emerald-500/70 ring-1 ring-emerald-500/40"
                  : isSelected
                  ? "bg-slate-900 border-slate-600 ring-1 ring-slate-600"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <h2 className="font-semibold text-slate-100 text-xs leading-snug">
                    {option.name}
                  </h2>
                  {isRec && (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded shrink-0">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {option.description}
                </p>

                {/* Score Table */}
                <div className="space-y-1.5 text-xs bg-slate-950 rounded p-2.5 border border-slate-800 font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-sans">Flood Containment:</span>
                    <span className="font-bold text-emerald-400">-{option.flood_risk_reduction_pct}%</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-sans">Aquifer Recharge:</span>
                    <span
                      className={`font-bold ${
                        option.groundwater_recharge_pct > 0 ? "text-cyan-400" : "text-rose-400"
                      }`}
                    >
                      {option.groundwater_recharge_pct > 0
                        ? `+${option.groundwater_recharge_pct}%`
                        : `${option.groundwater_recharge_pct}%`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-sans">Heat Mitigation:</span>
                    <span className="font-bold text-amber-300">-{option.urban_heat_reduction_deg}°C</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-1.5 text-[11px]">
                    <span className="text-slate-400 font-sans">Capital Outlay:</span>
                    <span className="font-bold text-slate-100">Rs. {option.cost_crores} Cr</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{option.implementation_months} mo timeline</span>
                <span
                  className={`font-medium flex items-center space-x-1 ${
                    isSelected ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  <span>{isSelected ? "Inspecting" : "Select"}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Deep-Dive & Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Details & Hidden Trade-off */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide">Selected Strategy Evaluation</span>
              <h2 className="text-sm font-semibold text-slate-100">{selectedScenario.name}</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                Rs. {selectedScenario.cost_crores} Cr
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono">
                Feasibility: {selectedScenario.feasibility_score}/100
              </span>
            </div>
          </div>

          {/* Hidden Trade-off Callout */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded p-3 text-xs text-amber-200 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center space-x-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Cross-System Trade-Off Analysis</span>
            </div>
            <p className="leading-relaxed text-[11px]">{selectedScenario.tradeoff_note}</p>
          </div>

          {/* Advantages vs Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3.5">
              <h3 className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary Operational Strengths</span>
              </h3>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedScenario.advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-3.5">
              <h3 className="font-semibold text-rose-400 uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Regulatory & Implementation Limitations</span>
              </h3>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedScenario.disadvantages.map((dis, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Municipal Adoption Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Official Decision Approval
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Municipal Council Action</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The AI Decision Engine presents quantitative simulations and trade-off rationales. The official authority records the final adoption.
            </p>

            <div className="mt-4 space-y-2 bg-slate-950 rounded p-3 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">Strategy:</span>
                <span className="font-bold text-slate-100">{selectedScenario.name.split(":")[0]}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">Capital Outlay:</span>
                <span className="font-bold text-emerald-400">Rs. {selectedScenario.cost_crores} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">Fiscal Reserve:</span>
                <span className="font-bold text-cyan-400">Rs. {50 - selectedScenario.cost_crores} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5">
                <span className="font-sans text-slate-400">Status:</span>
                <span
                  className={
                    adoptedOption === selectedScenario.id
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400 font-medium"
                  }
                >
                  {adoptedOption === selectedScenario.id ? "Approved & Logged" : "Pending Official Call"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setAdoptedOption(selectedScenario.id)}
              className="w-full py-2.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {adoptedOption === selectedScenario.id
                  ? "Approved as Municipal Baseline ✓"
                  : `Adopt ${selectedScenario.name.split(":")[0]}`}
              </span>
            </button>

            {onNavigateToChat && (
              <button
                onClick={() =>
                  onNavigateToChat(
                    `Draft a formal council resolution approving ${selectedScenario.name} for ${selectedRegion} at Rs. ${selectedScenario.cost_crores} Cr.`
                  )
                }
                className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                Draft Resolution Note in Chat →
              </button>
            )}

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(selectedScenario, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `climate-decision-${selectedScenario.id}.json`;
                a.click();
              }}
              className="w-full py-2 px-3 rounded bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Export Record (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
