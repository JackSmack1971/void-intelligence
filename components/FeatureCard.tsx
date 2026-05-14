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
}

export function FeatureCard({ icon, title, description, iconColor }: FeatureCardProps) {
  return (
    <div className="glass rounded-lg p-6 hover-lift cursor-pointer group border-border-glass">
      <div className={cn("w-12 h-12 rounded-md flex items-center justify-center mb-4 transition-colors", iconColor)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
