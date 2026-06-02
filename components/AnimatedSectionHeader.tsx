"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionHeaderProps {
  eyebrow?: ReactNode;
  eyebrowClass?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  centered?: boolean;
}

export default function AnimatedSectionHeader({
  eyebrow,
  eyebrowClass,
  title,
  subtitle,
  action,
  centered = false,
}: AnimatedSectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 flex-wrap", centered && "justify-center text-center flex-col items-center")}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
      >
        {eyebrow && (
          <div className={cn("flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest mb-2", eyebrowClass)}>
            {eyebrow}
          </div>
        )}
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="section-subtitle mt-1">{subtitle}</p>
        )}
      </motion.div>
      {action && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
