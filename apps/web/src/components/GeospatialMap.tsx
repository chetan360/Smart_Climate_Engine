"use client";

import React, { useState } from "react";
import { Layers, MapPin, Droplets, Thermometer, ShieldAlert, CheckCircle, Info, Eye } from "lucide-react";
import type { EnvironmentalDataPoint } from "../lib/types";

interface GeospatialMapProps {
  dataPoints: EnvironmentalDataPoint[];
}

interface MapStation {
  id: string;
  name: string;
  type: "rainfall" | "water_level" | "air_quality" | "surface_temp" | "intervention";
  x: number; // percentage
  y: number; // percentage
  value: string;
  status: "safe" | "warning" | "alert" | "active";
  description: string;
}

const STATIONS: MapStation[] = [
  { id: "s1", name: "PCCOE Akurdi Campus Station", type: "rainfall", x: 28, y: 32, value: "145.7 mm/day", status: "alert", description: "Extreme precipitation recorded. High local runoff near Akurdi railway culverts." },
  { id: "s2", name: "PCMC Nigdi Station", type: "rainfall", x: 38, y: 22, value: "125.0 mm/day", status: "alert", description: "Stormwater flow exceedance. Drainage capacity at 88% saturation." },
  { id: "s3", name: "Pavana River Dapodi Gauge", type: "water_level", x: 46, y: 44, value: "4.4 m (Danger: 4.5m)", status: "warning", description: "River cresting near critical warning threshold. Backwater pooling in low lying settlements." },
  { id: "s4", name: "Mula River Sangvi Station", type: "water_level", x: 42, y: 52, value: "3.8 meters", status: "safe", description: "Elevated river stage. Upstream reservoir discharge monitoring in effect." },
  { id: "s5", name: "Hinjawadi IT Corridor", type: "rainfall", x: 18, y: 56, value: "96.2 mm/day", status: "warning", description: "High impervious surface coverage (76%). Rapid sheet runoff onto arterial roads." },
  { id: "s6", name: "Shivajinagar Urban Core", type: "rainfall", x: 55, y: 65, value: "82.5 mm/day", status: "safe", description: "Dense municipal drainage network. Moderate localized water accumulation." },
  { id: "s7", name: "Bhosari MIDC Industrial Zone", type: "surface_temp", x: 62, y: 30, value: "37.4 °C (Urban Heat)", status: "warning", description: "Severe urban heat island effect due to heavy roofing and asphalt." },
  { id: "s8", name: "Pune University Green Sanctuary", type: "surface_temp", x: 46, y: 62, value: "31.2 °C", status: "safe", description: "Vegetative cooling effect lowers ambient temperatures by ~5.6°C." },
  { id: "s9", name: "Option D: Pavana Wetland Buffer", type: "intervention", x: 40, y: 40, value: "Restoration Active", status: "active", description: "Proposed 22-hectare wetland sponge zone to absorb 1.4 million m³ excess runoff." },
  { id: "s10", name: "Option D: Akurdi Permeable Corridor", type: "intervention", x: 30, y: 38, value: "Pervious Bioswale", status: "active", description: "Infiltration corridor filtering runoff into deeper unconfined Deccan basalt aquifer." },
];

export function GeospatialMap({ dataPoints }: GeospatialMapProps) {
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    rivers: true,
    heat: true,
    interventions: true,
  });

  const [selectedStation, setSelectedStation] = useState<MapStation | null>(STATIONS[0]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>PostGIS Geospatial Decision Mapping</span>
          </div>
          <h2 className="text-xl font-bold text-white">Pune & PCMC Climate Risk & Intervention GIS Layer</h2>
          <p className="text-slate-300 text-xs mt-1">
            Spatial correlation of real-time sensor stations, river level telemetry, flood risk polygons, and Option D nature-based intervention corridors.
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => toggleLayer("flood")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              activeLayers.flood
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-slate-900 text-slate-500 border-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flood Inundation Zones</span>
          </button>

          <button
            onClick={() => toggleLayer("rivers")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              activeLayers.rivers
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900 text-slate-500 border-white/5"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>River Sensors & Gauges</span>
          </button>

          <button
            onClick={() => toggleLayer("heat")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              activeLayers.heat
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900 text-slate-500 border-white/5"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Urban Heat Corridors</span>
          </button>

          <button
            onClick={() => toggleLayer("interventions")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              activeLayers.interventions
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-500 border-white/5"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Option D Interventions</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas + Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive SVG GIS Map Canvas */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-white/10 rounded-2xl p-4 relative min-h-[500px] overflow-hidden flex items-center justify-center">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* SVG Cartographic Layer */}
          <svg className="w-full h-full min-h-[480px] absolute inset-0 pointer-events-none" viewBox="0 0 1000 650">
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <radialGradient id="floodGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="wetlandZone" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Pavana & Mula River Path */}
            <path
              d="M 100 120 Q 250 180 380 230 T 480 320 T 560 420 T 700 500 T 920 540"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              className="opacity-75"
            />
            {/* Mutha River Confluence */}
            <path
              d="M 300 600 Q 420 520 560 420"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="9"
              strokeLinecap="round"
              className="opacity-60"
            />

            {/* Flood Inundation Hotspot Polygons */}
            {activeLayers.flood && (
              <>
                <circle cx="340" cy="240" r="75" fill="url(#floodGlow)" />
                <circle cx="470" cy="315" r="95" fill="url(#floodGlow)" />
                <circle cx="210" cy="380" r="65" fill="url(#floodGlow)" />
                <text x="360" y="220" fill="#f87171" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  HIGH INUNDATION RISK (Akurdi-Dapodi Corridor)
                </text>
              </>
            )}

            {/* Urban Heat Islands */}
            {activeLayers.heat && (
              <>
                <circle cx="680" cy="200" r="90" fill="url(#heatGlow)" />
                <circle cx="780" cy="340" r="80" fill="url(#heatGlow)" />
                <text x="660" y="190" fill="#fbbf24" fontSize="11" fontFamily="sans-serif">
                  Bhosari MIDC Heat Island (37.4°C)
                </text>
              </>
            )}

            {/* Option D Nature-Based Intervention Corridors */}
            {activeLayers.interventions && (
              <>
                <rect x="360" cy="235" width="130" height="75" rx="16" fill="url(#wetlandZone)" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
                <text x="375" y="275" fill="#34d399" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  Pavana Wetland Sponge Buffer
                </text>
                <line x1="260" y1="210" x2="340" y2="270" stroke="#34d399" strokeWidth="4" strokeDasharray="4 4" />
              </>
            )}
          </svg>

          {/* Interactive Marker Pins */}
          {STATIONS.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            let pinColor = "bg-cyan-500 text-slate-950";
            if (station.type === "rainfall") pinColor = "bg-blue-500 text-white";
            if (station.type === "surface_temp") pinColor = "bg-amber-500 text-slate-950";
            if (station.type === "intervention") pinColor = "bg-emerald-500 text-slate-950 ring-2 ring-emerald-300";

            return (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station)}
                style={{ left: `${station.x}%`, top: `${station.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group z-20 transition-all duration-300 ${
                  isSelected ? "scale-125 z-30" : "hover:scale-110"
                }`}
              >
                <div className={`p-1.5 rounded-full shadow-lg ${pinColor} flex items-center justify-center`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                {/* Micro Label on hover or selected */}
                <span className={`absolute left-1/2 -translate-x-1/2 -bottom-6 px-2 py-0.5 rounded bg-slate-900/90 border border-white/20 text-[10px] text-white whitespace-nowrap shadow-md pointer-events-none transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  {station.name.split(" ")[0]}
                </span>
              </button>
            );
          })}

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs backdrop-blur-md pointer-events-none">
            <div className="font-semibold text-white">Pune & PCMC Metropolitan Area</div>
            <div className="text-[11px] text-slate-400">Lat: 18.5204° N · Lon: 73.8567° E · PostGIS Spatial Index</div>
          </div>
        </div>

        {/* Selected Station / Zone Inspector */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          {selectedStation ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Station Telemetry Inspector</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{selectedStation.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full mt-1.5 inline-block bg-white/10 text-slate-300">
                  Type: {selectedStation.type.replace("_", " ")}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 space-y-2 text-xs">
                <div className="text-slate-400">Telemetry Reading:</div>
                <div className="text-lg font-bold text-emerald-400">{selectedStation.value}</div>
                <div className="flex items-center space-x-1.5 pt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    selectedStation.status === "alert" ? "bg-rose-500" : selectedStation.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <span className="text-slate-300 capitalize">{selectedStation.status} Operational Tier</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-white/5">
                {selectedStation.description}
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-12">
              Select any map marker to view localized sensor telemetry and intervention data.
            </div>
          )}

          <div className="text-[11px] text-slate-500 border-t border-white/5 pt-3">
            Source: PostGIS Geospatial Database · WGS84 EPSG:4326 Projection
          </div>
        </div>
      </div>
    </div>
  );
}
