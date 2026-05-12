// "use client";
// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import { UserPlus, Shield, Ban, Trash2, Key, MoreVertical } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import api from "@/lib/api";
// import toast from "react-hot-toast";
// import { format } from "date-fns";

// const ROLES = ["admin", "finance", "pa", "trainer", "communications"] as const;
// type AdminRole = (typeof ROLES)[number];

// interface AdminUser {
//   _id: string;
//   name: string;
//   email: string;
//   adminRole: AdminRole;
//   suspended: boolean;
//   createdAt: string;
//   lastLogin?: string;
// }

// const createSchema = z.object({
//   name: z.string().min(2),
//   email: z.string().email(),
//   password: z.string().min(8),
//   adminRole: z.enum(ROLES),
// });

// type CreateFormData = z.infer<typeof createSchema>;

// const roleColors: Record<AdminRole, string> = {
//   admin: "bg-brand-purple/10 text-brand-purple",
//   finance: "bg-green-50 text-green-600",
//   pa: "bg-blue-50 text-blue-600",
//   trainer: "bg-brand-mint/10 text-brand-teal",
//   communications: "bg-amber-50 text-amber-600",
// };

// export default function UsersAdminPage() {
//   const queryClient = useQueryClient();
//   const [showCreate, setShowCreate] = useState(false);
//   const [actionMenu, setActionMenu] = useState<string | null>(null);
//   const [changePasswordFor, setChangePasswordFor] = useState<AdminUser | null>(null);
//   const [newPassword, setNewPassword] = useState("");

//   const { data: adminUsers = [], isLoading } = useQuery<AdminUser[]>({
//     queryKey: ["admin-users"],
//     queryFn: async () => {
//       const res = await api.get("/admin/users");
//       return res.data;
//     },
//   });

//   const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFormData>({
//     resolver: zodResolver(createSchema),
//     defaultValues: { adminRole: "pa" },
//   });

//   const createMutation = useMutation({
//     mutationFn: async (data: CreateFormData) => {
//       const res = await api.post("/admin/users", data);
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("Admin user created & synced to Firebase");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       setShowCreate(false);
//       reset();
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   const suspendMutation = useMutation({
//     mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
//       const res = await api.patch(`/admin/users/${id}/suspend`, { suspended: suspend });
//       return res.data;
//     },
//     onSuccess: (_, vars) => {
//       toast.success(vars.suspend ? "Account suspended" : "Account reactivated");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const res = await api.delete(`/admin/users/${id}`);
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("User deleted from all systems");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   const changePasswordMutation = useMutation({
//     mutationFn: async ({ id, password }: { id: string; password: string }) => {
//       const res = await api.patch(`/admin/users/${id}/password`, { password });
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("Password changed in all systems");
//       setChangePasswordFor(null);
//       setNewPassword("");
//     },
//     onError: (err: any) => toast.error(err.message),
//   });

//   return (
//     <div className="p-6 md:p-8 max-w-7xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Admin Users</h1>
//           <p className="font-body text-sm text-gray-400">Role-based access control</p>
//         </div>
//         <button
//           onClick={() => setShowCreate(true)}
//           className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
//         >
//           <UserPlus size={16} />
//           Add Staff
//         </button>
//       </div>

//       {/* Role Legend */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
//         {ROLES.map((role) => (
//           <div key={role} className={`rounded-xl px-4 py-2.5 text-center ${roleColors[role]}`}>
//             <p className="font-body text-xs font-bold capitalize">{role}</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-gray-100 bg-gray-50/50">
//               {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map((h) => (
//                 <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-6">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading ? (
//               Array.from({ length: 4 }).map((_, i) => (
//                 <tr key={i} className="border-b border-gray-50">
//                   {Array.from({ length: 6 }).map((_, j) => (
//                     <td key={j} className="py-4 px-6"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
//                   ))}
//                 </tr>
//               ))
//             ) : adminUsers.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="py-12 text-center font-body text-gray-400">No admin users found</td>
//               </tr>
//             ) : (
//               adminUsers.map((u) => (
//                 <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
//                   <td className="py-4 px-6">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
//                         {u.name?.[0]?.toUpperCase()}
//                       </div>
//                       <span className="font-body font-semibold text-sm text-gray-800">{u.name}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6 font-body text-sm text-gray-500">{u.email}</td>
//                   <td className="py-4 px-6">
//                     <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full capitalize ${roleColors[u.adminRole]}`}>
//                       <Shield size={10} className="inline mr-1" />
//                       {u.adminRole}
//                     </span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full ${
//                       u.suspended ? "bg-red-50 text-red-500" : "bg-brand-mint/10 text-brand-teal"
//                     }`}>
//                       {u.suspended ? "Suspended" : "Active"}
//                     </span>
//                   </td>
//                   <td className="py-4 px-6 font-body text-xs text-gray-400">
//                     {u.lastLogin ? format(new Date(u.lastLogin), "d MMM, HH:mm") : "Never"}
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="relative">
//                       <button
//                         onClick={() => setActionMenu(actionMenu === u._id ? null : u._id)}
//                         className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
//                       >
//                         <MoreVertical size={16} />
//                       </button>
//                       <AnimatePresence>
//                         {actionMenu === u._id && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.95, y: -5 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.95, y: -5 }}
//                             className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden"
//                           >
//                             <button
//                               onClick={() => { setChangePasswordFor(u); setActionMenu(null); }}
//                               className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-gray-700 hover:bg-gray-50 transition-colors"
//                             >
//                               <Key size={14} className="text-brand-purple" />
//                               Change Password
//                             </button>
//                             <button
//                               onClick={() => { suspendMutation.mutate({ id: u._id, suspend: !u.suspended }); setActionMenu(null); }}
//                               className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-gray-700 hover:bg-gray-50 transition-colors"
//                             >
//                               <Ban size={14} className="text-amber-500" />
//                               {u.suspended ? "Reactivate" : "Suspend"}
//                             </button>
//                             <button
//                               onClick={() => { if (confirm("Delete this admin user?")) { deleteMutation.mutate(u._id); setActionMenu(null); } }}
//                               className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
//                             >
//                               <Trash2 size={14} />
//                               Delete Account
//                             </button>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Create Modal */}
//       <AnimatePresence>
//         {showCreate && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
//               <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Add Staff Member</h3>
//               <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-4">
//                 {[
//                   { field: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
//                   { field: "email", label: "Email", type: "email", placeholder: "jane@vantadge.com" },
//                   { field: "password", label: "Initial Password", type: "password", placeholder: "Min 8 characters" },
//                 ].map(({ field, label, type, placeholder }) => (
//                   <div key={field}>
//                     <label className="font-body text-sm font-semibold text-gray-700 block mb-2">{label}</label>
//                     <input {...register(field as keyof CreateFormData)} type={type} placeholder={placeholder} className="input-base" />
//                     {errors[field as keyof typeof errors] && <p className="font-body text-xs text-red-500 mt-1">{errors[field as keyof typeof errors]?.message}</p>}
//                   </div>
//                 ))}
//                 <div>
//                   <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Role</label>
//                   <select {...register("adminRole")} className="input-base">
//                     {ROLES.map((r) => (
//                       <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex gap-3 mt-2">
//                   <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-outline text-sm">Cancel</button>
//                   <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary text-sm disabled:opacity-50">
//                     {createMutation.isPending ? "Creating..." : "Create User"}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Change Password Modal */}
//       <AnimatePresence>
//         {changePasswordFor && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setChangePasswordFor(null); setNewPassword(""); } }}>
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
//               <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Change Password</h3>
//               <p className="font-body text-sm text-gray-400 mb-6">For: {changePasswordFor.name}</p>
//               <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8 chars)" className="input-base mb-4" />
//               <div className="flex gap-3">
//                 <button onClick={() => { setChangePasswordFor(null); setNewPassword(""); }} className="flex-1 btn-outline text-sm">Cancel</button>
//                 <button
//                   disabled={newPassword.length < 8 || changePasswordMutation.isPending}
//                   onClick={() => changePasswordMutation.mutate({ id: changePasswordFor._id, password: newPassword })}
//                   className="flex-1 btn-primary text-sm disabled:opacity-50"
//                 >
//                   {changePasswordMutation.isPending ? "Saving..." : "Update"}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Shield, Ban, Trash2, Key, MoreVertical, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

const ROLES = ["admin", "finance", "pa", "trainer", "communications"] as const;
type AdminRole = (typeof ROLES)[number];

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  adminRole: AdminRole;
  suspended: boolean;
  createdAt: string;
  lastLogin?: string;
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  adminRole: z.enum(ROLES),
});

type CreateFormData = z.infer<typeof createSchema>;

const roleColors: Record<AdminRole, string> = {
  admin: "bg-brand-purple/10 text-brand-purple",
  finance: "bg-green-50 text-green-600",
  pa: "bg-blue-50 text-blue-600",
  trainer: "bg-brand-mint/10 text-brand-teal",
  communications: "bg-amber-50 text-amber-600",
};

// ─── Password helpers ─────────────────────────────────────────────────────────
const WORD_PAIRS = [
  ["Strong", "Fit"], ["Older", "Bolder"], ["Active", "Vital"],
  ["Healthy", "Happy"], ["Power", "Move"], ["Swift", "Surge"],
];
const SPECIALS = ["@", "!", "#", "$", "%", "&"];

function generatePassword(): string {
  const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  const special = SPECIALS[Math.floor(Math.random() * SPECIALS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${pair[0]}${special}${pair[1]}${num}`;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak", color: "bg-red-400" };
  if (score === 3) return { score, label: "Fair", color: "bg-amber-400" };
  if (score === 4) return { score, label: "Good", color: "bg-blue-400" };
  return { score, label: "Strong", color: "bg-brand-mint" };
}

// ─── Reusable password field ──────────────────────────────────────────────────
function PasswordField({
  value,
  onChange,
  placeholder = "Min 8 characters",
  showSuggest = false,
  onSuggest,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showSuggest?: boolean;
  onSuggest?: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const strength = getStrength(value);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Password copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggest = () => {
    const pw = generatePassword();
    onChange(pw);
    onSuggest?.(pw);
    setShow(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-body text-sm font-semibold text-gray-700">Initial Password</label>
        {showSuggest && (
          <button
            type="button"
            onClick={handleSuggest}
            className="flex items-center gap-1.5 font-body text-xs font-semibold text-brand-purple hover:text-brand-purple-light transition-colors"
          >
            <RefreshCw size={11} />
            Suggest password
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-base pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-brand-purple/8 transition-colors"
              title="Copy password"
            >
              {copied ? <Check size={14} className="text-brand-mint" /> : <Copy size={14} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Strength bar */}
      {value && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength.score ? strength.color : "bg-gray-100"
                }`}
              />
            ))}
          </div>
          <p className={`font-body text-xs font-semibold ${
            strength.label === "Weak" ? "text-red-400" :
            strength.label === "Fair" ? "text-amber-500" :
            strength.label === "Good" ? "text-blue-500" :
            "text-brand-teal"
          }`}>
            {strength.label}
          </p>
        </div>
      )}

      {error && <p className="font-body text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [changePasswordFor, setChangePasswordFor] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Controlled password for create form
  const [createPassword, setCreatePassword] = useState("");

  const { data: adminUsers = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data;
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { adminRole: "pa" },
  });

  // Keep RHF and local state in sync for password
  const handlePasswordChange = useCallback((v: string) => {
    setCreatePassword(v);
    setValue("password", v, { shouldValidate: true });
  }, [setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormData) => {
      const res = await api.post("/admin/users", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Admin user created & synced to Firebase");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setCreatePassword("");
      reset();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      const res = await api.patch(`/admin/users/${id}/suspend`, { suspended: suspend });
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.suspend ? "Account suspended" : "Account reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User deleted from all systems");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await api.patch(`/admin/users/${id}/password`, { password });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password changed in all systems");
      setChangePasswordFor(null);
      setNewPassword("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Admin Users</h1>
          <p className="font-body text-sm text-gray-400">Role-based access control</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreatePassword(""); reset({ adminRole: "pa" }); }}
          className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ROLES.map((role) => (
          <div key={role} className={`rounded-xl px-4 py-2.5 text-center ${roleColors[role]}`}>
            <p className="font-body text-xs font-bold capitalize">{role}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left font-body text-xs font-bold text-gray-400 uppercase tracking-wider py-4 px-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-4 px-6"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center font-body text-gray-400">No admin users found</td>
              </tr>
            ) : (
              adminUsers.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-body font-semibold text-sm text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-body text-sm text-gray-500">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full capitalize ${roleColors[u.adminRole]}`}>
                      <Shield size={10} className="inline mr-1" />
                      {u.adminRole}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full ${
                      u.suspended ? "bg-red-50 text-red-500" : "bg-brand-mint/10 text-brand-teal"
                    }`}>
                      {u.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-body text-xs text-gray-400">
                    {u.lastLogin ? format(new Date(u.lastLogin), "d MMM, HH:mm") : "Never"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === u._id ? null : u._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {actionMenu === u._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden"
                          >
                            <button
                              onClick={() => { setChangePasswordFor(u); setNewPassword(""); setActionMenu(null); }}
                              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Key size={14} className="text-brand-purple" />
                              Change Password
                            </button>
                            <button
                              onClick={() => { suspendMutation.mutate({ id: u._id, suspend: !u.suspended }); setActionMenu(null); }}
                              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Ban size={14} className="text-amber-500" />
                              {u.suspended ? "Reactivate" : "Suspend"}
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this admin user?")) { deleteMutation.mutate(u._id); setActionMenu(null); } }}
                              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete Account
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowCreate(false); setCreatePassword(""); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Add Staff Member</h3>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
                  <input {...register("name")} type="text" placeholder="Jane Doe" className="input-base" />
                  {errors.name && <p className="font-body text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Email</label>
                  <input {...register("email")} type="email" placeholder="jane@vantadgefitness.com" className="input-base" />
                  {errors.email && <p className="font-body text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {/* Password with suggestion + show/hide */}
                <PasswordField
                  value={createPassword}
                  onChange={handlePasswordChange}
                  showSuggest
                  error={errors.password?.message}
                />

                {/* Role */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Role</label>
                  <select {...register("adminRole")} className="input-base">
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setShowCreate(false); setCreatePassword(""); }} className="flex-1 btn-outline text-sm">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary text-sm disabled:opacity-50">
                    {createMutation.isPending ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {changePasswordFor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setChangePasswordFor(null); setNewPassword(""); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Change Password</h3>
              <p className="font-body text-sm text-gray-400 mb-6">For: <strong>{changePasswordFor.name}</strong></p>

              <PasswordField
                value={newPassword}
                onChange={setNewPassword}
                placeholder="New password (min 8 chars)"
                showSuggest
              />

              <div className="flex gap-3 mt-5">
                <button onClick={() => { setChangePasswordFor(null); setNewPassword(""); }} className="flex-1 btn-outline text-sm">Cancel</button>
                <button
                  disabled={newPassword.length < 8 || changePasswordMutation.isPending}
                  onClick={() => changePasswordMutation.mutate({ id: changePasswordFor._id, password: newPassword })}
                  className="flex-1 btn-primary text-sm disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Saving..." : "Update"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}