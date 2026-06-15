"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/data/categories";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
          whileHover={{ y: -6 }}
        >
          <Link href={`/category/${cat.slug}`} className="group block h-full">
            <div className="card overflow-hidden text-center p-0 h-full hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 hover:border-brand-500/30 transition-all duration-300 border border-border/80 dark:border-border/30">
              <div className="relative h-28 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-700 group-hover:scale-115"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} opacity-60 group-hover:opacity-75 transition-opacity`} />
                {/* Icon with animation */}
                <motion.span
                  className="absolute top-3 left-0 right-0 text-2xl text-center select-none"
                  whileHover={{ scale: 1.25, rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {cat.icon}
                </motion.span>
                {/* Arrow reveal on hover */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <ArrowUpRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-brand-600 transition-colors">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cat.count} products</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
