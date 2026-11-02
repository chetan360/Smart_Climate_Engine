"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, Download, Printer } from "lucide-react";
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Decision Matrix & Trade-Offs
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              {selectedRegion}: Climate Resilience Intervention Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Compare strategic options under the benchmark <strong>Rs. 50 Crore</strong> municipal capital budget envelope. The multi-objective engine calculates secondary impacts on aquifer recharge, downstream runoff, and urban heat.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-center">
              <span className="text-xs text-slate-400 uppercase block font-medium">Benchmark Budget</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">Rs. 50.0 Cr</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-center">
              <span className="text-xs text-slate-400 uppercase block font-medium">Optimal Headroom</span>
              <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono">Rs. 15.0 Cr Saved</span>
            </div>
          </div>
        </div>

        {/* Sort & Filter Controls */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs sm:text-sm font-medium">Sort Options:</span>
            <button
              onClick={() => setSortBy("default")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer ${
                sortBy === "default"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setSortBy("flood")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer ${
                sortBy === "flood"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Highest Flood Safety
            </button>
            <button
              onClick={() => setSortBy("groundwater")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer ${
                sortBy === "groundwater"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Best Aquifer Recharge
            </button>
            <button
              onClick={() => setSortBy("cost")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer ${
                sortBy === "cost"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lowest Cost
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Decision Memo</span>
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
              className={`cursor-pointer rounded-xl p-5 transition-all border flex flex-col justify-between shadow-sm ${
                isRec
                  ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30"
                  : isSelected
                  ? "bg-slate-900 border-slate-500 ring-1 ring-slate-500"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
                    {option.name}
                  </h2>
                  {isRec && (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md shrink-0">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {option.description}
                </p>

                {/* Score Table */}
                <div className="space-y-2 text-sm bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-xs sm:text-sm">Flood Containment:</span>
                    <span className="font-bold text-emerald-400 text-sm sm:text-base">-{option.flood_risk_reduction_pct}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-xs sm:text-sm">Aquifer Recharge:</span>
                    <span
                      className={`font-bold text-sm sm:text-base ${
                        option.groundwater_recharge_pct > 0 ? "text-cyan-400" : "text-rose-400"
                      }`}
                    >
                      {option.groundwater_recharge_pct > 0
                        ? `+${option.groundwater_recharge_pct}%`
                        : `${option.groundwater_recharge_pct}%`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-xs sm:text-sm">Heat Mitigation:</span>
                    <span className="font-bold text-amber-300 text-sm sm:text-base">-{option.urban_heat_reduction_deg}°C</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                    <span className="text-slate-400 font-sans text-xs sm:text-sm">Estimated Cost:</span>
                    <span className="font-bold text-slate-100 text-sm sm:text-base">Rs. {option.cost_crores} Cr</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">{option.implementation_months} mo timeline</span>
                <span
                  className={`font-semibold flex items-center space-x-1 ${
                    isSelected ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  <span>{isSelected ? "Inspecting" : "Select Option"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Deep-Dive & Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Details & Hidden Trade-off */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Detailed Strategy Evaluation
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                {selectedScenario.name}
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-3 py-1 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 font-mono font-bold">
                Rs. {selectedScenario.cost_crores} Cr
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono font-bold">
                Feasibility: {selectedScenario.feasibility_score} / 100
              </span>
            </div>
          </div>

          {/* Hidden Trade-off Callout */}
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-xs sm:text-sm text-amber-200 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center space-x-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cross-System Trade-Off Analysis</span>
            </div>
            <p className="leading-relaxed">{selectedScenario.tradeoff_note}</p>
          </div>

          {/* Advantages vs Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 uppercase text-xs tracking-wider mb-2.5 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Primary Operational Strengths</span>
              </h3>
              <ul className="space-y-1.5 text-slate-300">
                {selectedScenario.advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="leading-relaxed">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-rose-400 uppercase text-xs tracking-wider mb-2.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Regulatory & Implementation Limitations</span>
              </h3>
              <ul className="space-y-1.5 text-slate-300">
                {selectedScenario.disadvantages.map((dis, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span className="leading-relaxed">{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Municipal Adoption Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Official Decision Approval
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">Municipal Council Action</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              The AI Decision Engine presents quantitative simulations and trade-off rationales. The official authority records the final adoption.
            </p>

            <div className="mt-4 space-y-2.5 bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs sm:text-sm font-mono">
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
              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                <span className="font-sans text-slate-400">Status:</span>
                <span
                  className={
                    adoptedOption === selectedScenario.id
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400 font-semibold"
                  }
                >
                  {adoptedOption === selectedScenario.id ? "Approved & Logged" : "Pending Official Call"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setAdoptedOption(selectedScenario.id)}
              className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
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
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
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
              className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-xs sm:text-sm border border-slate-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Record (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
