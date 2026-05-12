"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, User, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import api from "@/lib/api";
import toast from "react-hot-toast";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: session } = useSession();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordForm) => {
    try {
      await api.patch("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSaved(true);
      reset();
      toast.success("Password changed successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  const user = session?.user as any;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}
      <main className="flex-1 p-6 md:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="font-body text-sm text-gray-400">Manage your account preferences</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        >
          <h2 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
            <User size={18} className="text-brand-purple" />
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-body font-semibold text-gray-900">{user?.name || "Admin User"}</p>
              <p className="font-body text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield size={12} className="text-brand-mint" />
                <span className="font-body text-xs text-brand-mint font-semibold capitalize">
                  {user?.adminRole || "admin"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock size={18} className="text-brand-purple" />
            Change Password
          </h2>

          {saved && (
            <div className="flex items-center gap-3 bg-brand-mint/10 border border-brand-mint/20 rounded-xl px-4 py-3 mb-5">
              <CheckCircle size={16} className="text-brand-mint" />
              <p className="font-body text-sm text-brand-teal font-semibold">
                Password changed successfully!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Current password */}
            <div>
              <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("currentPassword")}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="font-body text-xs text-red-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="font-body text-xs text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="font-body text-sm font-semibold text-gray-700 block mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("confirmPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="font-body text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Lock size={14} />
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
