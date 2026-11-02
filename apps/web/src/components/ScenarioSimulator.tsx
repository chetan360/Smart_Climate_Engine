"use client";

import React, { useState, useEffect } from "react";
import { Sliders, RefreshCw, Check, ArrowRight, Info } from "lucide-react";
import { climateApi } from "../lib/api";
import type { RegionInfo } from "../lib/types";

interface ScenarioSimulatorProps {
  selectedRegion: string;
  regions: RegionInfo[];
  onNavigateToChat?: (query: string) => void;
}

export function ScenarioSimulator({
  selectedRegion,
  regions,
  onNavigateToChat,
}: ScenarioSimulatorProps) {
  const [regionName, setRegionName] = useState<string>(selectedRegion);
  const [budget, setBudget] = useState<number>(50);
  const [targetMonths, setTargetMonths] = useState<number>(14);

  // Objective weights (must sum up or represent priority scale)
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
    advantages: string[];
    tradeoffs: string[];
  }>({
    flood_risk_reduction_percentage: 79,
    groundwater_recharge_benefit_percentage: 65,
    urban_heat_reduction_percentage: 1.6,
    environmental_impact_score: 92,
    estimated_cost: 350000000,
    implementation_time_months: 14,
    resilience_index: 88,
    advantages: [
      "Optimal balance across flood containment, aquifer recharge, and urban cooling",
      "Conserves municipal budget headroom compared to concrete culvert widening",
    ],
    tradeoffs: [
      "Requires multi-department execution across Stormwater and Parks branches",
    ],
  });

  // Keep in sync with navbar region
  useEffect(() => {
    setRegionName(selectedRegion);
  }, [selectedRegion]);

  const toggleIntervention = (key: string) => {
    setInterventions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const runSimulation = async () => {
    setIsSimulating(true);

    const activeInterventions: string[] = [];
    if (interventions.wetland) activeInterventions.push("wetland_restoration");
    if (interventions.permeable) activeInterventions.push("permeable_pavement");
    if (interventions.bioswales) activeInterventions.push("bioswales");
    if (interventions.smart_drainage) activeInterventions.push("drainage_maintenance");
    if (interventions.concrete_canal) activeInterventions.push("drainage_expansion");
    if (interventions.rainwater_wells) activeInterventions.push("rainwater_harvesting");

    try {
      // Call Express API gateway
      const res = await climateApi.simulateCustom({
        name: `Custom Simulation for ${regionName}`,
        region: regionName,
        budget: budget,
        interventions: activeInterventions,
        priorities: {
          resilience: floodWeight / 100,
          groundwater: gwWeight / 100,
          heat: heatWeight / 100,
          cost: costWeight / 100,
        },
      });

      const sim = (res as any).data || res;
      const r = sim.simulation_results || sim;
      if (r && r.flood_risk_reduction_percentage !== undefined) {
        setSimResults({
          flood_risk_reduction_percentage: r.flood_risk_reduction_percentage,
          groundwater_recharge_benefit_percentage: r.groundwater_recharge_benefit_percentage,
          urban_heat_reduction_percentage: r.urban_heat_reduction_percentage,
          environmental_impact_score: r.environmental_impact_score,
          estimated_cost: r.estimated_cost,
          implementation_time_months: r.implementation_time_months || targetMonths,
          resilience_index: r.resilience_index || 85,
          advantages: sim.advantages || [
            `Achieves ${r.flood_risk_reduction_percentage}% flood containment`,
            `Generates ${r.groundwater_recharge_benefit_percentage}% aquifer recharge`,
          ],
          tradeoffs: sim.tradeoffs || [
            `Allocates estimated Rs. ${(r.estimated_cost / 10000000).toFixed(1)} Cr`,
          ],
        });
      }
    } catch (err) {
      console.warn("Simulation call via Express:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [budget, interventions, regionName]);

  const estimatedCostCr = simResults.estimated_cost / 10000000;
  const headroomCr = Math.max(0, budget - estimatedCostCr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Multi-Hazard Climate Intervention Simulator</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Model cross-system consequences before committing municipal capital. Test combinations of nature-based sponge infrastructure, smart drainage telemetry, and conventional civil canalization across any municipality.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? "Simulating via Express..." : "Run Simulation"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Municipality & Fiscal Budget Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Municipal Scope & Capital Envelope</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Municipality / Target Region
                </label>
                <input
                  type="text"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  placeholder="Enter city or district name..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Authorized Budget Envelope
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Rs. {budget} Crore
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 10)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Intervention Portfolio Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Intervention Portfolio Selection</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle specific interventions to simulate their composite hydrological, environmental, and budgetary impacts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  key: "wetland",
                  label: "Wetland & Riparian Sponge Zones",
                  cost: "Rs. 18 Cr",
                  impact: "High infiltration (+40% aquifer), natural flood attenuation",
                  type: "Nature-Based",
                },
                {
                  key: "permeable",
                  label: "Permeable Pavements & Porous Roads",
                  cost: "Rs. 10 Cr",
                  impact: "Absorbs street runoff at source, cools surface heat",
                  type: "Nature-Based",
                },
                {
                  key: "bioswales",
                  label: "Roadside Vegetated Bioswales",
                  cost: "Rs. 5 Cr",
                  impact: "Bio-filters stormwater and captures localized waterlogging",
                  type: "Nature-Based",
                },
                {
                  key: "rainwater_wells",
                  label: "Rainwater Infiltration Aquifer Wells",
                  cost: "Rs. 4 Cr",
                  impact: "Direct aquifer recharge during monsoon cloudbursts",
                  type: "Nature-Based",
                },
                {
                  key: "smart_drainage",
                  label: "Smart IoT Culvert & Drain Telemetry",
                  cost: "Rs. 7 Cr",
                  impact: "Predictive choke alerts and automated silt monitoring",
                  type: "Telemetry",
                },
                {
                  key: "concrete_canal",
                  label: "Heavy Concrete Storm Canalization",
                  cost: "Rs. 25 Cr",
                  impact: "Rapid evacuation; blocks aquifer recharge (-15%)",
                  type: "Civil Engineering",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleIntervention(item.key)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    interventions[item.key]
                      ? "bg-slate-950 border-emerald-500/60 text-slate-100"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-[10px] shrink-0 ${
                          interventions[item.key]
                            ? "bg-emerald-600 border-emerald-500 text-slate-950"
                            : "border-slate-600 bg-slate-900"
                        }`}
                      >
                        {interventions[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.impact}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 whitespace-nowrap">
                      {item.cost}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objective Prioritization Weights */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">Stakeholder Priority Balancing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Flood Containment</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={floodWeight}
                  onChange={(e) => setFloodWeight(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono text-center"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Aquifer Recharge</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gwWeight}
                  onChange={(e) => setGwWeight(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono text-center"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Heat Island Mitigation</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={heatWeight}
                  onChange={(e) => setHeatWeight(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono text-center"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cost Efficiency</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={costWeight}
                  onChange={(e) => setCostWeight(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {/* Simulation Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Simulation Outcome ({regionName})
              </div>
              <h3 className="text-base font-semibold text-slate-100 mt-1">Multi-Objective Scorecard</h3>
            </div>

            {/* Composite Score Card */}
            <div className="bg-slate-950 border border-slate-800 rounded p-4 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                Composite Resilience Index
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono my-1">
                {simResults.resilience_index} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Capex: <strong>Rs. {estimatedCostCr.toFixed(1)} Cr</strong> · Unallocated Headroom:{" "}
                <strong className="text-emerald-400">Rs. {headroomCr.toFixed(1)} Cr</strong>
              </div>
            </div>

            {/* Quantitative Impact Bars */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Flood Risk Reduction</span>
                  <span className="font-bold text-emerald-400">
                    +{simResults.flood_risk_reduction_percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded transition-all duration-300"
                    style={{ width: `${Math.min(100, simResults.flood_risk_reduction_percentage)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Groundwater Infiltration</span>
                  <span
                    className={`font-bold font-mono ${
                      simResults.groundwater_recharge_benefit_percentage >= 0
                        ? "text-cyan-400"
                        : "text-rose-400"
                    }`}
                  >
                    {simResults.groundwater_recharge_benefit_percentage >= 0
                      ? `+${simResults.groundwater_recharge_benefit_percentage}%`
                      : `${simResults.groundwater_recharge_benefit_percentage}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded transition-all duration-300 ${
                      simResults.groundwater_recharge_benefit_percentage >= 0
                        ? "bg-cyan-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.max(
                        5,
                        Math.min(100, Math.abs(simResults.groundwater_recharge_benefit_percentage))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Urban Heat Island Cooling</span>
                  <span className="font-bold font-mono text-amber-300">
                    -{simResults.urban_heat_reduction_percentage}°C
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded transition-all duration-300"
                    style={{
                      width: `${Math.min(100, simResults.urban_heat_reduction_percentage * 50)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Environmental Co-Benefit Score</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {simResults.environmental_impact_score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded transition-all duration-300"
                    style={{ width: `${simResults.environmental_impact_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategic Notes */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide block">
                Trade-Off Reasoning
              </span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                {simResults.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
                {simResults.tradeoffs.map((tr, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Action to Chat */}
            {onNavigateToChat && (
              <button
                onClick={() =>
                  onNavigateToChat(
                    `Evaluate simulated package for ${regionName} with Rs. ${budget} Cr budget and ${simResults.flood_risk_reduction_percentage}% flood containment.`
                  )
                }
                className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Ask AI Assistant About this Result</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
