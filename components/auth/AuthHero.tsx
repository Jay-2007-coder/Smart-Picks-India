"use client";

import React from "react";
import { Zap, Brain, GraduationCap, Tag, ShieldCheck } from "lucide-react";
import Typewriter from "typewriter-effect";

const features = [
  { icon: Zap, title: "Price Drop Tracker", description: "Real-time Amazon price history & instant deal notifications." },
  { icon: Brain, title: "AI Product Finder", description: "Personalized recommendation engine matching your budget." },
  { icon: GraduationCap, title: "Student Hub", description: "CGPA calculators, resume analyzers, and DSA prep roadmaps." },
  { icon: Tag, title: "Verified Deals", description: "Community-voted discounts and daily lightning sales." },
];

export function AuthHero() {
  return (
    <div className="relative z-10 hidden lg:flex flex-col justify-between h-full max-w-md mx-auto py-12 text-foreground">
      {/* Brand Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground mb-8">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
          Enterprise Budget Intelligence Platform
        </div>

        {/* Dynamic Typewriter Headline */}
        <div className="mb-4 min-h-[100px] flex items-center">
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-foreground">
            <Typewriter
              options={{
                strings: [
                  'Save Smarter.',
                  'Study Better.',
                  'Shop Faster.'
                ],
                autoStart: true,
                loop: true,
                delay: 55,
                deleteSpeed: 30,
              }}
            />
          </h1>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-10">
          Join thousands of Indian students and smart shoppers tracking daily Amazon price drops, AI recommendations, and academic tools.
        </p>

        {/* Minimal Feature Grid */}
        <div className="space-y-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card hover:border-gray-300 dark:hover:border-border transition-all shadow-sm"
              >
                <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground leading-snug">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-normal mt-0.5">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer copyright note */}
      <div className="text-xs text-muted-foreground pt-8 border-t border-border">
        &copy; {new Date().getFullYear()} SmartPicks India. All rights reserved.
      </div>
    </div>
  );
}
