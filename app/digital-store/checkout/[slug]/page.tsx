"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, ArrowLeft, Send, CheckCircle2, ShieldAlert, Sparkles, Download, ArrowRight } from "lucide-react";

interface ProductPreview {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
}

export default function DigitalCheckout() {
  const { slug } = useParams() as any;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductPreview | null>(null);
  const [productId, setProductId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [sandbox, setSandbox] = useState(true);
  
  // Payment states
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [secureToken, setSecureToken] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Sandbox Simulated Payment Forms
  const [sandboxPaymentMethod, setSandboxPaymentMethod] = useState<"card" | "upi">("card");
  const [sandboxCardNumber, setSandboxCardNumber] = useState("4111 1111 1111 1111");
  const [sandboxCardExpiry, setSandboxCardExpiry] = useState("12/28");
  const [sandboxCardCvv, setSandboxCardCvv] = useState("123");
  const [sandboxUpiId, setSandboxUpiId] = useState("student@paytm");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/digital-store/checkout/${slug}`);
      return;
    }

    async function initializeCheckout() {
      try {
        // 1. Fetch product first to obtain the database ObjectId
        const pResponse = await fetch(`/api/v1/digital-store/product/${slug}`);
        const pData = await pResponse.json();
        if (!pResponse.ok || !pData.success) {
          router.push("/digital-store");
          return;
        }

        setProduct(pData.product);
        setProductId(pData.product._id);

        // 2. Create the checkout order
        const oResponse = await fetch("/api/v1/digital-store/checkout/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: pData.product._id }),
        });

        const oData = await oResponse.json();
        if (oResponse.ok && oData.success) {
          setOrderId(oData.orderId);
          setSandbox(oData.sandbox);

          // If Razorpay is enabled, load Razorpay script
          if (!oData.sandbox) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
          }
        } else {
          setPaymentError(oData.message || "Failed to initiate payment order.");
        }
      } catch (err) {
        setPaymentError("An error occurred during checkout setup.");
      } finally {
        setLoading(false);
      }
    }

    initializeCheckout();
  }, [slug, user, authLoading, router]);

  // Production Razorpay Dispatcher
  const handleProductionPayment = () => {
    if (sandbox || !product) return;

    setPaymentLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "sandbox_key",
      amount: Math.round(product.price * 100),
      currency: "INR",
      name: "SmartPicks India",
      description: `Purchase: ${product.title}`,
      image: "/favicon.ico",
      order_id: orderId,
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/v1/digital-store/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setSecureToken(verifyData.secureToken);
            setCheckoutCompleted(true);
          } else {
            setPaymentError(verifyData.message || "Payment verification failed.");
          }
        } catch (err) {
          setPaymentError("Network error during payment verification.");
        } finally {
          setPaymentLoading(false);
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: "#df3838",
      },
      modal: {
        ondismiss: function () {
          setPaymentLoading(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // Sandbox Mock Checkout verification handler
  const handleSandboxPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandbox || !product) return;

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const mockPaymentId = `mock_pay_${Math.random().toString(36).substring(2, 10)}`;
      const response = await fetch("/api/v1/digital-store/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId: mockPaymentId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSecureToken(data.secureToken);
        setCheckoutCompleted(true);
      } else {
        setPaymentError(data.message || "Sandbox payment verification failed.");
      }
    } catch (err) {
      setPaymentError("Sandbox network failure.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownload = () => {
    if (secureToken) {
      window.location.href = `/api/v1/digital-store/download/${secureToken}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Setting up checkout session...</p>
        </div>
      </div>
    );
  }

  // Render checkout completed success screen
  if (checkoutCompleted && product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-16 flex items-center">
        <div className="container-custom max-w-xl mx-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-8 text-center shadow-xl space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 mx-auto animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                payment successful
              </span>
              <h2 className="text-2xl font-black text-foreground">Order Confirmed!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Thank you! Your transaction completed. We have sent an email receipt containing your personal file access token.
              </p>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-4 bg-muted/30 border border-border/50 rounded-2xl p-4 text-left">
              <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-foreground text-xs line-clamp-1">{product.title}</h4>
                <p className="text-[10px] font-bold text-muted-foreground">Price Paid: ₹{product.price}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={handleDownload}
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97"
              >
                <Download className="h-4.5 w-4.5" /> Download File Now
              </button>
              <Link
                href="/digital-store"
                className="flex h-11 w-full items-center justify-center gap-1 text-xs font-bold border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all hover:bg-muted/40"
              >
                Browse Digital Store <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-4xl">
        {/* Back Link */}
        <Link
          href={`/digital-store/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel &amp; Return
        </Link>

        {/* Grid Columns */}
        {product && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Payment Portal */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground leading-snug">Secure Checkout</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                      transaction billing
                    </p>
                  </div>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-xs border border-destructive/10 bg-destructive/5 text-destructive animate-fade-in">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                    <span className="font-semibold leading-relaxed">{paymentError}</span>
                  </div>
                )}

                {sandbox ? (
                  /* Sandbox Mock payment options */
                  <form onSubmit={handleSandboxPayment} className="space-y-6">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-xs text-sky-800 dark:border-sky-950/20 dark:bg-sky-950/15 dark:text-sky-400">
                      <p className="font-extrabold flex items-center gap-1 mb-1">
                        <Sparkles className="h-4 w-4 text-sky-500 fill-sky-500 animate-pulse" /> Sandbox Mode Active
                      </p>
                      <p className="leading-relaxed text-[11px]">
                        The site is running in development sandbox mode. Fill mock details below to finalize checkout with zero cost.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Choose Mock Payment Mode
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSandboxPaymentMethod("card")}
                          className={`flex items-center justify-center h-10 rounded-xl border text-xs font-bold transition-all ${
                            sandboxPaymentMethod === "card"
                              ? "border-sky-500 bg-sky-500/5 text-sky-600"
                              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          Credit/Debit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setSandboxPaymentMethod("upi")}
                          className={`flex items-center justify-center h-10 rounded-xl border text-xs font-bold transition-all ${
                            sandboxPaymentMethod === "upi"
                              ? "border-sky-500 bg-sky-500/5 text-sky-600"
                              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          UPI (Cards/PhonePe/GPay)
                        </button>
                      </div>
                    </div>

                    {sandboxPaymentMethod === "card" ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={sandboxCardNumber}
                            onChange={(e) => setSandboxCardNumber(e.target.value)}
                            className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={sandboxCardExpiry}
                              onChange={(e) => setSandboxCardExpiry(e.target.value)}
                              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                              CVV Code
                            </label>
                            <input
                              type="text"
                              value={sandboxCardCvv}
                              onChange={(e) => setSandboxCardCvv(e.target.value)}
                              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          UPI VPA ID
                        </label>
                        <input
                          type="text"
                          value={sandboxUpiId}
                          onChange={(e) => setSandboxUpiId(e.target.value)}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-600 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97 disabled:opacity-50"
                    >
                      <Send className="h-4.5 w-4.5" />
                      {paymentLoading ? "Processing Sandbox checkout..." : `Verify payment (₹${product.price})`}
                    </button>
                  </form>
                ) : (
                  /* Production Razorpay Portal integration */
                  <div className="space-y-6 py-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Click the button below to initiate Razorpay billing dialog. You can authorize payments via cards, Netbanking, Google Pay, UPI, or PhonePe.
                    </p>
                    <button
                      onClick={handleProductionPayment}
                      disabled={paymentLoading}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-600 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97 disabled:opacity-50"
                    >
                      <Send className="h-4.5 w-4.5" />
                      {paymentLoading ? "Initiating transaction..." : `Launch Razorpay Portal (₹${product.price})`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Product Summary Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-5">
                <h4 className="font-extrabold text-foreground text-sm">Purchase Details</h4>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50">
                    <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-foreground text-xs leading-snug line-clamp-2">
                      {product.title}
                    </h5>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 space-y-2 text-xs font-bold text-muted-foreground">
                  <div className="flex justify-between text-foreground font-black">
                    <span>Subtotal Price:</span>
                    <span>₹{product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (Tax):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-brand-600 font-black border-t border-border/50 pt-2 text-sm">
                    <span>Total Amount:</span>
                    <span>₹{product.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
