"use client";

import React, { useState } from "react";
import { CloudRain, Droplets, Thermometer, Database } from "lucide-react";
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
      <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Real-time Environmental Telemetry Stream</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-notion-text">
          {selectedRegion}: Climate Observation & Sensor Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-notion-secondary mt-1 max-w-3xl leading-relaxed">
          Fused stream of rain gauges, river stage transducers, ambient temperature monitors, and satellite land-use indexes loaded live via the Express backend from PostGIS.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-notion-secondary mb-2">
            <span className="text-xs sm:text-sm font-semibold text-notion-text">Peak 24h Precipitation</span>
            <CloudRain className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-notion-text font-mono">145.7 mm</div>
          <div className="text-xs text-rose-500 mt-1.5 font-medium">Recorded at Northern Catchment Gauge (+124% normal)</div>
        </div>

        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-notion-secondary mb-2">
            <span className="text-xs sm:text-sm font-semibold text-notion-text">Primary River Stage</span>
            <Droplets className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-500 font-mono">4.40 m</div>
          <div className="text-xs text-amber-500 mt-1.5 font-medium">Danger Mark: 4.50 m (10 cm headroom)</div>
        </div>

        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-notion-secondary mb-2">
            <span className="text-xs sm:text-sm font-semibold text-notion-text">Impervious Surface Ratio</span>
            <span className="text-xs font-mono font-bold text-rose-500">72.0%</span>
          </div>
          <div className="text-3xl font-extrabold text-notion-text font-mono">72.0%</div>
          <div className="text-xs text-notion-secondary mt-1.5 font-medium">Accelerates runoff 3.8x vs sponge basin</div>
        </div>

        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-notion-secondary mb-2">
            <span className="text-xs sm:text-sm font-semibold text-notion-text">Peak Surface Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-500 font-mono">37.4 °C</div>
          <div className="text-xs text-notion-secondary mt-1.5 font-medium">Industrial MIDC Hub (Urban Heat Island)</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Comparison Chart */}
        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-notion-text">Precipitation by Station (mm/day)</h2>
            <span className="text-xs text-blue-500 font-mono font-medium">Actual vs Seasonal Mean</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RAINFALL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--notion-border)" />
                <XAxis dataKey="station" stroke="var(--notion-secondary)" fontSize={12} />
                <YAxis stroke="var(--notion-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--notion-bg)", borderColor: "var(--notion-border)", borderRadius: "0.5rem", fontSize: "12px", color: "var(--notion-text)" }}
                />
                <Bar dataKey="rainfall" name="Recorded (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="normal" name="Seasonal Baseline (mm)" fill="var(--notion-border)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* River Hydrologic Stage */}
        <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-notion-text">River Stage Levels (24h Trend)</h2>
            <span className="text-xs text-amber-500 font-mono font-medium">Primary vs Secondary Confluence</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RIVER_LEVEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--notion-border)" />
                <XAxis dataKey="time" stroke="var(--notion-secondary)" fontSize={12} />
                <YAxis domain={[1.5, 5]} stroke="var(--notion-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--notion-bg)", borderColor: "var(--notion-border)", borderRadius: "0.5rem", fontSize: "12px", color: "var(--notion-text)" }}
                />
                <Line type="monotone" dataKey="primary" name="Primary Catchment River" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="secondary" name="Secondary Confluence" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="danger" name="Critical Danger Level" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Data Points Table from Express */}
      <div className="bg-notion-sidebar border border-notion-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 bg-notion-bg border-b border-notion-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm sm:text-base font-bold text-notion-text">
            Active Telemetry Feed ({filteredPoints.length} Data Points via Express)
          </h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-notion-secondary text-xs sm:text-sm font-medium">Filter by Variable:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-notion-sidebar border border-notion-border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-notion-text focus:outline-none cursor-pointer"
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
          <table className="w-full text-left text-sm">
            <thead className="bg-notion-bg text-notion-secondary uppercase text-xs tracking-wider border-b border-notion-border font-semibold">
              <tr>
                <th className="px-5 py-3.5">Station / Sensor Source</th>
                <th className="px-5 py-3.5">Variable</th>
                <th className="px-5 py-3.5">Value</th>
                <th className="px-5 py-3.5">Coordinates</th>
                <th className="px-5 py-3.5">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border text-notion-text">
              {filteredPoints.map((pt) => (
                <tr key={pt.id} className="hover:bg-notion-hover/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-notion-text">{pt.source}</td>
                  <td className="px-5 py-3 font-mono text-emerald-500 capitalize">{pt.variable.replace("_", " ")}</td>
                  <td className="px-5 py-3 font-mono font-bold text-notion-text">
                    {pt.value} {pt.unit}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-notion-secondary">
                    {pt.location?.coordinates
                      ? `${pt.location.coordinates[1].toFixed(4)}°N, ${pt.location.coordinates[0].toFixed(4)}°E`
                      : "N/A"}
                  </td>
                  <td className="px-5 py-3 text-notion-secondary font-mono text-xs">
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
