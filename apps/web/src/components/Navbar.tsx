"use client";

import React from "react";
import { ShieldCheck, Activity, Database, Cpu, Sparkles, MapPin } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export function Navbar({ activeTab, setActiveTab, selectedRegion, setSelectedRegion }: NavbarProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">Smart Climate Engine</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  v1.0 MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Climate Resilience Decision Intelligence · <span className="text-emerald-400 font-medium">Team Climate Bandits</span> (PCCOE Grand Challenge 2026)
              </p>
            </div>
          </div>

          {/* Region Selector & System Status */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <select
                aria-label="Select Target Region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
              >
                <option value="Pune & PCMC (Case Study)" className="bg-slate-900">Pune & PCMC (Case Study)</option>
                <option value="Mula-Mutha River Basin" className="bg-slate-900">Mula-Mutha River Basin</option>
                <option value="Hinjawadi IT Corridor" className="bg-slate-900">Hinjawadi IT Corridor</option>
              </select>
            </div>

            {/* Micro Status Badges */}
            <div className="flex items-center space-x-2 bg-slate-900/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px]">PostGIS</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px]">FastAPI</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Nugen AI</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 border-t border-white/5 text-sm">
          {[
            { id: "matrix", label: "Executive Decision Matrix" },
            { id: "simulator", label: "Interactive Scenario Simulator" },
            { id: "gis", label: "Geospatial Risk & Interventions Map" },
            { id: "explorer", label: "Environmental Data Explorer" },
            { id: "nugen", label: "Nugen AI Reasoning Studio" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
