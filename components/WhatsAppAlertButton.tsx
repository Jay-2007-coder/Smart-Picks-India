"use client";

import React from "react";
import { MessageSquareCode } from "lucide-react";
import { motion } from "framer-motion";
import { calculateDiscount } from "@/lib/utils";

interface WhatsAppAlertButtonProps {
  slug: string;
  title: string;
  price: number;
  oldPrice: number;
}

export default function WhatsAppAlertButton({ slug, title, price, oldPrice }: WhatsAppAlertButtonProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

  const handleAlertClick = () => {
    const discount = calculateDiscount(price, oldPrice);
    const messageText = 
      `*Deal Alert on SmartPicks India!* 🚀\n\n` +
      `🔥 *${title}*\n` +
      `💸 *Price:* ₹${price.toLocaleString("en-IN")}\n` +
      `📉 *Discount:* ${discount}% OFF (MRP: ₹${oldPrice.toLocaleString("en-IN")})\n\n` +
      `🔗 *View Deal:* https://smart-picks-india.vercel.app/product/${slug}`;

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAlertClick}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black shadow-sm transition-all hover:bg-emerald-500/10"
    >
      <MessageSquareCode className="h-4 w-4" /> Share on WhatsApp
    </motion.button>
  );
}
