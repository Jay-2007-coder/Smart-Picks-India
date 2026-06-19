"use client";

import React from "react";
import { AuthBackground } from "./AuthBackground";
import { AuthHero } from "./AuthHero";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex bg-[#050816] overflow-hidden">
      {/* 1. Global Background */}
      <AuthBackground />

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row h-screen">
        
        {/* Left Column: Hero (Desktop Only) */}
        <div className="hidden lg:flex flex-col flex-1 p-12 xl:p-20 relative">
          <AuthHero />
        </div>

        {/* Right Column: Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 h-full overflow-y-auto w-full max-w-2xl mx-auto lg:max-w-none no-scrollbar">
          <div className="w-full max-w-[440px] relative z-10 perspective-[1000px]">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
