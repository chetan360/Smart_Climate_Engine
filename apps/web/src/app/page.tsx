"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { DecisionMatrix } from "../components/DecisionMatrix";
import { ScenarioSimulator } from "../components/ScenarioSimulator";
import { GeospatialMap } from "../components/GeospatialMap";
import { EnvironmentalExplorer } from "../components/EnvironmentalExplorer";
import { NugenAIExplainer } from "../components/NugenAIExplainer";
import { climateApi, DEFAULT_SCENARIOS, DEFAULT_DATA_POINTS } from "../lib/api";
import type { ScenarioOption, EnvironmentalDataPoint, EnvironmentalSummary } from "../lib/types";
import { ShieldCheck, Heart, Sparkles, Layers, Sliders, BarChart3, Database } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("matrix");
  const [selectedRegion, setSelectedRegion] = useState<string>("Pune & PCMC (Case Study)");
  const [scenarios, setScenarios] = useState<ScenarioOption[]>(DEFAULT_SCENARIOS);
  const [dataPoints, setDataPoints] = useState<EnvironmentalDataPoint[]>(DEFAULT_DATA_POINTS);
  const [summaries, setSummaries] = useState<EnvironmentalSummary[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [pts, sums] = await Promise.all([
          climateApi.getEnvironmentalData(),
          climateApi.getEnvironmentalSummary(),
        ]);
        if (pts && pts.length > 0) setDataPoints(pts);
        if (sums && sums.length > 0) setSummaries(sums);
      } catch (err) {
        console.warn("Using offline presentation baseline:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "matrix" && (
          <DecisionMatrix scenarios={scenarios} />
        )}

        {activeTab === "simulator" && (
          <ScenarioSimulator />
        )}

        {activeTab === "gis" && (
          <GeospatialMap dataPoints={dataPoints} />
        )}

        {activeTab === "explorer" && (
          <EnvironmentalExplorer dataPoints={dataPoints} summaries={summaries} />
        )}

        {activeTab === "nugen" && (
          <NugenAIExplainer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-300 font-semibold">Smart Climate Engine</span>
            <span>· Monorepo Edition</span>
          </div>

          <div className="text-center md:text-right">
            <div>
              Developed for <strong className="text-slate-300">PCCOE International Grand Challenge 2026</strong> · Theme: AI for Climate Change
            </div>
            <div className="text-slate-400 mt-0.5">
              Team <strong className="text-emerald-400 font-medium">Climate Bandits</strong> (Srishti Sharma, Chetan Satish Mankar, Onkar Vinayak Dongare)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
