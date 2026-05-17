"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Code, BarChart3, Bot, ChevronRight, Activity, Eye, EyeOff, X } from "lucide-react";
import DebateGraph from "@/components/DebateGraph";
import StrategyDashboard from "@/components/StrategyDashboard";
import { processChat, processIntervention, syncKg, getTripletsForExport, importSelectedTripletsDelta } from "./actions";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
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
  const [mergeData, setMergeData] = useState<{ added: any[], modified: any[], overlaps: any[] } | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [graphTriplets, setGraphTriplets] = useState<any[]>([]);

  // Passphrase Overlay state
  const [passPrompt, setPassPrompt] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSubmit: (passphrase: string) => void;
  } | null>(null);
  
  // Notification toast state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
  }>>([]);

  const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (activeTab === "graph") {
      syncKg().then(res => {
        if (res.success && res.data) {
          setGraphTriplets(res.data);
        }
      });
    }
  }, [activeTab]);

  const handleExport = () => {
    setPassPrompt({
      isOpen: true,
      title: "Encrypt Trail Export",
      description: "Enter a secure passphrase to encrypt your knowledge graph intelligence trail:",
      onSubmit: async (pass) => {
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
          addNotification("Intelligence trail successfully encrypted and downloaded.", "success");
        } else {
          addNotification("Failed to fetch relations for export.", "error");
        }
      }
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".void";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setPassPrompt({
        isOpen: true,
        title: "Decrypt Ingestion Trail",
        description: "Enter the passphrase to decrypt and preview this intelligence trail:",
        onSubmit: async (pass) => {
          if (!pass) return;
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const encrypted = event.target?.result as string;
              const payload = await SyncService.decryptTrail(encrypted, pass);
              
              const existingRes = await syncKg();
              if (existingRes.success) {
                const { added, modified, overlaps } = await SyncService.diffTripletsDelta(payload.triplets, existingRes.data || []);
                setMergeData({ added, modified, overlaps });
                addNotification("Trail decrypted successfully. Previewing merge dataset.", "success");
              }
            } catch (err) {
              addNotification("Decryption failed. Incorrect passphrase or corrupted payload.", "error");
            }
          };
          reader.readAsText(file);
        }
      });
    };
    input.click();
  };

  const confirmMerge = async (addedSelected: any[], modifiedSelected: any[]) => {
    const res = await importSelectedTripletsDelta(addedSelected, modifiedSelected);
    if (res.success) {
      setMergeData(null);
      notifyUpdate();
      addNotification(`Successfully merged ${addedSelected.length + modifiedSelected.length} relations.`, "success");
    } else {
      addNotification("Merge operation failed.", "error");
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
      setPassPrompt({
        isOpen: true,
        title: "Submit Agent Critique",
        description: `Provide strategic feedback to adjust the operational course of ${modelId}:`,
        onSubmit: async (feedback) => {
          if (!feedback.trim()) return;
          await executeIntervene(msgIdx, modelId, feedback, msg);
        }
      });
      return;
    } else {
      addNotification("Escalating decision path to heavy-tier model...", "info");
      interventionText = "[REDIRECT] Escalate to judge tier.";
    }

    await executeIntervene(msgIdx, modelId, interventionText, msg);
  };

  const executeIntervene = async (msgIdx: number, modelId: string, text: string, msg: any) => {
    const lastTurn = Math.max(...msg.debateLog.map((l: any) => l.turn));
    const newEntry = { 
      turn: lastTurn + 1, 
      model: modelId, 
      content: `[USER INTERVENTION]: ${text}` 
    };

    setIsLoading(true);
    setCurrentStatus(`Injecting intervention into ${modelId}...`);

    try {
      const result = await processIntervention(
        messages[msgIdx - 1].content,
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
        addNotification("Intervention successfully synced and executed.", "success");
      }
    } catch (error) {
      addNotification("Intervention execution failed.", "error");
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
                    <ChatMessage
                      key={i}
                      message={msg}
                      index={i}
                      onToggleConsole={(idx) => {
                        const newMessages = [...messages];
                        newMessages[idx].showDebate = !newMessages[idx].showDebate;
                        setMessages(newMessages);
                      }}
                    >
                      <StrategyDashboard 
                        complexity={msg.complexity}
                        harmonyScore={msg.metrics?.harmonyScore}
                        iterations={msg.metrics?.iterations}
                        k={msg.selectedAgents?.length}
                      />
                      {msg.debateLog && (
                        <DebateGraph 
                          debateLog={msg.debateLog} 
                          onIntervene={(modelId, type) => handleIntervene(i, modelId, type)}
                        />
                      )}
                    </ChatMessage>
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
          added={mergeData.added}
          modified={mergeData.modified}
          overlaps={mergeData.overlaps}
          onConfirm={confirmMerge}
          onCancel={() => setMergeData(null)}
        />
      )}

      {/* Custom Passphrase Prompt Overlay Modal */}
      {passPrompt && passPrompt.isOpen && (
        <div 
          data-testid="custom-prompt-modal"
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="bg-gray-900 border border-gray-700/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white tracking-wide">{passPrompt.title}</h3>
              <button 
                onClick={() => setPassPrompt(null)} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{passPrompt.description}</p>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const val = data.get("passphrase") as string;
                if (val) {
                  passPrompt.onSubmit(val);
                  setPassPrompt(null);
                }
              }}
              className="space-y-4"
            >
              <input 
                type="password"
                name="passphrase"
                required
                autoFocus
                placeholder="Enter secure passphrase..."
                className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setPassPrompt(null)}
                  className="flex-1 py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Notification Toast System */}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map(n => (
          <div 
            key={n.id}
            data-testid="notification-toast"
            className={`p-4 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto ${
              n.type === "success" 
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : n.type === "error"
                ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                : "bg-gray-900/80 border-gray-800 text-gray-300"
            }`}
          >
            <div className="flex-1 text-xs font-medium tracking-wide">
              {n.message}
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
