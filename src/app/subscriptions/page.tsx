"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle, Clock, Send, FileText, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Subscription {
  _id: string;
  user: { _id: string; name: string; email: string };
  program: { title: string; duration: string; price: number };
  status: "pending_payment" | "payment_received" | "active" | "expired";
  paymentMethod: string;
  paymentReference?: string;
  createdAt: string;
  startDate?: string;
}

export default function SubscriptionsAdminPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending_payment" | "payment_received" | "active">("pending_payment");
  const [scheduleFor, setScheduleFor] = useState<Subscription | null>(null);
  const [scheduleContent, setScheduleContent] = useState("");
  const [notifyContent, setNotifyContent] = useState("");
  const [notifyFor, setNotifyFor] = useState<Subscription | null>(null);

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["admin-subscriptions", filter],
    queryFn: async () => {
      const res = await api.get(`/subscriptions?status=${filter === "all" ? "" : filter}`);
      return res.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/subscriptions/${id}/confirm`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment confirmed! Member activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const notifyMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await api.post(`/subscriptions/${id}/notify`, { message });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Notification email sent");
      setNotifyFor(null);
      setNotifyContent("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const sendScheduleMutation = useMutation({
    mutationFn: async ({ id, schedule }: { id: string; schedule: string }) => {
      const res = await api.post(`/subscriptions/${id}/schedule`, { schedule });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Training schedule sent to member!");
      setScheduleFor(null);
      setScheduleContent("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending_payment: { label: "Pending Payment", color: "bg-amber-50 text-amber-600 border border-amber-200" },
    payment_received: { label: "Payment Received", color: "bg-blue-50 text-blue-600 border border-blue-200" },
    active: { label: "Active", color: "bg-brand-mint/10 text-brand-teal border border-brand-mint/20" },
    expired: { label: "Expired", color: "bg-gray-50 text-gray-400 border border-gray-200" },
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Subscriptions</h1>
          <p className="font-body text-sm text-gray-400">Confirm payments & send training schedules</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["all", "pending_payment", "payment_received", "active"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-body text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "pending_payment" ? "Pending" : f === "payment_received" ? "To Confirm" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Member", "Program", "Price", "Payment Ref", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <CreditCard className="text-gray-200 mx-auto mb-3" size={36} />
                    <p className="font-body text-gray-400">No subscriptions found</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-body font-semibold text-sm text-gray-800">{s.user?.name}</p>
                      <p className="font-body text-xs text-gray-400">{s.user?.email}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-body text-sm text-gray-700">{s.program?.title}</p>
                      <p className="font-body text-xs text-gray-400">{s.program?.duration}</p>
                    </td>
                    <td className="py-4 px-5 font-body font-semibold text-gray-900">£{s.program?.price}</td>
                    <td className="py-4 px-5">
                      <p className="font-body text-xs text-gray-500 font-mono">{s.paymentReference || "—"}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`font-body text-xs font-bold px-2.5 py-1 rounded-full ${statusConfig[s.status]?.color}`}>
                        {statusConfig[s.status]?.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-body text-xs text-gray-400">
                      {format(new Date(s.createdAt), "d MMM yyyy")}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {s.status === "payment_received" && (
                          <button
                            onClick={() => confirmMutation.mutate(s._id)}
                            disabled={confirmMutation.isPending}
                            className="flex items-center gap-1.5 font-body text-xs font-semibold text-brand-teal bg-brand-mint/10 hover:bg-brand-mint/20 px-3 py-2 rounded-lg transition-colors"
                          >
                            <CheckCircle size={12} /> Confirm
                          </button>
                        )}
                        {s.status === "pending_payment" && (
                          <button
                            onClick={() => setNotifyFor(s)}
                            className="flex items-center gap-1.5 font-body text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Clock size={12} /> Notify
                          </button>
                        )}
                        {s.status === "active" && (
                          <button
                            onClick={() => setScheduleFor(s)}
                            className="flex items-center gap-1.5 font-body text-xs font-semibold text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 px-3 py-2 rounded-lg transition-colors"
                          >
                            <FileText size={12} /> Schedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Schedule Modal */}
      <AnimatePresence>
        {scheduleFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setScheduleFor(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Send Training Schedule</h3>
                  <p className="font-body text-sm text-gray-400 mt-1">To: {scheduleFor.user?.name} ({scheduleFor.user?.email})</p>
                </div>
                <button onClick={() => setScheduleFor(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X size={18} />
                </button>
              </div>
              <div className="bg-brand-gradient-soft rounded-2xl p-4 mb-4 border border-brand-purple/10">
                <p className="font-body text-xs text-brand-purple font-semibold mb-1">Programme: {scheduleFor.program?.title}</p>
                <p className="font-body text-xs text-gray-500">Duration: {scheduleFor.program?.duration}</p>
              </div>
              <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Training Schedule / Programme Details</label>
              <textarea
                value={scheduleContent}
                onChange={(e) => setScheduleContent(e.target.value)}
                placeholder="Week 1: Monday - Strength Training (Squats 3x10, Deadlifts 3x8...)&#10;Week 1: Wednesday - Mobility (Hip flexors, Thoracic rotation...)&#10;..."
                rows={10}
                className="input-base resize-none text-sm font-mono mb-5"
              />
              <div className="flex gap-3">
                <button onClick={() => setScheduleFor(null)} className="flex-1 btn-outline text-sm">Cancel</button>
                <button
                  disabled={!scheduleContent.trim() || sendScheduleMutation.isPending}
                  onClick={() => sendScheduleMutation.mutate({ id: scheduleFor._id, schedule: scheduleContent })}
                  className="flex-1 btn-primary text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {sendScheduleMutation.isPending ? "Sending..." : "Send Schedule"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notify Modal */}
      <AnimatePresence>
        {notifyFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setNotifyFor(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Notify Member</h3>
              <p className="font-body text-sm text-gray-400 mb-6">To: {notifyFor.user?.name}</p>
              <textarea
                value={notifyContent}
                onChange={(e) => setNotifyContent(e.target.value)}
                placeholder="e.g. We have not yet received your payment. Please use bank transfer to..."
                rows={5}
                className="input-base resize-none text-sm mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setNotifyFor(null)} className="flex-1 btn-outline text-sm">Cancel</button>
                <button
                  disabled={!notifyContent.trim() || notifyMutation.isPending}
                  onClick={() => notifyMutation.mutate({ id: notifyFor._id, message: notifyContent })}
                  className="flex-1 btn-primary text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {notifyMutation.isPending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
