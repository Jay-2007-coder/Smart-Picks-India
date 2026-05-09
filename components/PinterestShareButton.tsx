"use client";
import { Share2 } from "lucide-react";

interface PinterestShareButtonProps {
  url: string;
  image: string;
  description: string;
}

export default function PinterestShareButton({ url, image, description }: PinterestShareButtonProps) {
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`;

  return (
    <a
      href={pinterestUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-[#E60023] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c0001d] transition-colors shadow-sm hover:shadow-md"
      id="pinterest-share"
    >
      <Share2 className="h-4 w-4" />
      Save to Pinterest
    </a>
  );
}
