"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar, Users, CreditCard, MessageSquare, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const { data: recentBookings = [] } = useQuery({
    queryKey: ["recent-bookings"],
    queryFn: async () => {
      const res = await api.get("/bookings?limit=5&sort=-createdAt");
      return res.data.bookings || [];
    },
  });

  const statCards = [
    { label: "Total Members", value: stats?.totalMembers || 0, icon: Users, color: "text-brand-purple", bg: "bg-brand-purple/10", trend: "+12%" },
    { label: "Pending Bookings", value: stats?.pendingBookings || 0, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50", trend: null },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions || 0, icon: CreditCard, color: "text-brand-mint", bg: "bg-brand-mint/10", trend: "+5%" },
    { label: "Pending Testimonials", value: stats?.pendingTestimonials || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50", trend: null },
  ];

  const monthlyData = stats?.monthlyRevenue || [
    { month: "Jan", revenue: 2400 }, { month: "Feb", revenue: 3200 },
    { month: "Mar", revenue: 2800 }, { month: "Apr", revenue: 4100 },
    { month: "May", revenue: 3700 }, { month: "Jun", revenue: 5200 },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="font-body text-sm text-gray-400">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={s.color} size={20} />
              </div>
              {s.trend && (
                <span className="font-body text-xs font-semibold text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} />
                  {s.trend}
                </span>
              )}
            </div>
            <p className="font-display text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
            <p className="font-body text-xs text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-gray-900">Revenue Overview</h3>
            <span className="font-body text-xs text-gray-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B2D8B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7B2D8B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontFamily: "var(--font-dm-sans)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "var(--font-dm-sans)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
              <Tooltip formatter={(v) => [`£${v}`, "Revenue"]} contentStyle={{ fontFamily: "var(--font-dm-sans)", borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="revenue" stroke="#7B2D8B" strokeWidth={2.5} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-display font-bold text-gray-900 mb-5">Recent Bookings</h3>
          <div className="flex flex-col gap-3">
            {recentBookings.length === 0 ? (
              <p className="font-body text-xs text-gray-400 text-center py-6">No bookings yet</p>
            ) : (
              recentBookings.map((b: any) => (
                <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    b.status === "approved" ? "bg-brand-mint/10" :
                    b.status === "rejected" ? "bg-red-50" : "bg-amber-50"
                  }`}>
                    {b.status === "approved" ? <CheckCircle size={16} className="text-brand-mint" /> :
                     b.status === "rejected" ? <XCircle size={16} className="text-red-400" /> :
                     <Clock size={16} className="text-amber-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-xs font-semibold text-gray-800 truncate">{b.user?.name || "Unknown"}</p>
                    <p className="font-body text-xs text-gray-400 truncate">{b.slot?.sessionType}</p>
                  </div>
                  <span className={`font-body text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                    b.status === "approved" ? "bg-brand-mint/10 text-brand-teal" :
                    b.status === "rejected" ? "bg-red-50 text-red-400" :
                    "bg-amber-50 text-amber-500"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
