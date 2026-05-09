"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          <Link href={`/category/${cat.slug}`} className="group block">
            <div className="card overflow-hidden text-center p-0">
              <div className="relative h-28 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} opacity-60`} />
                <span className="absolute top-3 left-0 right-0 text-2xl text-center">{cat.icon}</span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground line-clamp-1">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.count} products</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
