"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Code, BarChart3, Bot, ChevronRight, Activity, Eye, EyeOff } from "lucide-react";
import DebateGraph from "@/components/DebateGraph";
import StrategyDashboard from "@/components/StrategyDashboard";
import { processChat, processIntervention, syncKg, getTripletsForExport, importSelectedTriplets } from "./actions";
import ChatInput from "@/components/ChatInput";
import { FeatureCard } from "@/components/FeatureCard";
import { Sidebar } from "@/components/Sidebar";
import { useSharedWorker } from "@/hooks/useSharedWorker";
import { LocalPersistence } from "@/lib/kg/idb";
import { SyncService } from "@/lib/kg/sync";
import MergePreview from "@/components/MergePreview";
import KnowledgeGraph from "@/components/KnowledgeGraph";

interface Message {
  role: "user" | "assistant";
  content: string;
  metrics?: any;
  debateLog?: any[];
  showDebate?: boolean;
  selectedAgents?: any[];
  matrix?: any;
  complexity?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const extractionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mergeData, setMergeData] = useState<{ newItems: any[], overlaps: any[] } | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [graphTriplets, setGraphTriplets] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "graph") {
      syncKg().then(res => {
        if (res.success && res.data) {
          setGraphTriplets(res.data);
        }
      });
    }
  }, [activeTab]);

  const handleExport = async () => {
    const pass = prompt("Enter passphrase to encrypt the intelligence trail:");
    if (!pass) return;

    const res = await getTripletsForExport();
    if (res.success && res.data) {
      const encrypted = await SyncService.exportTrail(res.data, pass);
      const blob = new Blob([encrypted], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trail-${Date.now()}.void`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".void";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const pass = prompt("Enter passphrase to decrypt the intelligence trail:");
      if (!pass) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const encrypted = event.target?.result as string;
          const payload = await SyncService.decryptTrail(encrypted, pass);
          
          const existingRes = await syncKg();
          if (existingRes.success) {
            const { newItems, overlaps } = await SyncService.diffTriplets(payload.triplets, existingRes.data || []);
            setMergeData({ newItems, overlaps });
          }
        } catch (err) {
          alert("Decryption failed. Incorrect passphrase or corrupted file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const confirmMerge = async (selected: any[]) => {
    const res = await importSelectedTriplets(selected);
    if (res.success) {
      setMergeData(null);
      notifyUpdate();
      alert(`Successfully merged ${selected.length} new relations.`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStatus]);

  const { notifyUpdate } = useSharedWorker((data) => {
    if (data.type === "REFRESH_REQUIRED") {
      console.log("[Sync] Intelligence Harmony: Refreshing cross-tab state...");
    }
  });

  const handleSend = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentStatus("Initializing Graph-of-Agents...");

    try {
      const result = await processChat(query);
      
      if (result.success && result.data) {
        const assistantMessage: Message = { 
          role: "assistant", 
          content: result.data.finalResponse,
          metrics: result.data.metrics,
          debateLog: result.data.debateLog,
          selectedAgents: result.data.selectedAgents,
          matrix: result.data.matrix,
          complexity: result.data.complexity,
          showDebate: false
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Notify other tabs and persist locally
        notifyUpdate();
        syncKg().then(res => {
          if (res.success && res.data) {
            LocalPersistence.getInstance().saveTriplets(res.data);
          }
        });
        
        setIsExtracting(true);
        if (extractionTimerRef.current) clearTimeout(extractionTimerRef.current);
        extractionTimerRef.current = setTimeout(() => {
          setIsExtracting(false);
        }, 6000);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Error: ${result.error || "Failed to process request"}` 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "An unexpected error occurred. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
      setCurrentStatus("");
    }
  };

  const handleIntervene = async (msgIdx: number, modelId: string, type: 'critique' | 'redirect') => {
    const msg = messages[msgIdx];
    if (!msg.debateLog || !msg.selectedAgents || !msg.matrix) return;

    let interventionText = "";
    if (type === 'critique') {
      interventionText = window.prompt(`Enter manual critique for ${modelId}:`) || "";
      if (!interventionText) return;
    } else {
      alert("Redirecting to heavy-tier model for next round...");
      interventionText = "[REDIRECT] Escalate to judge tier.";
    }

    const lastTurn = Math.max(...msg.debateLog.map(l => l.turn));
    const newEntry = { 
      turn: lastTurn + 1, 
      model: modelId, 
      content: `[USER INTERVENTION]: ${interventionText}` 
    };

    setIsLoading(true);
    setCurrentStatus(`Injecting intervention into ${modelId}...`);

    try {
      const result = await processIntervention(
        messages[msgIdx - 1].content, // original query
        [...msg.debateLog, newEntry],
        msg.selectedAgents,
        msg.matrix
      );

      if (result.success && result.data) {
        const assistantMessage: Message = { 
          role: "assistant", 
          content: result.data.finalResponse,
          metrics: result.data.metrics,
          debateLog: result.data.debateLog,
          selectedAgents: result.data.selectedAgents,
          matrix: result.data.matrix,
          complexity: result.data.complexity,
          showDebate: true
        };
        setMessages(prev => {
          const next = [...prev];
          next[msgIdx] = assistantMessage;
          return next;
        });
      }
    } catch (error) {
      console.error("Intervention failed", error);
    } finally {
      setIsLoading(false);
      setCurrentStatus("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar 
        onExport={handleExport} 
        onImport={handleImport} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative md:ml-[260px]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {activeTab === "graph" ? (
        <div className="flex-1 p-6 relative z-10 animate-in fade-in duration-300 min-h-0">
          <KnowledgeGraph initialTriplets={graphTriplets} />
        </div>
      ) : activeTab === "capabilities" ? (
        <div className="flex-1 overflow-y-auto px-6 py-12 max-w-4xl mx-auto w-full relative z-10 animate-in fade-in duration-300">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#DB2777]">
            System Capabilities
          </h2>
          <p className="text-gray-400 text-md mb-8">
            Manage, configure, and inspect the operational characteristics of the Void Graph-of-Agents architecture.
          </p>
          <StrategyDashboard complexity="HIGH" harmonyScore={0.88} iterations={4} k={3} />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#6D28D9] to-[#DB2777]">
                  Void Intelligence
                </h1>
                <p className="text-gray-400 text-lg mb-12">
                  Your private intelligence graph in absolute darkness.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <FeatureCard
                    icon={<MessageSquare className="w-5 h-5 text-blue-400" />}
                    title="Adaptive Reasoning"
                    description="GoA architecture scales logic based on query complexity."
                    iconColor="bg-blue-500/10"
                  />
                  <FeatureCard
                    icon={<Sparkles className="w-5 h-5 text-purple-400" />}
                    title="Knowledge Graph"
                    description="Every conversation builds your personal intelligence store."
                    iconColor="bg-purple-500/10"
                  />
                  <FeatureCard
                    icon={<Code className="w-5 h-5 text-pink-400" />}
                    title="Zero-Cost Logic"
                    description="Powered by the elite OpenRouter free-tier ecosystem."
                    iconColor="bg-pink-500/10"
                  />
                  <FeatureCard
                    icon={<BarChart3 className="w-5 h-5 text-green-400" />}
                    title="Privacy First"
                    description="Local-first storage with client-side PII redaction."
                    iconColor="bg-green-500/10"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`
                      max-w-[85%] px-5 py-3 rounded-md text-sm leading-relaxed relative group
                      ${msg.role === "user" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-800/50 backdrop-blur-md border border-gray-700/50 text-gray-200"
                      }
                    `}>
                      {msg.content}
                      
                      {msg.role === "assistant" && msg.metrics && (
                        <>
                          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <BarChart3 className="w-3 h-3 mr-1 text-blue-400" />
                                Stability: {((1 - msg.metrics.ksStatistic) * 100).toFixed(0)}%
                              </span>
                              <span className="flex items-center">
                                <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                                Harmony: {((msg.metrics.harmonyScore || 0) * 100).toFixed(0)}%
                              </span>
                              <span className="flex items-center">
                                <ChevronRight className="w-3 h-3 mr-1 text-pink-400" />
                                Turns: {msg.metrics.iterations}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => {
                                const newMessages = [...messages];
                                newMessages[i].showDebate = !newMessages[i].showDebate;
                                setMessages(newMessages);
                              }}
                              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                            >
                              {msg.showDebate ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {msg.showDebate ? "Hide Strategic Console" : "Open Strategic Console"}
                            </button>
                          </div>

                          {msg.showDebate && (
                            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                              <StrategyDashboard 
                                complexity={msg.complexity}
                                harmonyScore={msg.metrics.harmonyScore}
                                iterations={msg.metrics.iterations}
                                k={msg.selectedAgents?.length}
                              />
                              {msg.debateLog && (
                                <DebateGraph 
                                  debateLog={msg.debateLog} 
                                  onIntervene={(modelId, type) => handleIntervene(i, modelId, type)}
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-md p-4 flex items-center space-x-3 text-sm text-gray-400">
                      <div className="relative">
                        <Bot className="w-5 h-5 text-purple-500 animate-pulse" />
                        <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          {currentStatus}
                          <span className="ml-2 flex space-x-1">
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/50">
            <div className="max-w-4xl mx-auto">
                {isExtracting && (
                  <div className="flex items-center space-x-2 text-[10px] text-purple-400 animate-pulse uppercase tracking-[0.2em] font-bold bg-purple-500/5 px-4 py-1 rounded-full border border-purple-500/10 w-fit mx-auto mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Refining Void Topology & Synchronizing Intelligence...</span>
                  </div>
                )}
                <ChatInput onSend={handleSend} disabled={isLoading} />
              <p className="text-[10px] text-center text-gray-600 mt-2 uppercase tracking-widest font-medium">
                GoA v1.4 • Strategic Interception Active • Encrypted Trails Ready
              </p>
            </div>
          </div>
        </>
      )}
      </main>


      {mergeData && (
        <MergePreview 
          newItems={mergeData.newItems}
          overlaps={mergeData.overlaps}
          onConfirm={confirmMerge}
          onCancel={() => setMergeData(null)}
        />
      )}
    </div>
  );
}
