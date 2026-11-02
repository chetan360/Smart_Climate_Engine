"use client";

import React, { useState } from "react";
import { CloudRain, Droplets, Thermometer, Wind, Database } from "lucide-react";
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
  selectedRegion?: string;
}

const RAINFALL_DATA = [
  { station: "Northern Station", rainfall: 145.7, normal: 65 },
  { station: "Municipal HQ", rainfall: 125.0, normal: 60 },
  { station: "Transit Hub", rainfall: 96.2, normal: 50 },
  { station: "Western Ward", rainfall: 82.5, normal: 45 },
];

const RIVER_LEVEL_DATA = [
  { time: "00:00", primary: 2.8, secondary: 2.2, danger: 4.5 },
  { time: "04:00", primary: 3.2, secondary: 2.6, danger: 4.5 },
  { time: "08:00", primary: 3.9, secondary: 3.1, danger: 4.5 },
  { time: "12:00", primary: 4.2, secondary: 3.5, danger: 4.5 },
  { time: "16:00", primary: 4.4, secondary: 3.8, danger: 4.5 },
];

const LAND_USE_DATA = [
  { name: "Impervious Paved Surfaces", pct: 72, color: "#f43f5e" },
  { name: "High-Density Built-up", pct: 68, color: "#f97316" },
  { name: "Urban Open Land", pct: 15, color: "#eab308" },
  { name: "Natural Vegetation / Canopy", pct: 12, color: "#10b981" },
  { name: "Riparian Water Bodies", pct: 5, color: "#06b6d4" },
];

export function EnvironmentalExplorer({
  dataPoints,
  summaries,
  selectedRegion = "Metropolitan Area",
}: EnvironmentalExplorerProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredPoints = selectedFilter === "all"
    ? dataPoints
    : dataPoints.filter((pt) => pt.variable === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>Real-time Environmental Telemetry Stream</span>
        </div>
        <h1 className="text-base font-semibold text-slate-100">
          {selectedRegion}: Climate Observation & Sensor Telemetry
        </h1>
        <p className="text-slate-400 text-xs mt-1 max-w-3xl">
          Fused stream of rain gauges, river stage transducers, ambient temperature monitors, and satellite land-use indexes loaded live via the Express backend from PostGIS.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Peak 24h Precipitation</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">145.7 mm</div>
          <div className="text-[11px] text-rose-400 mt-1">Recorded at Northern Catchment Gauge (+124% normal)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Primary River Stage</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">4.40 m</div>
          <div className="text-[11px] text-amber-300 mt-1">Danger Mark: 4.50 m (10 cm headroom)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Impervious Surface Ratio</span>
            <span className="text-xs text-rose-400 font-mono">72.0%</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">72.0%</div>
          <div className="text-[11px] text-slate-400 mt-1">Accelerates runoff 3.8x vs sponge basin</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Peak Surface Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">37.4 °C</div>
          <div className="text-[11px] text-slate-400 mt-1">Industrial MIDC Hub (Urban Heat Island)</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Comparison Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-200">Precipitation by Station (mm/day)</h2>
            <span className="text-[11px] text-blue-400 font-mono">Actual vs Seasonal Mean</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RAINFALL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "0.375rem", fontSize: "11px" }}
                />
                <Bar dataKey="rainfall" name="Recorded (mm)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="normal" name="Seasonal Baseline (mm)" fill="#334155" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* River Hydrologic Stage */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-200">River Stage Levels (24h Trend)</h2>
            <span className="text-[11px] text-amber-400 font-mono">Primary vs Secondary Confluence</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RIVER_LEVEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[1.5, 5]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "0.375rem", fontSize: "11px" }}
                />
                <Line type="monotone" dataKey="primary" name="Primary Catchment River" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="secondary" name="Secondary Confluence" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="danger" name="Critical Danger Level" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Data Points Table from Express */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xs font-semibold text-slate-200">
            Active Telemetry Feed ({filteredPoints.length} Data Points via Express)
          </h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter Variable:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Variables</option>
              <option value="rainfall">Rainfall</option>
              <option value="water_level">Water Level</option>
              <option value="air_quality">Air Quality</option>
              <option value="surface_temperature">Surface Temperature</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="px-4 py-3">Station / Sensor Source</th>
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredPoints.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-100">{pt.source}</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400 capitalize">{pt.variable.replace("_", " ")}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-100">
                    {pt.value} {pt.unit}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">
                    {pt.location?.coordinates
                      ? `${pt.location.coordinates[1].toFixed(4)}°N, ${pt.location.coordinates[0].toFixed(4)}°E`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                    {new Date(pt.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
