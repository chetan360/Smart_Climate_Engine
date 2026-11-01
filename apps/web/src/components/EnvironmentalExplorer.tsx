"use client";

import React from "react";
import { BarChart3, CloudRain, Droplets, Wind, Thermometer, Database } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { EnvironmentalDataPoint, EnvironmentalSummary } from "../lib/types";

interface EnvironmentalExplorerProps {
  dataPoints: EnvironmentalDataPoint[];
  summaries: EnvironmentalSummary[];
}

const RAINFALL_DATA = [
  { station: "Shivajinagar", rainfall: 82.5, normal: 45 },
  { station: "Hinjawadi IT", rainfall: 96.2, normal: 50 },
  { station: "PCMC Nigdi", rainfall: 125.0, normal: 60 },
  { station: "PCCOE Akurdi", rainfall: 145.7, normal: 65 },
];

const RIVER_LEVEL_DATA = [
  { time: "00:00", pavana: 2.8, mula: 2.2, danger: 4.5 },
  { time: "04:00", pavana: 3.2, mula: 2.6, danger: 4.5 },
  { time: "08:00", pavana: 3.9, mula: 3.1, danger: 4.5 },
  { time: "12:00", pavana: 4.2, mula: 3.5, danger: 4.5 },
  { time: "16:00", pavana: 4.4, mula: 3.8, danger: 4.5 },
];

const LAND_USE_DATA = [
  { name: "Impervious Paved Surfaces", pct: 72, color: "#f43f5e" },
  { name: "High-Density Built-up", pct: 68, color: "#f97316" },
  { name: "Urban Open Land", pct: 15, color: "#eab308" },
  { name: "Natural Vegetation / Forest", pct: 12, color: "#10b981" },
  { name: "Riparian Water Bodies", pct: 5, color: "#06b6d4" },
];

export function EnvironmentalExplorer({ dataPoints, summaries }: EnvironmentalExplorerProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Real-time Environmental Telemetry Stream</span>
        </div>
        <h2 className="text-xl font-bold text-white">Pune & PCMC Climate Observation Dashboard</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Fusing rain gauges, river hydrologic stations, ambient temperature monitors, and satellite land-use indexes into a single queryable PostGIS data layer.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Peak 24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">145.7 mm</div>
          <div className="text-[11px] text-rose-400 mt-1">Recorded at PCCOE Akurdi Station (+124% normal)</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pavana River Stage</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">4.40 m</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Danger Mark: 4.50 m (10 cm headroom)</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Impervious Surface Ratio</span>
            <BarChart3 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">72.0%</div>
          <div className="text-[11px] text-slate-400 mt-1">Accelerates runoff 3.8x vs sponge basin</div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Peak Surface Temp</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">37.4 °C</div>
          <div className="text-[11px] text-slate-400 mt-1">Bhosari Industrial Hub (Urban Heat Island)</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Comparison Chart */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Precipitation by Station (mm/day)</h3>
            <span className="text-xs text-blue-400 font-mono">Actual vs Seasonal Mean</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RAINFALL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.5rem", fontSize: "12px" }}
                />
                <Bar dataKey="rainfall" name="Recorded (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="normal" name="Seasonal Baseline (mm)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* River Hydrologic Stage */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">River Gauge Stage Level (24h Trend)</h3>
            <span className="text-xs text-amber-400 font-mono">Pavana vs Mula River</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RIVER_LEVEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[1.5, 5]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.5rem", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="pavana" name="Pavana River (Dapodi)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mula" name="Mula River (Sangvi)" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="danger" name="Critical Danger Level" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Land Use & Runoff Propensity Bars */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-semibold text-white">Metropolitan Land Cover & Runoff Propensity</h3>
        <p className="text-xs text-slate-400">
          High impervious surfaces (72%) prevent rainfall infiltration into the aquifer, directing storm waters into overcrowded drainage canals.
        </p>
        <div className="space-y-3 pt-2">
          {LAND_USE_DATA.map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">{item.name}</span>
                <span className="font-bold text-white font-mono">{item.pct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
