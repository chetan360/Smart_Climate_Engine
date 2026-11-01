"use client";

import React, { useState, useEffect } from "react";
import { Sliders, RefreshCw, Check, Zap, DollarSign, Droplets, Sun, Activity, Sparkles } from "lucide-react";
import { climateApi } from "../lib/api";

export function ScenarioSimulator() {
  const [budget, setBudget] = useState<number>(50);
  const [floodWeight, setFloodWeight] = useState<number>(40);
  const [gwWeight, setGwWeight] = useState<number>(30);
  const [heatWeight, setHeatWeight] = useState<number>(20);
  const [costWeight, setCostWeight] = useState<number>(10);

  const [interventions, setInterventions] = useState<{ [key: string]: boolean }>({
    wetland: true,
    permeable: true,
    bioswales: true,
    smart_drainage: true,
    concrete_canal: false,
    rainwater_wells: true,
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResults, setSimResults] = useState<{
    flood_risk_reduction_percentage: number;
    groundwater_recharge_benefit_percentage: number;
    urban_heat_reduction_percentage: number;
    environmental_impact_score: number;
    estimated_cost: number;
    implementation_time_months: number;
    resilience_index: number;
  }>({
    flood_risk_reduction_percentage: 79,
    groundwater_recharge_benefit_percentage: 65,
    urban_heat_reduction_percentage: 1.6,
    environmental_impact_score: 92,
    estimated_cost: 350000000,
    implementation_time_months: 14,
    resilience_index: 88,
  });

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      // Calculate active intervention contribution
      let costSum = 0;
      let floodScore = 0;
      let gwScore = 0;
      let heatScore = 0;

      if (interventions.wetland) {
        costSum += 18;
        floodScore += 35;
        gwScore += 40;
        heatScore += 0.8;
      }
      if (interventions.permeable) {
        costSum += 10;
        floodScore += 20;
        gwScore += 25;
        heatScore += 0.5;
      }
      if (interventions.bioswales) {
        costSum += 5;
        floodScore += 12;
        gwScore += 10;
        heatScore += 0.3;
      }
      if (interventions.smart_drainage) {
        costSum += 7;
        floodScore += 18;
        gwScore += 5;
        heatScore += 0.1;
      }
      if (interventions.concrete_canal) {
        costSum += 25;
        floodScore += 30;
        gwScore -= 20; // reduces recharge
        heatScore -= 0.2;
      }
      if (interventions.rainwater_wells) {
        costSum += 4;
        floodScore += 8;
        gwScore += 15;
        heatScore += 0.1;
      }

      // Cap with budget
      const finalCost = Math.min(budget, costSum);
      const scale = costSum > 0 ? Math.min(1.0, budget / costSum) : 0;
      const res = await climateApi.simulateCustom(finalCost, {
        flood: floodWeight / 100,
        gw: gwWeight / 100,
        heat: heatWeight / 100,
      });

      setSimResults({
        flood_risk_reduction_percentage: Math.min(96, Math.round(floodScore * scale)),
        groundwater_recharge_benefit_percentage: Math.round(gwScore * scale),
        urban_heat_reduction_percentage: parseFloat((heatScore * scale).toFixed(1)),
        environmental_impact_score: Math.min(98, Math.round(70 + (gwScore > 0 ? 20 : -10))),
        estimated_cost: finalCost * 10000000,
        implementation_time_months: Math.max(6, Math.round(costSum * 0.4)),
        resilience_index: Math.min(99, Math.round((floodScore * 0.45 + Math.max(0, gwScore) * 0.35 + 20) * scale)),
      });
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [budget, interventions]);

  const toggleIntervention = (key: string) => {
    setInterventions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>Testable "What-If" Simulation Sandbox</span>
        </div>
        <h2 className="text-xl font-bold text-white">Dynamic Municipal Intervention Simulator</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Simulate budget allocations, intervention packages, and stakeholder priority weightings before committing public capital. 
          The multi-objective engine models cross-hazard consequences continuously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Slider */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <label htmlFor="budget-slider" className="text-sm font-semibold text-white">Municipal Capital Budget</label>
                <p className="text-xs text-slate-400">Total authorized capital expenditure envelope</p>
              </div>
              <span className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                ₹{budget} Crore
              </span>
            </div>

            <input
              id="budget-slider"
              type="range"
              min="10"
              max="100"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>₹10 Cr (Pilot)</span>
              <span>₹50 Cr (Pune Standard)</span>
              <span>₹100 Cr (Metro-Scale)</span>
            </div>
          </div>

          {/* Intervention Selection */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white">Intervention Component Portfolio</h3>
            <p className="text-xs text-slate-400">Select combinations of nature-based and conventional engineering works</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: "wetland", label: "Wetland & Riparian Sponge Zones", cost: "₹18 Cr", type: "Nature-Based" },
                { key: "permeable", label: "Permeable Pavements & Porous Roads", cost: "₹10 Cr", type: "Nature-Based" },
                { key: "bioswales", label: "Roadside Vegetated Bioswales", cost: "₹5 Cr", type: "Nature-Based" },
                { key: "rainwater_wells", label: "Rainwater Infiltration Aquifer Wells", cost: "₹4 Cr", type: "Nature-Based" },
                { key: "smart_drainage", label: "Smart IoT Drain De-silt Telemetry", cost: "₹7 Cr", type: "Smart Telemetry" },
                { key: "concrete_canal", label: "Heavy Concrete Storm Canalization", cost: "₹25 Cr", type: "Conventional Civil" },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleIntervention(item.key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    interventions[item.key]
                      ? "bg-slate-900/90 border-emerald-500/50 text-white"
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/15"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-medium flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        interventions[item.key] ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-600"
                      }`}>
                        {interventions[item.key] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{item.type} · Est: {item.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Simulation Results Column */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Simulated Outcome
              </span>
              {isSimulating && (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              )}
            </div>

            {/* Big Resilience Metric */}
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 text-center mb-5">
              <div className="text-xs text-slate-400">Composite Resilience Index</div>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 my-1">
                {simResults.resilience_index} <span className="text-sm text-slate-500 font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Estimated Capital: ₹{(simResults.estimated_cost / 10000000).toFixed(1)} Cr · Budget Headroom: ₹{Math.max(0, budget - simResults.estimated_cost / 10000000).toFixed(1)} Cr
              </div>
            </div>

            {/* Performance Bars */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Flood Runoff Reduction</span>
                  <span className="font-bold text-emerald-400">+{simResults.flood_risk_reduction_percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, simResults.flood_risk_reduction_percentage)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Groundwater Recharge Gain</span>
                  <span className={`font-bold ${simResults.groundwater_recharge_benefit_percentage >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                    {simResults.groundwater_recharge_benefit_percentage >= 0 ? `+${simResults.groundwater_recharge_benefit_percentage}%` : `${simResults.groundwater_recharge_benefit_percentage}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${simResults.groundwater_recharge_benefit_percentage >= 0 ? "bg-cyan-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.max(5, Math.min(100, Math.abs(simResults.groundwater_recharge_benefit_percentage)))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Urban Heat Island Mitigation</span>
                  <span className="font-bold text-amber-300">-{simResults.urban_heat_reduction_percentage}°C</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, simResults.urban_heat_reduction_percentage * 50)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Environmental Co-Benefit</span>
                  <span className="font-bold text-emerald-300">{simResults.environmental_impact_score}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${simResults.environmental_impact_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={runSimulation}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center justify-center space-x-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-compute Pareto Frontier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
