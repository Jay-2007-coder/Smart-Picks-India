"use client";

import React, { useRef, useState, useEffect } from "react";

export interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Interactive3DCard({ children, className = "" }: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rAFRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    
    rAFRef.current = requestAnimationFrame(() => {
      setCoords({ x: mouseX, y: mouseY });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(() => {
      setCoords({ x: 0, y: 0 });
    });
  };

  useEffect(() => {
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  let rotateX = 0;
  let rotateY = 0;
  let spotlightStyle: React.CSSProperties = {};
  
  if (isHovered && cardRef.current) {
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const maxRot = isMobile ? 3 : 8;
    
    const xPct = coords.x / width - 0.5;
    const yPct = coords.y / height - 0.5;
    
    rotateX = -yPct * (maxRot * 2);
    rotateY = xPct * (maxRot * 2);
    
    rotateX = Math.max(-maxRot, Math.min(maxRot, rotateX));
    rotateY = Math.max(-maxRot, Math.min(maxRot, rotateY));
    
    if (!isMobile) {
      spotlightStyle = {
        background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.15), transparent 60%)`,
      };
    }
  }

  // Mobile keeps reveal and small card lift (Y translate) but skips heavy rotate angles
  const transformStyle = isHovered
    ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -12px, 0)`
    : "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative card-3d-wrapper transition-all duration-300 ${className}`}
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Spotlight reflection */}
      {!isMobile && isHovered && (
        <div
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
          style={spotlightStyle}
        />
      )}
      {children}
    </div>
  );
}
