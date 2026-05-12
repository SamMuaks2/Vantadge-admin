"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Dumbbell, X, CheckCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Program {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration: string;
  price: number;
  level: string;
  features: string[];
  tags: string[];
  active: boolean;
}

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Short description required"),
  longDescription: z.string().optional(),
  duration: z.string().min(2, "Duration required (e.g. 12 weeks)"),
  price: z.coerce.number().min(1, "Price must be positive"),
  level: z.string().min(2, "Level required"),
  features: z.array(z.object({ value: z.string() })),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProgramsAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const res = await api.get("/programs");
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      features: [{ value: "" }],
      level: "All Levels",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "features" });

  const openCreate = () => {
    setEditingProgram(null);
    reset({ features: [{ value: "" }], level: "All Levels" });
    setShowForm(true);
  };

  const openEdit = (p: Program) => {
    setEditingProgram(p);
    reset({
      title: p.title,
      description: p.description,
      longDescription: p.longDescription,
      duration: p.duration,
      price: p.price,
      level: p.level,
      features: p.features.map((f) => ({ value: f })),
      tags: p.tags.join(", "),
    });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/programs", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Programme created!");
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      setShowForm(false);
      reset();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/programs/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Programme updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      setShowForm(false);
      setEditingProgram(null);
      reset();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/programs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Programme deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      features: data.features.map((f) => f.value).filter(Boolean),
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const gradients = [
    "from-brand-purple to-brand-purple-light",
    "from-brand-mint to-brand-teal",
    "from-brand-purple to-brand-mint",
    "from-brand-teal to-brand-mint",
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Programmes</h1>
          <p className="font-body text-sm text-gray-400">Manage available fitness programmes and pricing</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Programme
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-100 rounded mb-3 w-2/3" />
              <div className="h-3 bg-gray-100 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <Dumbbell className="text-gray-200 mx-auto mb-3" size={40} />
          <p className="font-body text-gray-400 mb-4">No programmes yet. Create your first one!</p>
          <button onClick={openCreate} className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Create Programme
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, idx) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              <div className={`h-1.5 bg-gradient-to-r ${gradients[idx % gradients.length]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-900 text-lg truncate">{p.title}</h3>
                    <p className="font-body text-xs text-gray-400 mt-0.5">{p.duration} · {p.level}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="font-display text-2xl font-bold gradient-text">£{p.price}</p>
                  </div>
                </div>

                <p className="font-body text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{p.description}</p>

                {p.features.length > 0 && (
                  <ul className="flex flex-col gap-1.5 mb-4">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-2 font-body text-xs text-gray-600">
                        <CheckCircle size={11} className="text-brand-mint shrink-0" />
                        {f}
                      </li>
                    ))}
                    {p.features.length > 3 && (
                      <li className="font-body text-xs text-gray-400 ml-5">+{p.features.length - 3} more</li>
                    )}
                  </ul>
                )}

                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tags.map((tag) => (
                      <span key={tag} className="font-body text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 font-body text-xs font-semibold text-brand-purple bg-brand-purple/8 hover:bg-brand-purple/15 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p._id); }}
                    className="flex items-center gap-1.5 font-body text-xs font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-gray-900">
                  {editingProgram ? "Edit Programme" : "New Programme"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Title *</label>
                  <input {...register("title")} placeholder="e.g. Strength & Conditioning" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors" />
                  {errors.title && <p className="font-body text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Short description */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Short Description *</label>
                  <input {...register("description")} placeholder="One line summary" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors" />
                  {errors.description && <p className="font-body text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                {/* Long description */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Full Description</label>
                  <textarea {...register("longDescription")} rows={4} placeholder="Detailed programme description..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors resize-none" />
                </div>

                {/* Duration, Price, Level */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Duration *</label>
                    <input {...register("duration")} placeholder="12 weeks" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors" />
                    {errors.duration && <p className="font-body text-xs text-red-500 mt-1">{errors.duration.message}</p>}
                  </div>
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Price (£) *</label>
                    <input {...register("price")} type="number" placeholder="299" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors" />
                    {errors.price && <p className="font-body text-xs text-red-500 mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Level *</label>
                    <select {...register("level")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors bg-white">
                      <option>All Levels</option>
                      <option>Beginner-friendly</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-body text-sm font-semibold text-gray-700">Programme Features</label>
                    <button type="button" onClick={() => append({ value: "" })} className="font-body text-xs text-brand-purple font-semibold hover:underline">
                      + Add Feature
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          {...register(`features.${idx}.value`)}
                          placeholder={`Feature ${idx + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors"
                        />
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(idx)} className="p-2.5 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Tags (comma-separated)</label>
                  <input {...register("tags")} placeholder="strength, muscle, functional" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-body text-sm outline-none focus:border-brand-purple transition-colors" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-body font-semibold text-sm text-gray-600 hover:border-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-brand-gradient text-white px-6 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting || createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingProgram
                      ? "Update Programme"
                      : "Create Programme"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
