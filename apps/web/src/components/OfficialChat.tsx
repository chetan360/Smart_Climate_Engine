"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, RefreshCw, MessageSquare, RotateCcw } from "lucide-react";
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

**Common Official Planning Queries:**
- Compare flood containment and aquifer recharge between Option A (Heavy Drainage) and Option D (Integrated Sponge City).
- Draft a formal resolution note for the Municipal Council for a Rs. 35 Crore resilience package.
- What environmental master plans and GeoJSON datasets are currently indexed in our repository?
- Evaluate the cost-benefit trade-offs of roadside bioswales vs deep concrete storm sewers.

Select a quick question below or type your inquiry in plain English to begin.`,
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
    <div className="flex flex-col h-[760px] bg-notion-sidebar border border-notion-border rounded-xl overflow-hidden shadow-md">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-notion-bg border-b border-notion-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-notion-text flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>AI Decision Planning Assistant</span>
            </h2>
            <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded bg-notion-sidebar text-notion-secondary border border-notion-border font-medium">
              {selectedRegion}
            </span>
          </div>
          <p className="text-sm text-notion-secondary mt-1">
            Ask climate scenario questions, compare intervention options, or draft executive council resolutions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Budget Adjustment Control */}
          <div className="flex items-center space-x-2 bg-notion-sidebar px-3 py-2 rounded-lg border border-notion-border">
            <label className="text-xs sm:text-sm text-notion-text font-medium whitespace-nowrap">
              Planning Budget:
            </label>
            <input
              type="number"
              min={5}
              max={500}
              value={budgetCr}
              onChange={(e) => setBudgetCr(Number(e.target.value) || 50)}
              className="w-20 bg-notion-bg border border-notion-border rounded px-2.5 py-1 text-sm sm:text-base text-emerald-500 font-mono font-bold text-right"
            />
            <span className="text-xs sm:text-sm text-notion-secondary font-medium">Cr (INR)</span>
          </div>

          {/* Reset Conversation Button */}
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            title="Reset to initial welcome message"
            className="flex items-center space-x-1.5 px-3 py-2 bg-notion-sidebar hover:bg-notion-hover border border-notion-border text-notion-secondary hover:text-notion-text rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-4xl mx-auto`}
            >
              <div className="flex items-center space-x-2 mb-1 px-1">
                <span className="text-xs font-semibold text-notion-secondary">
                  {isUser ? "Municipal Official" : "Climate Decision Engine"}
                </span>
                <span className="text-xs text-notion-secondary/70">{m.timestamp}</span>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-xl text-sm leading-relaxed max-w-3xl shadow-sm ${
                  isUser
                    ? "bg-emerald-500/15 text-notion-text border border-emerald-500/30"
                    : "bg-notion-bg text-notion-text border border-notion-border"
                }`}
              >
                {/* Message Body */}
                {isUser ? (
                  <div className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] leading-relaxed">
                    {m.content}
                  </div>
                ) : (
                  <div className="text-sm sm:text-[15px] leading-relaxed font-sans space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base sm:text-lg font-bold text-notion-text mt-3 mb-2 pb-1.5 border-b border-notion-border">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm sm:text-base font-bold text-notion-text mt-2.5 mb-1.5">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm sm:text-base font-bold text-emerald-500 mt-2.5 mb-1 flex items-center gap-1.5">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-xs sm:text-sm font-semibold text-notion-text mt-2 mb-1">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2.5 leading-relaxed text-notion-text last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-notion-text">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-5 space-y-1.5 mb-3 text-notion-text">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-5 space-y-1.5 mb-3 text-notion-text">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">
                            {children}
                          </li>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3 rounded-lg border border-notion-border">
                            <table className="w-full text-left text-xs sm:text-sm border-collapse">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-notion-sidebar text-notion-text border-b border-notion-border">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-notion-border bg-notion-bg">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-notion-hover/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-3.5 py-2 font-semibold text-notion-text text-xs uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3.5 py-2 text-notion-text text-xs sm:text-sm">
                            {children}
                          </td>
                        ),
                        hr: () => (
                          <hr className="border-notion-border my-3" />
                        ),
                        code: ({ children }) => (
                          <code className="bg-notion-hover text-emerald-500 px-1.5 py-0.5 rounded font-mono text-xs">
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
                  <div className="mt-4 p-3 rounded-lg bg-notion-sidebar border border-notion-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-xs text-notion-secondary block mb-0.5">Option A Capex</span>
                      <strong className="text-sm font-bold text-notion-text">{m.metrics.optionA_cost}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-notion-secondary block mb-0.5">Option D Capex</span>
                      <strong className="text-sm font-bold text-emerald-500">{m.metrics.optionD_cost}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-notion-secondary block mb-0.5">Groundwater Delta</span>
                      <strong className="text-sm font-bold text-cyan-500">{m.metrics.optionD_gw}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-notion-secondary block mb-0.5">Fiscal Savings</span>
                      <strong className="text-sm font-bold text-emerald-500">{m.metrics.savings}</strong>
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && !isUser && (
                  <div className="mt-4 pt-3.5 border-t border-notion-border">
                    <span className="text-xs font-semibold text-notion-secondary block mb-2">
                      Suggested Follow-up Questions:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.suggestedFollowups.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(f)}
                          className="px-3 py-1.5 rounded-lg bg-notion-sidebar hover:bg-notion-hover text-xs sm:text-sm text-notion-text border border-notion-border transition-colors text-left cursor-pointer"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-xs text-notion-secondary">
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="flex items-center space-x-1.5 hover:text-notion-text cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                    {onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab("simulator")}
                        className="hover:text-emerald-500 underline cursor-pointer"
                      >
                        Adjust in Scenario Simulator →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-notion-secondary p-3">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Consulting climate decision models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Quick Prompt Actions */}
      <div className="p-4 sm:p-5 bg-notion-bg border-t border-notion-border space-y-3">
        {/* Quick Suggestion Chips */}
        <div className="max-w-4xl mx-auto flex items-center space-x-2 overflow-x-auto pb-1 text-xs sm:text-sm">
          <span className="text-notion-secondary font-medium whitespace-nowrap">Suggested Prompts:</span>
          {[
            "Compare Heavy Drainage (Option A) vs Sponge City (Option D)",
            `Draft a council resolution for Rs. ${budgetCr} Cr climate package`,
            "What files and GIS layers are indexed in the repository?",
            "What is the aquifer recharge gain under Option D?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg bg-notion-sidebar hover:bg-notion-hover text-notion-text hover:text-emerald-500 border border-notion-border whitespace-nowrap transition-colors cursor-pointer text-xs sm:text-sm shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask any climate scenario question for ${selectedRegion} (or click a prompt above)...`}
            disabled={isLoading}
            className="flex-1 bg-notion-sidebar border border-notion-border rounded-lg px-4 py-3.5 text-base text-notion-text placeholder-notion-secondary focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-base flex items-center space-x-2 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
