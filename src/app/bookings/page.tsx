// "use client";
// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import { Calendar, CheckCircle, XCircle, Clock, Send, ChevronDown } from "lucide-react";
// import api from "@/lib/api";
// import toast from "react-hot-toast";
// import { format } from "date-fns";

// interface Booking {
//   _id: string;
//   user: { name: string; email: string };
//   slot: { date: string; startTime: string; endTime: string; sessionType: string };
//   status: "pending" | "approved" | "rejected";
//   notes?: string;
//   consultationFee?: number;
//   createdAt: string;
// }

// export default function BookingsAdminPage() {
//   const queryClient = useQueryClient();
//   const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
//   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
//   const [fee, setFee] = useState("");
//   const [rejectReason, setRejectReason] = useState("");

//   const { data, isLoading } = useQuery({
//     queryKey: ["admin-bookings", filter],
//     queryFn: async () => {
//       const res = await api.get(`/bookings?status=${filter === "all" ? "" : filter}`);
//       return res.data;
//     },
//   });

//   const approveMutation = useMutation({
//     mutationFn: async ({ id, feeAmount }: { id: string; feeAmount: number }) => {
//       const res = await api.patch(`/bookings/${id}/approve`, { consultationFee: feeAmount });
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("Booking approved! Quote email sent.");
//       queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
//       setSelectedBooking(null);
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   const rejectMutation = useMutation({
//     mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
//       const res = await api.patch(`/bookings/${id}/reject`, { reason });
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("Booking rejected. Email sent to client.");
//       queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
//       setSelectedBooking(null);
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   const bookings: Booking[] = data?.bookings || [];

//   const statusColor: Record<string, string> = {
//     pending: "bg-amber-50 text-amber-600 border border-amber-200",
//     approved: "bg-brand-mint/10 text-brand-teal border border-brand-mint/20",
//     rejected: "bg-red-50 text-red-500 border border-red-100",
//   };

//   return (
//     <div className="p-6 md:p-8 max-w-7xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Bookings</h1>
//           <p className="font-body text-sm text-gray-400">Manage consultation requests</p>
//         </div>
//         {/* Filter tabs */}
//         <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
//           {(["all", "pending", "approved", "rejected"] as const).map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               className={`font-body text-xs font-semibold px-4 py-2 rounded-lg transition-all capitalize ${
//                 filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-100 bg-gray-50/50">
//                 {["Client", "Session", "Date & Time", "Status", "Submitted", "Actions"].map((h) => (
//                   <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-6 first:pl-6">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {isLoading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <tr key={i} className="border-b border-gray-50">
//                     {Array.from({ length: 6 }).map((_, j) => (
//                       <td key={j} className="py-4 px-6">
//                         <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : bookings.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="py-16 text-center font-body text-gray-400">
//                     No bookings found
//                   </td>
//                 </tr>
//               ) : (
//                 bookings.map((b) => (
//                   <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
//                     <td className="py-4 px-6">
//                       <p className="font-body font-semibold text-gray-900 text-sm">{b.user?.name}</p>
//                       <p className="font-body text-xs text-gray-400">{b.user?.email}</p>
//                     </td>
//                     <td className="py-4 px-6">
//                       <p className="font-body text-sm text-gray-700">{b.slot?.sessionType}</p>
//                     </td>
//                     <td className="py-4 px-6">
//                       <p className="font-body text-sm text-gray-700">{b.slot?.date ? format(new Date(b.slot.date), "d MMM yyyy") : "—"}</p>
//                       <p className="font-body text-xs text-gray-400">{b.slot?.startTime} — {b.slot?.endTime}</p>
//                     </td>
//                     <td className="py-4 px-6">
//                       <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full capitalize ${statusColor[b.status]}`}>
//                         {b.status}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <p className="font-body text-xs text-gray-400">{format(new Date(b.createdAt), "d MMM yyyy")}</p>
//                     </td>
//                     <td className="py-4 px-6">
//                       {b.status === "pending" && (
//                         <button
//                           onClick={() => setSelectedBooking(b)}
//                           className="font-body text-xs font-semibold text-brand-purple hover:text-brand-purple-light transition-colors flex items-center gap-1"
//                         >
//                           Review <ChevronDown size={12} />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Review Modal */}
//       <AnimatePresence>
//         {selectedBooking && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//             onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
//             >
//               <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Review Booking</h3>
//               <p className="font-body text-sm text-gray-400 mb-6">Client: {selectedBooking.user?.name} ({selectedBooking.user?.email})</p>

//               {/* Booking info */}
//               <div className="bg-gray-50 rounded-2xl p-4 mb-6">
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="font-body text-xs text-gray-400 mb-1">Session Type</p>
//                     <p className="font-body font-semibold text-gray-800">{selectedBooking.slot?.sessionType}</p>
//                   </div>
//                   <div>
//                     <p className="font-body text-xs text-gray-400 mb-1">Date</p>
//                     <p className="font-body font-semibold text-gray-800">
//                       {selectedBooking.slot?.date ? format(new Date(selectedBooking.slot.date), "d MMM yyyy") : "—"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-body text-xs text-gray-400 mb-1">Time</p>
//                     <p className="font-body font-semibold text-gray-800">{selectedBooking.slot?.startTime} — {selectedBooking.slot?.endTime}</p>
//                   </div>
//                 </div>
//                 {selectedBooking.notes && (
//                   <div className="mt-3 pt-3 border-t border-gray-200">
//                     <p className="font-body text-xs text-gray-400 mb-1">Client Notes</p>
//                     <p className="font-body text-sm text-gray-700">{selectedBooking.notes}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Approve */}
//               <div className="mb-4">
//                 <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Consultation Fee (£)</label>
//                 <input
//                   type="number"
//                   value={fee}
//                   onChange={(e) => setFee(e.target.value)}
//                   placeholder="e.g. 50"
//                   className="input-base"
//                 />
//                 <button
//                   disabled={!fee || approveMutation.isPending}
//                   onClick={() => approveMutation.mutate({ id: selectedBooking._id, feeAmount: Number(fee) })}
//                   className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-mint text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-brand-teal transition-colors disabled:opacity-50"
//                 >
//                   <CheckCircle size={16} />
//                   {approveMutation.isPending ? "Approving..." : "Approve & Send Quote"}
//                 </button>
//               </div>

//               <div className="border-t border-gray-100 pt-4">
//                 <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Rejection Reason</label>
//                 <textarea
//                   value={rejectReason}
//                   onChange={(e) => setRejectReason(e.target.value)}
//                   placeholder="Explain why this booking is being rejected..."
//                   rows={3}
//                   className="input-base resize-none text-sm"
//                 />
//                 <button
//                   disabled={!rejectReason || rejectMutation.isPending}
//                   onClick={() => rejectMutation.mutate({ id: selectedBooking._id, reason: rejectReason })}
//                   className="mt-3 w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
//                 >
//                   <XCircle size={16} />
//                   {rejectMutation.isPending ? "Rejecting..." : "Reject Booking"}
//                 </button>
//               </div>

//               <button
//                 onClick={() => setSelectedBooking(null)}
//                 className="mt-4 w-full font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 Cancel
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, CheckCircle, XCircle, Clock, Send, ChevronDown,
  Plus, Trash2, X, CalendarPlus,
} from "lucide-react";
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

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  available: boolean;
}

const SESSION_TYPES = [
  "Initial Consultation",
  "Strength & Conditioning",
  "Mobility & Flexibility",
  "Cardio & Endurance",
  "Weight Management",
  "1-on-1 Personal Training",
  "Group Class",
];

export default function BookingsAdminPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [fee, setFee] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "slots">("bookings");

  // Slot form state
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("10:00");
  const [slotType, setSlotType] = useState(SESSION_TYPES[0]);
  const [bulkDays, setBulkDays] = useState<string[]>([]);
  const [bulkWeeks, setBulkWeeks] = useState(1);

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings", filter],
    queryFn: async () => {
      const res = await api.get(`/bookings?status=${filter === "all" ? "" : filter}`);
      return res.data;
    },
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ["admin-slots"],
    queryFn: async () => {
      const res = await api.get("/bookings/slots/available");
      return res.data;
    },
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createSlotMutation = useMutation({
    mutationFn: async (dto: object) => {
      const res = await api.post("/bookings/slots", dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Slot created!");
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/bookings/slots/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Slot deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
    },
    onError: (err: any) => toast.error(err.message),
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
      setFee("");
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
      setRejectReason("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ─── Slot creation helpers ───────────────────────────────────────────────────
  const handleCreateSingleSlot = () => {
    if (!slotDate) return toast.error("Please select a date");
    createSlotMutation.mutate({
      date: slotDate,
      startTime: slotStart,
      endTime: slotEnd,
      sessionType: slotType,
    });
  };

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_OFFSETS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

  const handleCreateBulkSlots = async () => {
    if (bulkDays.length === 0) return toast.error("Select at least one day");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const promises: Promise<any>[] = [];

    for (let w = 0; w < bulkWeeks; w++) {
      for (const day of bulkDays) {
        const d = new Date(today);
        const offset = ((DAY_OFFSETS[day] - today.getDay() + 7) % 7) + w * 7;
        d.setDate(today.getDate() + offset);
        promises.push(
          api.post("/bookings/slots", {
            date: d.toISOString().split("T")[0],
            startTime: slotStart,
            endTime: slotEnd,
            sessionType: slotType,
          })
        );
      }
    }

    try {
      await Promise.all(promises);
      toast.success(`Created ${promises.length} slots!`);
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      setShowSlotForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleBulkDay = (d: string) =>
    setBulkDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const bookings: Booking[] = data?.bookings || [];

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    approved: "bg-brand-mint/10 text-brand-teal border border-brand-mint/20",
    rejected: "bg-red-50 text-red-500 border border-red-100",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Bookings</h1>
          <p className="font-body text-sm text-gray-400">Manage consultation requests and available slots</p>
        </div>
        <button
          onClick={() => { setShowSlotForm(true); setActiveTab("slots"); }}
          className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <CalendarPlus size={16} />
          Add Slots
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(["bookings", "slots"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-body text-xs font-semibold px-5 py-2 rounded-lg transition-all capitalize ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "bookings" ? `Bookings${bookings.length ? ` (${bookings.length})` : ""}` : `Available Slots${slots.length ? ` (${slots.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── BOOKINGS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "bookings" && (
        <>
          {/* Filter */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-5">
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

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Client", "Session", "Date & Time", "Status", "Submitted", "Actions"].map((h) => (
                      <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? (
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
                      <td colSpan={6} className="py-16 text-center">
                        <Calendar className="text-gray-200 mx-auto mb-3" size={36} />
                        <p className="font-body text-gray-400 text-sm">No bookings found</p>
                        {filter === "all" && (
                          <p className="font-body text-gray-300 text-xs mt-1">
                            Add available slots so clients can start booking
                          </p>
                        )}
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
                          <p className="font-body text-sm text-gray-700">
                            {b.slot?.date ? format(new Date(b.slot.date), "d MMM yyyy") : "—"}
                          </p>
                          <p className="font-body text-xs text-gray-400">
                            {b.slot?.startTime} — {b.slot?.endTime}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full capitalize ${statusColor[b.status]}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-body text-xs text-gray-400">
                            {format(new Date(b.createdAt), "d MMM yyyy")}
                          </p>
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
        </>
      )}

      {/* ── SLOTS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "slots" && (
        <>
          {slotsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <Calendar className="text-gray-200 mx-auto mb-4" size={48} />
              <h3 className="font-display font-bold text-gray-900 text-lg mb-2">No slots yet</h3>
              <p className="font-body text-gray-400 text-sm mb-6">
                Create available slots so clients can book consultations.
              </p>
              <button
                onClick={() => setShowSlotForm(true)}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus size={14} /> Create First Slot
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <motion.div
                  key={slot._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between group"
                >
                  <div>
                    <p className="font-body font-semibold text-gray-800 text-sm mb-1">
                      {slot.sessionType}
                    </p>
                    <p className="font-display font-bold text-gray-900">
                      {format(new Date(slot.date), "EEE d MMM yyyy")}
                    </p>
                    <p className="font-body text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {slot.startTime} — {slot.endTime}
                    </p>
                    <span className="inline-block mt-2 font-body text-xs font-bold px-2.5 py-1 rounded-full bg-brand-mint/10 text-brand-teal">
                      Available
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Delete this slot?")) deleteSlotMutation.mutate(slot._id);
                    }}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── SLOT CREATION MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showSlotForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowSlotForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-gray-900">Create Available Slots</h3>
                <button
                  onClick={() => setShowSlotForm(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Session type + time */}
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                    Session Type
                  </label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="input-base"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={slotStart}
                      onChange={(e) => setSlotStart(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={slotEnd}
                      onChange={(e) => setSlotEnd(e.target.value)}
                      className="input-base"
                    />
                  </div>
                </div>
              </div>

              {/* Single slot */}
              <div className="border border-gray-100 rounded-2xl p-5 mb-4">
                <p className="font-body text-sm font-semibold text-gray-700 mb-3">
                  Single Slot
                </p>
                <input
                  type="date"
                  value={slotDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="input-base mb-3"
                />
                <button
                  onClick={handleCreateSingleSlot}
                  disabled={createSlotMutation.isPending || !slotDate}
                  className="btn-primary w-full text-sm justify-center flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={14} />
                  {createSlotMutation.isPending ? "Creating..." : "Add Single Slot"}
                </button>
              </div>

              {/* Bulk slots */}
              <div className="border border-gray-100 rounded-2xl p-5">
                <p className="font-body text-sm font-semibold text-gray-700 mb-3">
                  Recurring Slots
                </p>
                <p className="font-body text-xs text-gray-400 mb-3">
                  Select days of the week to create slots for the next N weeks
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleBulkDay(d)}
                      className={`font-body text-xs font-semibold w-11 h-11 rounded-xl transition-all ${
                        bulkDays.includes(d)
                          ? "bg-brand-gradient text-white shadow-md"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <label className="font-body text-sm text-gray-600 shrink-0">
                    Weeks ahead:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={bulkWeeks}
                    onChange={(e) => setBulkWeeks(Number(e.target.value))}
                    className="input-base w-24"
                  />
                  <span className="font-body text-xs text-gray-400">
                    = {bulkDays.length * bulkWeeks} slot{bulkDays.length * bulkWeeks !== 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  onClick={handleCreateBulkSlots}
                  disabled={bulkDays.length === 0}
                  className="btn-primary w-full text-sm justify-center flex items-center gap-2 disabled:opacity-50"
                >
                  <CalendarPlus size={14} />
                  Create {bulkDays.length * bulkWeeks || 0} Recurring Slots
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOOKING REVIEW MODAL ─────────────────────────────────────────── */}
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
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                Review Booking
              </h3>
              <p className="font-body text-sm text-gray-400 mb-6">
                Client: {selectedBooking.user?.name} ({selectedBooking.user?.email})
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Session Type</p>
                    <p className="font-body font-semibold text-gray-800">
                      {selectedBooking.slot?.sessionType}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Date</p>
                    <p className="font-body font-semibold text-gray-800">
                      {selectedBooking.slot?.date
                        ? format(new Date(selectedBooking.slot.date), "d MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray-400 mb-1">Time</p>
                    <p className="font-body font-semibold text-gray-800">
                      {selectedBooking.slot?.startTime} — {selectedBooking.slot?.endTime}
                    </p>
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
                <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                  Consultation Fee (£)
                </label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g. 50"
                  className="input-base"
                />
                <button
                  disabled={!fee || approveMutation.isPending}
                  onClick={() =>
                    approveMutation.mutate({ id: selectedBooking._id, feeAmount: Number(fee) })
                  }
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-mint text-white py-3 rounded-xl font-body font-semibold text-sm hover:bg-brand-teal transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  {approveMutation.isPending ? "Approving..." : "Approve & Send Quote"}
                </button>
              </div>

              {/* Reject */}
              <div className="border-t border-gray-100 pt-4">
                <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this booking is being rejected..."
                  rows={3}
                  className="input-base resize-none text-sm"
                />
                <button
                  disabled={!rejectReason || rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({ id: selectedBooking._id, reason: rejectReason })
                  }
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