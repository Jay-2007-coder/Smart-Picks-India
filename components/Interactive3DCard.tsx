"use client";

import React, { useRef, useState, useEffect } from "react";

export interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Interactive3DCard({ children, className = "" }: Interactive3DCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
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
  
  if (isHovered && containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
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

  // Dynamic transforms and transitions for premium experience
  const liftY = isMobile ? -6 : -15;
  const scaleVal = isMobile ? 1.01 : 1.03;

  // Middle container transform: handles the smooth scale up and card lift
  const middleTransform = isHovered
    ? `translate3d(0, ${liftY}px, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`
    : "translate3d(0, 0, 0) scale3d(1, 1, 1)";

  const middleTransition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"; // smooth easeOutExpo

  // Inner container transform: handles the snappy 3D tilt tracking the mouse
  const innerTransform = isHovered
    ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    : "perspective(1200px) rotateX(0deg) rotateY(0deg)";

  const innerTransition = isHovered
    ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)" // snappy follow
    : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"; // smooth return

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Middle Wrapper: Handles scale, lift, shadow, and gradient border */}
      <div
        className="group relative card-3d-wrapper w-full h-full"
        style={{
          transform: middleTransform,
          transition: middleTransition,
          willChange: "transform",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Wrapper: Handles snappy 3D tilt tracking */}
        <div
          className="w-full h-full"
          style={{
            transform: innerTransform,
            transition: innerTransition,
            willChange: "transform",
            transformStyle: "preserve-3d",
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
      </div>
    </div>
  );
}
