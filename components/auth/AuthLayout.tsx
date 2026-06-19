"use client";

import React from "react";
import { AuthBackground } from "./AuthBackground";
import { AuthHero } from "./AuthHero";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex bg-[#050816] overflow-hidden">
      {/* 1. Global Background */}
      <AuthBackground />

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]">
        
        {/* Left Column: Hero (Desktop Only) */}
        <div className="hidden lg:flex flex-col flex-1 p-12 xl:p-20 relative h-full">
          <AuthHero />
        </div>

        {/* Right Column: Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-start p-6 sm:p-12 lg:p-16 h-[calc(100vh-64px)] overflow-y-auto w-full max-w-2xl mx-auto lg:max-w-none no-scrollbar py-12">
          <div className="w-full max-w-[440px] relative z-10 perspective-[1000px] my-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
