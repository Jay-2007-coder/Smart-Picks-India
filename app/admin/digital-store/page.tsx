"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Upload,
  Tag,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  ArrowLeft,
  Settings,
  Sparkles,
  ShoppingBag,
  Download,
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  type: "free" | "paid" | "freemium";
  imageUrl: string;
  downloadCount: number;
  averageRating: number;
  status: "active" | "inactive";
}

const categories = [
  { id: "notes", label: "Engineering Notes" },
  { id: "guides", label: "DSA & Interview Guides" },
  { id: "cheatsheets", label: "Coding Cheat Sheets" },
  { id: "ebooks", label: "E-books" },
  { id: "templates", label: "Resume & Web Templates" },
  { id: "tools", label: "Mini Tools" },
  { id: "prompts", label: "AI Prompt Bundles" },
];

export default function AdminDigitalStore() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("notes");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [type, setType] = useState<"free" | "paid" | "freemium">("free");
  const [downloadLimit, setDownloadLimit] = useState("0");
  
  // Uploaded files states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user as any).role !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function fetchProducts() {
      try {
        const response = await fetch("/api/v1/admin/digital-products");
        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products list:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user, authLoading, router]);

  const handleEditClick = (p: Product) => {
    setEditingId(p._id);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(p.price.toString());
    setType(p.type);
    setDownloadLimit("0"); // reset limits or use defaults
    setStatusMessage(null);
  };

  const handleClearForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("notes");
    setDescription("");
    setPrice("0");
    setType("free");
    setDownloadLimit("0");
    setImageFile(null);
    setProductFile(null);
    setPreviewFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("type", type);
    formData.append("downloadLimit", downloadLimit);

    if (imageFile) formData.append("image", imageFile);
    if (productFile) formData.append("file", productFile);
    if (previewFile) formData.append("preview", previewFile);

    try {
      let url = "/api/v1/admin/digital-product";
      let method = "POST";

      if (editingId) {
        url = `/api/v1/admin/digital-product/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: editingId ? "Resource updated successfully!" : "Digital product created successfully!",
        });

        // Update list
        if (editingId) {
          setProducts((prev) => prev.map((p) => (p._id === editingId ? data.product : p)));
        } else {
          setProducts((prev) => [data.product, ...prev]);
        }

        handleClearForm();
      } else {
        setStatusMessage({ type: "error", text: data.message || "Operation failed." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Network error during product upload." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this digital product? It will no longer show in the public store.")) return;

    try {
      const response = await fetch(`/api/v1/admin/digital-product/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, status: "inactive" } : p)));
        setStatusMessage({ type: "success", text: "Product archived successfully." });
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to delete product." });
      }
    } catch (err) {
      console.error("Delete request failed:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading admin publisher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Admin Console
        </Link>

        {/* Dashboard Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Digital Store Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add new PDF notes, coding files, cheatsheets, and monitor downloads.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Settings className="h-4 w-4" /> Admin Panel
          </span>
        </div>

        {statusMessage && (
          <div
            className={`mb-6 rounded-2xl p-4 text-xs border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/25 dark:border-emerald-950/30"
                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/25 dark:border-red-950/30"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel: Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-600" />
                {editingId ? "Edit Digital Product" : "Upload New Product"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Title Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DSA cheatsheet 2026"
                    className="w-full h-10 bg-muted/40 border border-input rounded-xl px-3.5 text-xs font-semibold focus-visible:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 bg-background border border-border rounded-xl px-3 text-xs font-bold text-foreground focus-visible:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Product Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full h-10 bg-background border border-border rounded-xl px-3 text-xs font-bold text-foreground focus-visible:outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="freemium">Freemium</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Price (INR)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full h-10 bg-muted/40 border border-input rounded-xl px-3.5 text-xs font-semibold focus-visible:outline-none"
                      disabled={type === "free"}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Download Limit
                    </label>
                    <input
                      type="number"
                      value={downloadLimit}
                      onChange={(e) => setDownloadLimit(e.target.value)}
                      className="w-full h-10 bg-muted/40 border border-input rounded-xl px-3.5 text-xs font-semibold focus-visible:outline-none"
                      disabled={type === "free"}
                      placeholder="0 for unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Description Context
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a summary of materials included..."
                    className="w-full h-20 bg-muted/40 border border-input rounded-xl p-3.5 text-xs font-semibold focus-visible:outline-none"
                    required
                  />
                </div>

                {/* Cover File Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Image Cover page
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs font-bold text-muted-foreground border border-dashed border-border rounded-xl p-2 bg-muted/20"
                    required={!editingId}
                  />
                </div>

                {/* Resource File Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Product File (PDF / ZIP / Code)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.zip,.js,.ts,.tsx,.py,.html,.css"
                    onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                    className="w-full text-xs font-bold text-muted-foreground border border-dashed border-border rounded-xl p-2 bg-muted/20"
                    required={!editingId && type !== "free"}
                  />
                </div>

                {/* Freemium Preview File Upload */}
                {type === "freemium" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Preview File (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.zip"
                      onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                      className="w-full text-xs font-bold text-muted-foreground border border-dashed border-border rounded-xl p-2 bg-muted/20"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition-all"
                  >
                    {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Publish"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="h-10 border border-border rounded-xl px-4 text-xs font-bold hover:bg-muted"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right panel: Products Catalog Listing */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600" /> Resource Catalog
              </h3>

              {products.length === 0 ? (
                <div className="text-center py-12 text-xs font-bold text-muted-foreground">
                  No digital products uploaded yet. Use the sidebar form to add your first engineering resource.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">Resource</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Downloads</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {products.map((p) => (
                        <tr
                          key={p._id}
                          className={`hover:bg-muted/30 ${p.status === "inactive" ? "opacity-50" : ""}`}
                        >
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden border bg-muted">
                                <img src={p.imageUrl} alt={p.title} className="object-cover w-full h-full" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-foreground leading-snug line-clamp-1">
                                  {p.title}
                                </h5>
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                  {p.type === "free" ? "Free" : `₹${p.price}`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 capitalize font-semibold text-muted-foreground">
                            {p.category}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`badge capitalize ${
                                p.type === "free"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                                  : p.type === "paid"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                              }`}
                            >
                              {p.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-foreground">
                            {p.downloadCount}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                                title="Edit Product"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              {p.status === "active" && (
                                <button
                                  onClick={() => handleDelete(p._id)}
                                  className="h-8 w-8 rounded-lg border border-red-200 bg-background hover:bg-red-50 flex items-center justify-center text-red-500"
                                  title="Archive Product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
