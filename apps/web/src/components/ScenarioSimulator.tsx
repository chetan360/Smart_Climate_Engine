"use client";

import React, { useState, useEffect } from "react";
import { Sliders, RefreshCw, Check, ArrowRight } from "lucide-react";
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

  // Objective weights
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

  useEffect(() => {
    setRegionName(selectedRegion);
  }, [selectedRegion]);

  const toggleIntervention = (key: string) => {
    setInterventions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applySpongePreset = () => {
    setInterventions({
      wetland: true,
      permeable: true,
      bioswales: true,
      smart_drainage: true,
      concrete_canal: false,
      rainwater_wells: true,
    });
  };

  const applyDrainagePreset = () => {
    setInterventions({
      wetland: false,
      permeable: false,
      bioswales: false,
      smart_drainage: true,
      concrete_canal: true,
      rainwater_wells: false,
    });
  };

  const applyAllPreset = () => {
    setInterventions({
      wetland: true,
      permeable: true,
      bioswales: true,
      smart_drainage: true,
      concrete_canal: true,
      rainwater_wells: true,
    });
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
      {/* Header Banner */}
      <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-notion-text flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <span>Multi-Hazard Climate Scenario Simulator</span>
            </h1>
            <p className="text-sm text-notion-secondary mt-1 max-w-3xl leading-relaxed">
              Test combinations of nature-based sponge zones, permeable pavements, smart telemetry, and traditional civil culverts before committing municipal capital.
            </p>
          </div>
          <div>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? "Simulating..." : "Recalculate Results"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Municipality & Fiscal Budget Inputs */}
          <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-notion-text">Municipal Scope & Capital Budget</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-notion-text mb-1.5">
                  Target City / Region
                </label>
                <input
                  type="text"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  placeholder="Enter municipality or district name..."
                  className="w-full bg-notion-bg border border-notion-border rounded-lg px-3.5 py-2.5 text-sm text-notion-text placeholder-notion-secondary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-notion-text">
                    Capital Budget Limit
                  </label>
                  <span className="text-base font-mono font-bold text-emerald-500">
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
                    className="flex-1 h-2.5 bg-notion-hover rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 10)}
                    className="w-20 bg-notion-bg border border-notion-border rounded-lg px-2.5 py-1.5 text-sm text-emerald-500 font-mono font-bold text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Intervention Portfolio Checklist */}
          <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-notion-text">Intervention Portfolio Selection</h2>
                <p className="text-xs sm:text-sm text-notion-secondary mt-0.5">
                  Select interventions or pick a preset package to calculate cross-hazard performance.
                </p>
              </div>

              {/* 1-Click Preset Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={applySpongePreset}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  🍃 Sponge City Preset
                </button>
                <button
                  type="button"
                  onClick={applyDrainagePreset}
                  className="px-3 py-1.5 rounded-lg bg-notion-hover hover:bg-notion-border text-notion-text border border-notion-border text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  🏗️ Canal Preset
                </button>
                <button
                  type="button"
                  onClick={applyAllPreset}
                  className="px-2.5 py-1.5 rounded-lg bg-notion-bg hover:bg-notion-hover text-notion-secondary border border-notion-border text-xs transition-colors cursor-pointer"
                >
                  All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {[
                {
                  key: "wetland",
                  label: "Wetland & Riparian Sponge Zones",
                  cost: "Rs. 18 Cr",
                  impact: "High natural absorption (+40% aquifer), attenuates flood surge",
                },
                {
                  key: "permeable",
                  label: "Permeable Pavements & Porous Roads",
                  cost: "Rs. 10 Cr",
                  impact: "Absorbs street runoff at source, mitigates urban surface heat",
                },
                {
                  key: "bioswales",
                  label: "Roadside Vegetated Bioswales",
                  cost: "Rs. 5 Cr",
                  impact: "Bio-filters stormwater and captures localized road waterlogging",
                },
                {
                  key: "rainwater_wells",
                  label: "Rainwater Infiltration Aquifer Wells",
                  cost: "Rs. 4 Cr",
                  impact: "Directly recharges depleted aquifers during heavy downpours",
                },
                {
                  key: "smart_drainage",
                  label: "Smart IoT Culvert Telemetry",
                  cost: "Rs. 7 Cr",
                  impact: "Early flood warnings and automated silt choke alerts",
                },
                {
                  key: "concrete_canal",
                  label: "Heavy Concrete Storm Canalization",
                  cost: "Rs. 25 Cr",
                  impact: "Flushes surface runoff rapidly; impairs groundwater table (-15%)",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleIntervention(item.key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    interventions[item.key]
                      ? "bg-notion-bg border-emerald-500 text-notion-text ring-1 ring-emerald-500/30"
                      : "bg-notion-bg/40 border-notion-border text-notion-secondary hover:border-notion-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border text-xs shrink-0 ${
                          interventions[item.key]
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-notion-border bg-notion-sidebar"
                        }`}
                      >
                        {interventions[item.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-notion-text">{item.label}</div>
                        <div className="text-xs sm:text-sm text-notion-secondary mt-1 leading-relaxed">{item.impact}</div>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-500 whitespace-nowrap">
                      {item.cost}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objective Prioritization Weights */}
          <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-notion-text">Municipal Priority Balancing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-xs sm:text-sm text-notion-text block mb-1.5 font-medium">
                  Flood Safety
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={floodWeight}
                  onChange={(e) => setFloodWeight(Number(e.target.value) || 0)}
                  className="w-full bg-notion-bg border border-notion-border rounded-lg px-3 py-2 text-sm text-notion-text font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-notion-text block mb-1.5 font-medium">
                  Aquifer Recharge
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gwWeight}
                  onChange={(e) => setGwWeight(Number(e.target.value) || 0)}
                  className="w-full bg-notion-bg border border-notion-border rounded-lg px-3 py-2 text-sm text-notion-text font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-notion-text block mb-1.5 font-medium">
                  Urban Heat Relief
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={heatWeight}
                  onChange={(e) => setHeatWeight(Number(e.target.value) || 0)}
                  className="w-full bg-notion-bg border border-notion-border rounded-lg px-3 py-2 text-sm text-notion-text font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-notion-text block mb-1.5 font-medium">
                  Cost Efficiency
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={costWeight}
                  onChange={(e) => setCostWeight(Number(e.target.value) || 0)}
                  className="w-full bg-notion-bg border border-notion-border rounded-lg px-3 py-2 text-sm text-notion-text font-mono text-center font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-notion-border flex justify-end">
              <button
                type="button"
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm sm:text-base font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Running Simulation..." : "Simulate Scenario Impact"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                Simulation Scorecard
              </span>
              <h3 className="text-base sm:text-lg font-bold text-notion-text mt-1">
                {regionName}
              </h3>
            </div>

            {/* Composite Score Card */}
            <div className="bg-notion-bg border border-notion-border rounded-xl p-5 text-center">
              <span className="text-xs text-notion-secondary uppercase tracking-wider block font-medium">
                Composite Resilience Score
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-500 font-mono my-2">
                {simResults.resilience_index} <span className="text-base text-notion-secondary font-normal">/ 100</span>
              </div>
              <div className="text-xs sm:text-sm text-notion-text mt-2">
                Capex: <strong className="text-notion-text">Rs. {estimatedCostCr.toFixed(1)} Cr</strong> · Headroom:{" "}
                <strong className="text-emerald-500">Rs. {headroomCr.toFixed(1)} Cr</strong>
              </div>
            </div>

            {/* Quantitative Impact Bars */}
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-notion-text font-medium">Flood Risk Mitigation</span>
                  <span className="font-bold text-emerald-500 font-mono">
                    +{simResults.flood_risk_reduction_percentage}%
                  </span>
                </div>
                <div className="w-full bg-notion-hover rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, simResults.flood_risk_reduction_percentage)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-notion-text font-medium">Aquifer Recharge Gain</span>
                  <span
                    className={`font-bold font-mono ${
                      simResults.groundwater_recharge_benefit_percentage >= 0
                        ? "text-cyan-500"
                        : "text-rose-500"
                    }`}
                  >
                    {simResults.groundwater_recharge_benefit_percentage >= 0
                      ? `+${simResults.groundwater_recharge_benefit_percentage}%`
                      : `${simResults.groundwater_recharge_benefit_percentage}%`}
                  </span>
                </div>
                <div className="w-full bg-notion-hover rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
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
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-notion-text font-medium">Urban Heat Island Cooling</span>
                  <span className="font-bold font-mono text-amber-500">
                    -{simResults.urban_heat_reduction_percentage}°C
                  </span>
                </div>
                <div className="w-full bg-notion-hover rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, simResults.urban_heat_reduction_percentage * 50)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-notion-text font-medium">Environmental Score</span>
                  <span className="font-bold font-mono text-emerald-500">
                    {simResults.environmental_impact_score} / 100
                  </span>
                </div>
                <div className="w-full bg-notion-hover rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${simResults.environmental_impact_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategic Notes */}
            <div className="pt-4 border-t border-notion-border space-y-2 text-xs sm:text-sm">
              <span className="font-semibold text-notion-text uppercase tracking-wider text-xs block mb-1">
                Summary of Trade-Offs
              </span>
              <ul className="space-y-1.5 text-notion-text">
                {simResults.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span className="leading-relaxed">{adv}</span>
                  </li>
                ))}
                {simResults.tradeoffs.map((tr, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold text-sm">•</span>
                    <span className="leading-relaxed">{tr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Link to Chat */}
            {onNavigateToChat && (
              <button
                onClick={() =>
                  onNavigateToChat(
                    `Evaluate simulated package for ${regionName} with Rs. ${budget} Cr budget and ${simResults.flood_risk_reduction_percentage}% flood containment.`
                  )
                }
                className="w-full py-3 px-4 rounded-lg bg-notion-hover hover:bg-notion-border text-notion-text text-sm font-semibold border border-notion-border flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Ask AI Assistant About this Result</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
