"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  onClick?: () => void;
}

export function FeatureCard({ icon, title, description, iconColor, onClick }: FeatureCardProps) {
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "bg-[#0f1122]/40 border border-white/5 shadow-xl backdrop-blur-md rounded-xl p-6 transition-all duration-300 group select-none",
        isClickable 
          ? "cursor-pointer hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50" 
          : "cursor-default"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner", 
        iconColor
      )}>
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-200 mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-gray-400 leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}
