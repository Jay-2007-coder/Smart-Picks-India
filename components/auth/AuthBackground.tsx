"use client";

import React, { useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Spring physics for smooth cursor glow
  const cursorX = useSpring(0, { stiffness: 100, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    // 1. Mouse Tracking for Cursor Glow
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 150); // Offset by half the glow width
      cursorY.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 2. Canvas Particle Network
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const numParticles = 80;
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Particle Object
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 2 + 0.5;
        this.color = `hsla(${Math.random() * 60 + 260}, 80%, 70%, ${Math.random() * 0.5 + 0.1})`; // Purples/Pinks
      }

      update(mouseX: number, mouseY: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;

        // Mouse avoidance/attraction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Init particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    let mouse = { x: 0, y: 0 };
    const trackMouseCanvas = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", trackMouseCanvas);

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update(mouse.x, mouse.y);
        p.draw();
        
        // Draw connection lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.2 - dist / 600})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", trackMouseCanvas);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorX, cursorY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050816]">
      
      {/* 1. Base Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. Floating Gradient Orbs */}
      <motion.div
        animate={{
          x: [-50, 150, -50],
          y: [-50, 100, -50],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [100, -100, 100],
          y: [50, -150, 50],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-[#EC4899]/15 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [-100, 50, -100],
          y: [-50, -150, -50],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 left-1/4 w-[25rem] h-[25rem] bg-[#EF4444]/15 rounded-full blur-[100px]"
      />

      {/* 3. Canvas Particle Network */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-70 mix-blend-screen" />

      {/* 4. Cursor Glow Orb */}
      <motion.div
        className="absolute z-20 w-[300px] h-[300px] rounded-full mix-blend-screen pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
    </div>
  );
}
