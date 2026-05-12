"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Star, Eye } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Testimonial {
  _id: string;
  name: string;
  age: number;
  program: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function TestimonialsAdminPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [preview, setPreview] = useState<Testimonial | null>(null);

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["admin-testimonials", filter],
    queryFn: async () => {
      const res = await api.get(`/testimonials?status=${filter === "all" ? "" : filter}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const res = await api.patch(`/testimonials/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success(`Testimonial ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setPreview(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/testimonials/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setPreview(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    approved: "bg-brand-mint/10 text-brand-teal border border-brand-mint/20",
    rejected: "bg-red-50 text-red-500 border border-red-100",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Testimonials</h1>
          <p className="font-body text-sm text-gray-400">Approve or reject member reviews</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-body text-xs font-semibold px-4 py-2 rounded-lg transition-all capitalize ${
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-3 w-1/2" />
              <div className="h-3 bg-gray-100 rounded mb-2 w-full" />
              <div className="h-3 bg-gray-100 rounded mb-2 w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Star className="text-gray-200 mx-auto mb-3" size={40} />
          <p className="font-body text-gray-400">No testimonials found for this filter</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                    {t.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-gray-800">{t.name}</p>
                    <p className="font-body text-xs text-gray-400">Age {t.age} · {t.program}</p>
                  </div>
                </div>
                <span className={`font-body text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[t.status]}`}>
                  {t.status}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                ))}
              </div>

              {/* Content */}
              <p className="font-body text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                &ldquo;{t.content}&rdquo;
              </p>

              <p className="font-body text-xs text-gray-400 mb-4">{format(new Date(t.createdAt), "d MMM yyyy")}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(t)}
                  className="flex items-center gap-1.5 font-body text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye size={13} /> View
                </button>
                {t.status !== "approved" && (
                  <button
                    onClick={() => updateMutation.mutate({ id: t._id, status: "approved" })}
                    className="flex items-center gap-1.5 font-body text-xs font-semibold text-brand-teal bg-brand-mint/10 hover:bg-brand-mint/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                )}
                {t.status !== "rejected" && (
                  <button
                    onClick={() => updateMutation.mutate({ id: t._id, status: "rejected" })}
                    className="flex items-center gap-1.5 font-body text-xs font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Delete this testimonial?")) deleteMutation.mutate(t._id); }}
                  className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors ml-auto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setPreview(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                  {preview.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-bold text-gray-900">{preview.name}</p>
                  <p className="font-body text-sm text-gray-400">Age {preview.age} · {preview.program}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < preview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                ))}
              </div>
              <p className="font-body text-gray-700 leading-relaxed mb-6">&ldquo;{preview.content}&rdquo;</p>
              <div className="flex gap-3">
                {preview.status !== "approved" && (
                  <button
                    onClick={() => updateMutation.mutate({ id: preview._id, status: "approved" })}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-mint text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-brand-teal transition-colors"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                )}
                {preview.status !== "rejected" && (
                  <button
                    onClick={() => updateMutation.mutate({ id: preview._id, status: "rejected" })}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(preview._id); }}
                  className="p-3 rounded-xl border-2 border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
