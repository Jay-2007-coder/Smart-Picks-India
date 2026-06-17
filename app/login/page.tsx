"use client";

import React, { useState, useEffect, useTransition, Suspense, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Phone, Eye, EyeOff, Loader2, ArrowRight,
  ShieldCheck, Sparkles, Zap, Star, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Three.js Particle Field ─────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let THREE: any;
    let renderer: any, scene: any, camera: any, particles: any, lines: any;
    let animationId: number;

    const init = async () => {
      THREE = await import("three");

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      // ── Floating Particles ──
      const COUNT = 120;
      const positions = new Float32Array(COUNT * 3);
      const sizes = new Float32Array(COUNT);
      const velocities: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        sizes[i] = Math.random() * 2.5 + 0.5;
        velocities.push({
          x: (Math.random() - 0.5) * 0.004,
          y: (Math.random() - 0.5) * 0.004,
          z: (Math.random() - 0.5) * 0.002,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: `
          attribute float size;
          varying float vAlpha;
          void main(){
            vAlpha = 0.6 + 0.4 * sin(position.x * 2.0 + position.y);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          void main(){
            float d = length(gl_PointCoord - vec2(0.5));
            if(d > 0.5) discard;
            float alpha = (1.0 - d * 2.0) * vAlpha * 0.75;
            vec3 col = mix(vec3(0.49, 0.36, 0.97), vec3(0.83, 0.25, 0.21), vAlpha * 0.5);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });

      particles = new THREE.Points(geo, mat);
      scene.add(particles);

      // ── Connection Lines ──
      const lineGeo = new THREE.BufferGeometry();
      const linePositions = new Float32Array(COUNT * COUNT * 6);
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x6e3af5, transparent: true, opacity: 0.08 });
      lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);

      // ── Animate ──
      let t = 0;
      const pos = geo.attributes.position.array as Float32Array;
      const linePos = lineGeo.attributes.position.array as Float32Array;

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        t += 0.005;

        // Move particles
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3] += velocities[i].x;
          pos[i * 3 + 1] += velocities[i].y + Math.sin(t + i * 0.3) * 0.001;
          pos[i * 3 + 2] += velocities[i].z;

          // Wrap around
          if (Math.abs(pos[i * 3]) > 8) velocities[i].x *= -1;
          if (Math.abs(pos[i * 3 + 1]) > 6) velocities[i].y *= -1;
          if (Math.abs(pos[i * 3 + 2]) > 4) velocities[i].z *= -1;
        }
        geo.attributes.position.needsUpdate = true;

        // Draw connections within threshold
        let lIdx = 0;
        for (let i = 0; i < COUNT; i++) {
          for (let j = i + 1; j < COUNT; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 2.8 && lIdx < linePos.length - 6) {
              linePos[lIdx++] = pos[i * 3]; linePos[lIdx++] = pos[i * 3 + 1]; linePos[lIdx++] = pos[i * 3 + 2];
              linePos[lIdx++] = pos[j * 3]; linePos[lIdx++] = pos[j * 3 + 1]; linePos[lIdx++] = pos[j * 3 + 2];
            }
          }
        }
        lineGeo.setDrawRange(0, lIdx / 3);
        lineGeo.attributes.position.needsUpdate = true;

        // Mouse parallax
        particles.rotation.x += (mouseRef.current.y * 0.0008 - particles.rotation.x) * 0.05;
        particles.rotation.y += (mouseRef.current.x * 0.0008 - particles.rotation.y) * 0.05;
        lines.rotation.copy(particles.rotation);

        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        if (!canvas.parentElement) return;
        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    };

    const cleanup = init();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      cleanup.then((fn) => fn && fn());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

// ─── Animated background orbs ──────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 600, h: 600, x: "-20%", y: "-20%", from: "#6d28d9", to: "#7c3aed", dur: 8 },
        { w: 500, h: 500, x: "60%", y: "50%", from: "#dc2626", to: "#e85d54", dur: 11 },
        { w: 400, h: 400, x: "30%", y: "-10%", from: "#4f46e5", to: "#6366f1", dur: 13 },
        { w: 350, h: 350, x: "-10%", y: "60%", from: "#7c3aed", to: "#a855f7", dur: 9 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.w, height: orb.h,
            left: orb.x, top: orb.y,
            background: `radial-gradient(circle, ${orb.from}15, ${orb.to}08, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{ x: [0, 30, -20, 10, 0], y: [0, -20, 30, -10, 0], scale: [1, 1.08, 0.96, 1.04, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Trust badges ──────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "256-bit SSL" },
  { icon: Zap, label: "Instant Access" },
  { icon: Star, label: "50K+ Users" },
];

// ─── Social providers ──────────────────────────────────────────────────────
const SOCIAL_PROVIDERS = [
  {
    key: "google" as const,
    label: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013Z"/>
        <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
      </svg>
    ),
    hoverColor: "hover:border-red-500/40 hover:bg-red-500/5",
  },
  {
    key: "github" as const,
    label: "GitHub",
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
    hoverColor: "hover:border-slate-500/40 hover:bg-slate-500/5",
  },
  {
    key: "microsoft" as const,
    label: "Microsoft",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 23 23">
        <path d="M0 0h11v11H0z" fill="#f25022"/>
        <path d="M12 0h11v11H12z" fill="#7fba00"/>
        <path d="M0 12h11v11H0z" fill="#00a4ef"/>
        <path d="M12 12h11v11H12z" fill="#ffb900"/>
      </svg>
    ),
    hoverColor: "hover:border-blue-500/40 hover:bg-blue-500/5",
  },
];

// ─── Input component ────────────────────────────────────────────────────────
function GlowInput({ icon: Icon, rightSlot, focused, ...props }: any) {
  return (
    <div className={`relative group transition-all duration-300 ${focused ? "drop-shadow-[0_0_12px_rgba(109,40,217,0.35)]" : ""}`}>
      <Icon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-400 z-10" />
      <input
        {...props}
        className={`w-full rounded-2xl border bg-white/5 py-3.5 pl-12 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${
          focused
            ? "border-violet-500/60 ring-2 ring-violet-500/15"
            : "border-white/10 hover:border-white/20"
        } ${props.className || ""}`}
      />
      {rightSlot}
    </div>
  );
}

// ─── Main Form ──────────────────────────────────────────────────────────────
function LoginForm() {
  const { login, socialLogin, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/dashboard";

  useEffect(() => {
    if (user) router.push(redirectPath);
  }, [user, router, redirectPath]);

  const [activeTab, setActiveTab] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => {
    let i: NodeJS.Timeout;
    if (otpTimer > 0) i = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearInterval(i);
  }, [otpTimer]);

  useEffect(() => {
    let i: NodeJS.Timeout;
    if (otpCooldown > 0) i = setInterval(() => setOtpCooldown((p) => p - 1), 1000);
    return () => clearInterval(i);
  }, [otpCooldown]);

  const mockProvider = searchParams.get("mock_provider") as "google" | "github" | "microsoft" | null;
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError) {
      const msgs: Record<string, string> = {
        google_token_failed: "Failed to authenticate with Google.",
        google_user_failed: "Failed to authenticate with Google.",
        github_token_failed: "Failed to authenticate with GitHub.",
        github_user_failed: "Failed to authenticate with GitHub.",
        microsoft_token_failed: "Failed to authenticate with Microsoft.",
        microsoft_user_failed: "Failed to authenticate with Microsoft.",
      };
      setError(msgs[authError] || "Social authentication failed.");
    }
  }, [authError]);

  useEffect(() => {
    if (mockProvider && !user && !isPending) {
      const newUrl = window.location.pathname + (redirectPath !== "/dashboard" ? `?from=${encodeURIComponent(redirectPath)}` : "");
      window.history.replaceState({}, document.title, newUrl);
      triggerMockSocialSignIn(mockProvider);
    }
  }, [mockProvider, user, isPending, redirectPath]);

  // OTP digit input handler
  const handleOtpDigit = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[idx] = val.slice(-1);
    setOtpCode(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !password) { setError("Please fill in all fields."); return; }
    startTransition(async () => {
      const res = await login({ email, password, rememberMe });
      if (res.success) { setSuccess(res.message); router.push(redirectPath); }
      else setError(res.message);
    });
  };

  const handleSendOtp = () => {
    setError(null); setSuccess(null);
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phone || !phoneRegex.test(phone)) { setError("Enter a valid phone number in E.164 format (+919876543210)"); return; }
    startTransition(async () => {
      const res = await fetch("/api/v1/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose: "login" }) });
      const data = await res.json();
      if (res.ok && data.success) { setOtpSent(true); setOtpTimer(300); setOtpCooldown(60); setSuccess("OTP sent! Check your messages."); }
      else setError(data.message || "Failed to send OTP.");
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    setError(null); setSuccess(null);
    if (!phone || code.length !== 6) { setError("Enter your phone number and complete 6-digit OTP."); return; }
    startTransition(async () => {
      const res = await login({ phone, code, rememberMe });
      if (res.success) { setSuccess(res.message); router.push(redirectPath); }
      else setError(res.message);
    });
  };

  const handleSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    setError(null); setSocialLoading(provider);
    window.location.href = `/api/v1/auth/${provider}`;
  };

  const triggerMockSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    startTransition(async () => {
      const mockProfiles = {
        google: { accountId: "g-" + Math.random(), email: "jay.google@example.com", name: "Jay (Google Auth)", avatarUrl: "" },
        github: { accountId: "gh-" + Math.random(), email: "jay.github@example.com", name: "Jay (GitHub Auth)", avatarUrl: "" },
        microsoft: { accountId: "ms-" + Math.random(), email: "jay.ms@example.com", name: "Jay (Microsoft Auth)", avatarUrl: "" },
      };
      const res = await socialLogin({ provider, ...mockProfiles[provider] });
      if (res.success) { setSuccess(res.message); router.push(redirectPath); }
      else setError(res.message);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06060f] flex items-center justify-center px-4 py-16">

      {/* ── Three.js particle canvas ── */}
      <div className="absolute inset-0 z-0">
        <ParticleField />
      </div>

      {/* ── Gradient orbs ── */}
      <FloatingOrbs />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
      />

      {/* ── Radial vignette ── */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #06060f 100%)" }} />

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo badge */}
          <div className="inline-flex items-center justify-center mb-4 relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 relative">
              <Sparkles className="h-8 w-8 text-white" />
              {/* Ping ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-500/40 animate-ping opacity-30" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-rose-300 bg-clip-text text-transparent">
            SmartPicks India
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Sign in to your budget shopping portal
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <Icon className="h-3 w-3 text-violet-500" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 32px 80px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Inner top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-16 bg-violet-500/5 blur-xl rounded-full pointer-events-none" />

          {/* ── Tab Selector ── */}
          <div className="relative flex p-2 m-4 mb-0 rounded-2xl bg-white/4 border border-white/8">
            <motion.div
              className="absolute inset-y-1 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg shadow-violet-500/20"
              animate={{ left: activeTab === "credentials" ? "4px" : "50%", width: "calc(50% - 4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {[
              { key: "credentials", label: "Email & Password" },
              { key: "otp", label: "Phone & OTP" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setError(null); }}
                className={`relative z-10 flex-1 py-2.5 text-xs font-black tracking-wide transition-colors cursor-pointer rounded-xl ${
                  activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-7 pt-5">

            {/* ── Feedback ── */}
            <AnimatePresence mode="wait">
              {(error || success) && (
                <motion.div
                  key={error ? "error" : "success"}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                    error
                      ? "border-rose-500/20 bg-rose-500/8 text-rose-400"
                      : "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                  }`}
                >
                  <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${error ? "bg-rose-500/20" : "bg-emerald-500/20"}`}>
                    {error ? "!" : <Check className="h-3 w-3" />}
                  </div>
                  <span className="font-semibold leading-relaxed">{error || success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TAB 1: EMAIL/PASSWORD ── */}
            <AnimatePresence mode="wait">
              {activeTab === "credentials" && (
                <motion.form
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleCredentialsSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Email Address
                    </label>
                    <GlowInput
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      focused={focusedField === "email"}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPending}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <GlowInput
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      focused={focusedField === "password"}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPending}
                      className="pr-12"
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer z-10"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      }
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative h-4 w-4 shrink-0">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="h-4 w-4 rounded border border-white/15 bg-white/5 peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all flex items-center justify-center">
                        {rememberMe && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors select-none">
                      Remember me for 7 days
                    </span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isPending}
                    className="relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-black text-white shadow-2xl shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all mt-2"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9, #dc2626)" }}
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                      ) : (
                        <>Sign In <ArrowRight className="h-4 w-4" /></>
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              )}

              {/* ── TAB 2: OTP ── */}
              {activeTab === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <AnimatePresence mode="wait">
                    {!otpSent ? (
                      <motion.div key="phone-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</label>
                          <GlowInput
                            icon={Phone}
                            type="tel"
                            value={phone}
                            onChange={(e: any) => setPhone(e.target.value)}
                            placeholder="+919876543210"
                            focused={focusedField === "phone"}
                            onFocus={() => setFocusedField("phone")}
                            onBlur={() => setFocusedField(null)}
                            disabled={isPending}
                          />
                          <p className="text-[10px] text-slate-600 pl-1">Include country code in E.164 format.</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          onClick={handleSendOtp}
                          disabled={isPending}
                          className="w-full rounded-2xl py-3.5 text-sm font-black text-white shadow-xl shadow-violet-500/20 disabled:opacity-60 cursor-pointer transition-all"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9, #dc2626)" }}
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Request OTP Verification"}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.form key="otp-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleOtpSubmit} className="space-y-5">
                        {/* OTP sent banner */}
                        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/8 px-4 py-3">
                          <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-violet-400" />
                          </div>
                          <div className="text-xs">
                            <p className="font-black text-white">OTP sent to {phone}</p>
                            {otpTimer > 0
                              ? <p className="text-slate-400 mt-0.5">Valid for <span className="text-violet-400 font-bold">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}</span></p>
                              : <p className="text-rose-400 mt-0.5 font-bold">Code Expired</p>}
                          </div>
                        </div>

                        {/* 6 separate OTP digit boxes */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">6-Digit OTP Code</label>
                          <div className="flex gap-2.5">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <motion.input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otpCode[i]}
                                onChange={(e) => handleOtpDigit(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                onFocus={() => setFocusedField(`otp-${i}`)}
                                onBlur={() => setFocusedField(null)}
                                whileFocus={{ scale: 1.05 }}
                                className={`flex-1 h-14 rounded-2xl border text-center text-xl font-black text-white bg-white/5 focus:outline-none transition-all duration-200 ${
                                  focusedField === `otp-${i}`
                                    ? "border-violet-500/60 ring-2 ring-violet-500/20 bg-violet-500/5"
                                    : otpCode[i]
                                    ? "border-violet-500/40"
                                    : "border-white/10 hover:border-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <button type="button" onClick={() => setOtpSent(false)} className="font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                            ← Change Phone
                          </button>
                          {otpCooldown > 0
                            ? <span className="text-slate-600 font-bold">Resend in {otpCooldown}s</span>
                            : <button type="button" onClick={handleSendOtp} className="font-bold text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">Resend OTP</button>}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isPending || otpCode.join("").length < 6}
                          className="w-full rounded-2xl py-3.5 text-sm font-black text-white shadow-xl shadow-violet-500/20 disabled:opacity-50 cursor-pointer transition-all"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9, #dc2626)" }}
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Verify & Log In →"}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Divider ── */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] uppercase font-black tracking-widest text-slate-600" style={{ background: "transparent" }}>
                  or continue with
                </span>
              </div>
            </div>

            {/* ── Social Grid ── */}
            <div className="grid grid-cols-3 gap-3">
              {SOCIAL_PROVIDERS.map((provider) => (
                <motion.button
                  key={provider.key}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleSocialSignIn(provider.key)}
                  disabled={!!socialLoading}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/8 bg-white/4 transition-all duration-200 cursor-pointer disabled:opacity-50 ${provider.hoverColor}`}
                >
                  {socialLoading === provider.key
                    ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    : provider.icon}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{provider.label}</span>
                </motion.button>
              ))}
            </div>

            {/* ── Sign up ── */}
            <p className="mt-7 text-center text-xs text-slate-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-black text-violet-400 hover:text-violet-300 transition-colors">
                Create Free Account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-[10px] text-slate-700 font-medium"
        >
          By signing in, you agree to our{" "}
          <Link href="/legal/terms" className="text-slate-600 hover:text-slate-400 underline underline-offset-2">Terms</Link>
          {" & "}
          <Link href="/legal/privacy" className="text-slate-600 hover:text-slate-400 underline underline-offset-2">Privacy Policy</Link>
        </motion.p>
      </motion.div>

      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
}

// ─── Page Wrapper ────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#06060f]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
