"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "@/data/products";

interface CompareContextType {
  comparedProducts: Product[];
  toggleCompare: (product: Product) => void;
  isInCompare: (slug: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  // Load initial selections from localStorage on client-side
  useEffect(() => {
    try {
      const stored = localStorage.getItem("compare_products");
      if (stored) {
        setComparedProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load compare items", e);
    }
  }, []);

  const toggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      let updated;
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) {
        updated = prev.filter((p) => p.slug !== product.slug);
      } else {
        if (prev.length >= 3) {
          alert("You can compare a maximum of 3 products at a time.");
          return prev;
        }
        updated = [...prev, product];
      }
      localStorage.setItem("compare_products", JSON.stringify(updated));
      return updated;
    });
  };

  const isInCompare = (slug: string) => {
    return comparedProducts.some((p) => p.slug === slug);
  };

  const clearCompare = () => {
    setComparedProducts([]);
    localStorage.removeItem("compare_products");
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
