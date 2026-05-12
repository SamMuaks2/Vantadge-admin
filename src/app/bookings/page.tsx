"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Clock, Send, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Booking {
  _id: string;
  user: { name: string; email: string };
  slot: { date: string; startTime: string; endTime: string; sessionType: string };
  status: "pending" | "approved" | "rejected";
  notes?: string;
  consultationFee?: number;
  createdAt: string;
}

export default function BookingsAdminPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [fee, setFee] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", filter],
    queryFn: async () => {
      const res = await api.get(`/bookings?status=${filter === "all" ? "" : filter}`);
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, feeAmount }: { id: string; feeAmount: number }) => {
      const res = await api.patch(`/bookings/${id}/approve`, { consultationFee: feeAmount });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Booking approved! Quote email sent.");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setSelectedBooking(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/bookings/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Booking rejected. Email sent to client.");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setSelectedBooking(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bookings: Booking[] = data?.bookings || [];

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    approved: "bg-brand-mint/10 text-brand-teal border border-brand-mint/20",
    rejected: "bg-red-50 text-red-500 border border-red-100",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Bookings</h1>
          <p className="font-body text-sm text-gray-400">Manage consultation requests</p>
        </div>
        {/* Filter tabs */}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Client", "Session", "Date & Time", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-6 first:pl-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center font-body text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-body font-semibold text-gray-900 text-sm">{b.user?.name}</p>
                      <p className="font-body text-xs text-gray-400">{b.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-body text-sm text-gray-700">{b.slot?.sessionType}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-body text-sm text-gray-700">{b.slot?.date ? format(new Date(b.slot.date), "d MMM yyyy") : "—"}</p>
                      <p className="font-body text-xs text-gray-400">{b.slot?.startTime} — {b.slot?.endTime}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full capitalize ${statusColor[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-body text-xs text-gray-400">{format(new Date(b.createdAt), "d MMM yyyy")}</p>
                    </td>
                    <td className="py-4 px-6">
                      {b.status === "pending" && (
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="font-body text-xs font-semibold text-brand-purple hover:text-brand-purple-light transition-colors flex items-center gap-1"
                        >
                          Review <ChevronDown size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Review Booking</h3>
              <p className="font-body text-sm text-gray-400 mb-6">Client: {selectedBooking.user?.name} ({selectedBooking.user?.email})</p>

              {/* Booking info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Session Type</p>
                    <p className="font-body font-semibold text-gray-800">{selectedBooking.slot?.sessionType}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Date</p>
                    <p className="font-body font-semibold text-gray-800">
                      {selectedBooking.slot?.date ? format(new Date(selectedBooking.slot.date), "d MMM yyyy") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Time</p>
                    <p className="font-body font-semibold text-gray-800">{selectedBooking.slot?.startTime} — {selectedBooking.slot?.endTime}</p>
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="font-body text-xs text-gray-400 mb-1">Client Notes</p>
                    <p className="font-body text-sm text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Approve */}
              <div className="mb-4">
                <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Consultation Fee (£)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g. 50"
                  className="input-base"
                />
                <button
                  disabled={!fee || approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ id: selectedBooking._id, feeAmount: Number(fee) })}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-mint text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-brand-teal transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  {approveMutation.isPending ? "Approving..." : "Approve & Send Quote"}
                </button>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this booking is being rejected..."
                  rows={3}
                  className="input-base resize-none text-sm"
                />
                <button
                  disabled={!rejectReason || rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate({ id: selectedBooking._id, reason: rejectReason })}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <XCircle size={16} />
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Booking"}
                </button>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="mt-4 w-full font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
