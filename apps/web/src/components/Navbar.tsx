"use client";

import React from "react";
import { ShieldCheck, MessageSquare, UploadCloud, Sliders, BarChart3, Map, Database } from "lucide-react";
import type { RegionInfo } from "../lib/types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regions: RegionInfo[];
}

export function Navbar({
  activeTab,
  setActiveTab,
  selectedRegion,
  setSelectedRegion,
  regions,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Platform Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold tracking-tight text-white">Smart Climate Engine</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  Municipal Decision Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Hazard Climate Resilience & Urban Scenario Simulation Platform
              </p>
            </div>
          </div>

          {/* Region Selector & Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Municipality / Region:</span>
              <select
                aria-label="Select Target Region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-900 text-emerald-400 font-medium outline-none cursor-pointer text-xs"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.name} className="bg-slate-900 text-slate-200">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Functional Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 text-xs sm:text-sm">
          {[
            { id: "matrix", label: "Decision Matrix", icon: BarChart3 },
            { id: "simulator", label: "Scenario Simulator", icon: Sliders },
            { id: "chat", label: "Official AI Chat", icon: MessageSquare },
            { id: "files", label: "Document Ingestion", icon: UploadCloud },
            { id: "gis", label: "Geospatial Hazard Map", icon: Map },
            { id: "explorer", label: "Environmental Telemetry", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${isActive
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
