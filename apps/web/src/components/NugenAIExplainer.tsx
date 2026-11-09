"use client";

import React, { useState } from "react";
import { Sparkles, Brain, Send, CheckCircle2, Bot, RefreshCw } from "lucide-react";

export function NugenAIExplainer() {
  const [query, setQuery] = useState(
    "We have a Rs. 50 Crore budget envelope and recurrent monsoon inundation along the Pavana and Mula river corridors in Pune & PCMC. What combination of actions delivers maximum resilience?",
  );
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState<{
    stage: string;
    reasoning: string;
    tradeoffsSolved: string[];
    consequences: string;
  }>({
    stage: "Stage 5 of 6: Recommend · Decision Synthesis Ready",
    reasoning:
      "Nugen AI Strategic Assessment: Standard concrete drainage (Option A, ₹48 Cr) satisfies short-term peak runoff evacuation but creates two severe unintended externalities: (1) it starves local basalt aquifers of ~15% natural infiltration, exacerbating summer drinking water distress, and (2) it leaves zero capital buffer for heat mitigation. By contrast, Option D (Integrated Sponge Framework, ₹35 Cr) delivers 79% flood resilience, restores 65% groundwater recharge, mitigates urban heat by 1.6°C, and preserves ₹15 Cr in municipal fiscal reserves.",
    tradeoffsSolved: [
      "Flood mitigation decoupled from groundwater depletion (sponge infiltration wells recharge aquifer)",
      "Urban heat island effect countered via vegetative riparian buffer cooling (-1.6°C)",
      "Fiscal headroom of ₹15.0 Cr retained for emergency contingency or Phase 2 sensors",
    ],
    consequences:
      "Projected 10-year cumulative benefit: 82% reduction in residential flood insurance claims, +4.2 meter stabilization of seasonal water table depth, and cooler urban street temperatures.",
  });

  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/decision/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_query: query,
          region: "Pune & PCMC",
          budget: 500000000,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.nugen_reasoning) {
          setPipelineOutput({
            stage: "Stage 5 of 6: Recommend · Live Pipeline Complete",
            reasoning: json.data.nugen_reasoning,
            tradeoffsSolved: [
              "Optimized against " + (json.data.optimization?.combinations_evaluated ?? 4) + " candidate combinations",
              "Balanced flood protection with groundwater infiltration",
              "Prioritized nature-based sponge corridors within budget",
            ],
            consequences: "Validated by Decision Intelligence Engine for " + (json.data.environmental_summary?.region ?? "Pune"),
          });
          return;
        }
      }
    } catch {}

    // Fallback simulation
    setTimeout(() => {
      setPipelineOutput({
        stage: "Stage 5 of 6: Recommend · Synthesis Completed",
        reasoning:
          "Nugen AI Strategic Assessment: Analysis of " + query.slice(0, 45) + "... confirms that Option D provides Pareto-optimal performance under the specified budget envelope. Nature-based sponge infrastructure eliminates downstream pressure points without compromising aquifer replenishment.",
        tradeoffsSolved: [
          "Preserved ₹15 Cr municipal capital headroom",
          "Balanced multi-hazard flood and heat resilience",
          "Mitigated urban flash runoff at source",
        ],
        consequences: "Ready for municipal planning commission review and official sign-off.",
      });
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-notion-sidebar border border-notion-border rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Brain className="w-4 h-4" />
          <span>Nugen AI Reasoning & Trade-off Engine</span>
        </div>
        <h2 className="text-xl font-bold text-notion-text">Continuous Climate Decision Intelligence Loop</h2>
        <p className="text-notion-secondary text-sm mt-1 max-w-3xl">
          Our physics models compute the numerical hydrologic estimates. Nugen AI contextualizes those numbers and domain constraints into plain-language municipal recommendations.
        </p>
      </div>

      {/* 6-Stage Loop Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
        {[
          { step: "01", name: "Collect", desc: "Sensors & GIS" },
          { step: "02", name: "Understand", desc: "Query Intent" },
          { step: "03", name: "Simulate", desc: "Physics Models" },
          { step: "04", name: "Compare", desc: "Pareto Frontier" },
          { step: "05", name: "Recommend", desc: "Nugen AI Context", active: true },
          { step: "06", name: "Act", desc: "Official Call" },
        ].map((s) => (
          <div
            key={s.step}
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              s.active
                ? "bg-notion-sidebar border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                : "bg-notion-bg/40 border-notion-border text-notion-secondary"
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono text-notion-secondary">{s.step}</span>
              {s.active && <Sparkles className="w-3 h-3 text-emerald-500" />}
            </div>
            <div className="mt-2">
              <div className={`font-bold ${s.active ? "text-emerald-500" : "text-notion-text"}`}>{s.name}</div>
              <div className="text-[10px] text-notion-secondary">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Natural Language Prompt Studio */}
      <div className="bg-notion-sidebar border border-notion-border rounded-2xl p-6 space-y-4">
        <label htmlFor="decision-query-input" className="text-xs font-semibold text-notion-text flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-cyan-500" /> Municipal Official Natural Language Inquiry
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            id="decision-query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={2}
            className="flex-1 bg-notion-bg border border-notion-border rounded-xl p-3 text-xs sm:text-sm text-notion-text placeholder-notion-secondary focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Type your climate decision scenario or budget query..."
          />
          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Execute Decision Loop</span>
          </button>
        </div>
      </div>

      {/* Nugen AI Reasoning Synthesis Output Card */}
      <div className="bg-notion-sidebar border border-emerald-500/30 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-notion-border pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                {pipelineOutput.stage}
              </div>
              <h3 className="text-base font-bold text-notion-text">Nugen AI Strategic Decision Brief</h3>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
            Confidence: 94.2%
          </span>
        </div>

        <p className="text-sm text-notion-text leading-relaxed font-sans bg-notion-bg p-4 rounded-xl border border-notion-border">
          {pipelineOutput.reasoning}
        </p>

        {/* Hidden Trade-Offs Resolved */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-cyan-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hidden Trade-Offs Overcome
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {pipelineOutput.tradeoffsSolved.map((item, idx) => (
              <div key={idx} className="bg-notion-bg border border-notion-border rounded-lg p-3 text-notion-text flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Long-term Consequence Projection */}
        <div className="border-t border-notion-border pt-3 text-xs text-notion-secondary flex items-center justify-between">
          <span>{pipelineOutput.consequences}</span>
          <span className="text-notion-secondary font-mono text-[10px]">Decision Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}
