"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, CornerDownLeft, Copy, Check, RefreshCw, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { climateApi } from "../lib/api";
import type { ChatMessage } from "../lib/types";

interface OfficialChatProps {
  selectedRegion: string;
  onNavigateToTab?: (tab: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: `### 🏛️ Municipal Climate Decision Assistant

Welcome. I am ready to evaluate climate interventions, cross-hazard trade-offs, and fiscal allocations for your municipality.

**Common Official Queries:**
- Compare flood containment and aquifer recharge between Option A (Heavy Drainage) and Option D (Integrated Sponge City).
- Draft a formal resolution note for the Municipal Council for a Rs. 35 Crore resilience package.
- What environmental master plans and GeoJSON datasets are currently indexed in our repository?
- Evaluate the cost-benefit trade-offs of roadside bioswales vs deep concrete storm sewers.

Select a prompt below or type your municipal planning query to begin.`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suggestedFollowups: [
      "Compare Heavy Drainage vs Sponge City",
      "Draft an official resolution note for the Commissioner",
      "What files are indexed in our municipal repository?",
    ],
  },
];

export function OfficialChat({ selectedRegion, onNavigateToTab }: OfficialChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [budgetCr, setBudgetCr] = useState<number>(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await climateApi.sendChatMessage(
        query,
        historyPayload,
        selectedRegion,
        budgetCr,
        ["flood", "groundwater", "heat", "cost"]
      );

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: res.data?.reply || res.reply || "Analysis completed based on municipal environmental baseline.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowups: res.data?.suggestedFollowups || res.suggestedFollowups || [],
        metrics: res.data?.metrics || res.metrics,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Unable to complete query via Express backend: ${err.message}. Please check if the API Gateway is online.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[750px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Chat Header with Real Configuration Controls */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>Decision Intelligence Planning Assistant</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
              Active: {selectedRegion}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scenario reasoning, trade-off evaluation & council briefing generator
          </p>
        </div>

        {/* Real Budget Adjustment Input */}
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          <label className="text-xs text-slate-400 whitespace-nowrap">Planning Budget:</label>
          <input
            type="number"
            min={5}
            max={500}
            value={budgetCr}
            onChange={(e) => setBudgetCr(Number(e.target.value) || 50)}
            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-emerald-400 font-mono text-right"
          />
          <span className="text-xs text-slate-400 font-medium">Cr (INR)</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-4xl mx-auto`}
            >
              <div className="flex items-center space-x-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {isUser ? "Municipal Official" : "Climate Intelligence Engine"}
                </span>
                <span className="text-[10px] text-slate-500">{m.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-lg text-xs leading-relaxed max-w-3xl ${
                  isUser
                    ? "bg-emerald-950/40 text-emerald-100 border border-emerald-800/60"
                    : "bg-slate-950 text-slate-200 border border-slate-800"
                }`}
              >
                {/* Message Body formatting */}
                {isUser ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {m.content}
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed font-sans space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-sm font-bold text-slate-100 mt-2 mb-1 pb-1 border-b border-slate-800">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold text-slate-100 mt-2 mb-1">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-emerald-400 mt-2 mb-1 flex items-center gap-1.5">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-[11px] font-semibold text-slate-200 mt-1.5 mb-1">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed text-slate-200 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-100">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-4 space-y-1 mb-2 text-slate-300">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-4 space-y-1 mb-2 text-slate-300">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">
                            {children}
                          </li>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2.5 rounded border border-slate-800">
                            <table className="w-full text-left text-[11px] border-collapse">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-slate-900/40 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-3 py-1.5 font-semibold text-slate-200 text-[10px] tracking-wide uppercase">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3 py-1.5 text-slate-300 text-[11px]">
                            {children}
                          </td>
                        ),
                        hr: () => (
                          <hr className="border-slate-800 my-2.5" />
                        ),
                        code: ({ children }) => (
                          <code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded font-mono text-[10px]">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Optional Metric Summary Card */}
                {m.metrics && (
                  <div className="mt-3 p-2.5 rounded bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Option A Capex</span>
                      <strong className="text-xs text-slate-200">{m.metrics.optionA_cost}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Option D Capex</span>
                      <strong className="text-xs text-emerald-400">{m.metrics.optionD_cost}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Groundwater Delta</span>
                      <strong className="text-xs text-cyan-400">{m.metrics.optionD_gw}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Municipal Savings</span>
                      <strong className="text-xs text-emerald-400">{m.metrics.savings}</strong>
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && !isUser && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                      Recommended Follow-up Queries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedFollowups.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(f)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700 transition-colors text-left"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="flex items-center space-x-1 hover:text-slate-200"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Brief</span>
                        </>
                      )}
                    </button>
                    {onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab("simulator")}
                        className="hover:text-emerald-400 underline"
                      >
                        Adjust in Simulator →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Consulting climate models via Express Gateway...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a climate scenario question for ${selectedRegion} (e.g., "Compare Option A vs D under Rs. ${budgetCr} Cr budget")...`}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold rounded-md text-xs flex items-center space-x-1 transition-colors"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
