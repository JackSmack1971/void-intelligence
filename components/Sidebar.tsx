"use client";

import React from "react";
import { MessageSquare, LayoutGrid, Settings, History, Plus, LayoutDashboard } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-01 border-r border-border-subtle flex flex-col z-50 transition-transform duration-300 -translate-x-full md:translate-x-0">
      <div className="p-6 flex flex-col h-full">
        {/* Brand Wordmark */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gradient tracking-tight">
            Void Intelligence
          </h1>
        </div>

        {/* Action Button */}
        <button className="flex items-center gap-3 w-full p-3 rounded-md bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:brightness-110 transition-all mb-8">
          <Plus size={20} />
          <span>New Chat</span>
        </button>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          <NavItem icon={<MessageSquare size={20} />} label="Conversations" active />
          <NavItem icon={<LayoutGrid size={20} />} label="Capabilities" />
          <NavItem icon={<History size={20} />} label="History" />
        </nav>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-border-subtle">
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
