"use client";

import React from "react";
import { MessageSquare, LayoutGrid, Settings, History, Plus, LayoutDashboard, Download, Upload, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import models from "../config/models.json";
import SkillTree from "./SkillTree";
import { ModelCard } from "../lib/goa/types";

interface SidebarProps {
  onExport: () => void;
  onImport: () => void;
}

export function Sidebar({ onExport, onImport }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (fn: () => void) => {
    fn();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-md bg-gray-900 border border-gray-700 md:hidden shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        "fixed left-0 top-0 h-full w-[260px] bg-surface-01 border-r border-border-subtle flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gradient tracking-tight">
              Void Intelligence
            </h1>
          </div>

          <button className="flex items-center gap-3 w-full p-3 rounded-md bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:brightness-110 transition-all mb-8">
            <Plus size={20} />
            <span>New Chat</span>
          </button>

          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
            <NavItem icon={<MessageSquare size={20} />} label="Conversations" active />
            <NavItem icon={<LayoutGrid size={20} />} label="Capabilities" />
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <SkillTree models={models as ModelCard[]} />
            </div>

            <NavItem icon={<History size={20} />} label="History" />
          </nav>

          <div className="pt-6 border-t border-border-subtle bg-surface-01">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => handleAction(onExport)}
                className="flex items-center justify-center gap-2 p-2 rounded bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors text-xs"
              >
                <Download size={14} /> Export
              </button>
              <button 
                onClick={() => handleAction(onImport)}
                className="flex items-center justify-center gap-2 p-2 rounded bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors text-xs"
              >
                <Upload size={14} /> Import
              </button>
            </div>
            
            <NavItem icon={<Settings size={20} />} label="Settings" />
            
            <div className="space-y-1 mb-4 mt-4">
              <button className="w-full flex items-center justify-between p-2 rounded-md bg-gray-800/50 text-gray-200 border border-gray-700/50 hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Knowledge Graph</span>
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-surface-02 border border-border-subtle" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">User Session</p>
                <p className="text-xs text-text-muted truncate">Local Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden cursor-pointer pointer-events-auto"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all hover:bg-accent-blue/10 hover:text-accent-blue-light",
        active ? "bg-surface-02 text-accent-blue-light" : "text-text-primary"
      )}
    >
      {icon}
      <span className="text-md font-medium tracking-wide">{label}</span>
    </div>
  );
}
