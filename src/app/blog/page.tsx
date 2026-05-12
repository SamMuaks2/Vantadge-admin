"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Youtube, Trash2, Eye, Plus, X, Upload } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

type ContentType = "article" | "youtube";

interface BlogPost {
  _id: string;
  type: ContentType;
  title: string;
  content?: string;
  youtubeUrl?: string;
  thumbnail?: string;
  tags: string[];
  publishedAt: string;
  author: { name: string };
}

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("article");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string; youtubeUrl?: string; thumbnail?: string }>();

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: "<p>Start writing your article here...</p>",
  });

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const res = await api.get("/blog?limit=20");
      return res.data.posts || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/blog", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Content published!");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      setShowCreate(false);
      reset();
      editor?.commands.clearContent();
      setTags([]);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/blog/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      type: contentType,
      title: data.title,
      content: contentType === "article" ? editor?.getHTML() : undefined,
      youtubeUrl: contentType === "youtube" ? data.youtubeUrl : undefined,
      thumbnail: data.thumbnail,
      tags,
    });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const ToolbarButton = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-colors ${
        active ? "bg-brand-purple text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Blog & Content</h1>
          <p className="font-body text-sm text-gray-400">Articles, YouTube videos & Shorts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-3 rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Content
        </button>
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
              <div className="h-32 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <PenLine className="text-gray-200 mx-auto mb-3" size={40} />
          <p className="font-body text-gray-400">No content yet. Create your first post!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, idx) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Thumbnail / Type indicator */}
              <div className="h-36 bg-brand-gradient-soft flex items-center justify-center relative overflow-hidden">
                {post.type === "youtube" ? (
                  <Youtube className="text-red-400" size={36} />
                ) : (
                  <PenLine className="text-brand-purple/30" size={36} />
                )}
                <span className={`absolute top-3 left-3 font-body text-xs font-bold px-2.5 py-1 rounded-full ${
                  post.type === "youtube" ? "bg-red-50 text-red-500" : "bg-brand-purple/10 text-brand-purple"
                }`}>
                  {post.type === "youtube" ? "YouTube" : "Article"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors">
                  {post.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="font-body text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-gray-400">{format(new Date(post.publishedAt), "d MMM yyyy")}</p>
                  <button
                    onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post._id); }}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-gray-900">Create New Content</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                  <X size={18} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-3 mb-6">
                {(["article", "youtube"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setContentType(type)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold text-sm transition-all ${
                      contentType === type
                        ? "bg-brand-gradient text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type === "article" ? <PenLine size={15} /> : <Youtube size={15} />}
                    {type === "article" ? "Article" : "YouTube Video"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Title *</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter a compelling title..."
                    className="input-base"
                  />
                  {errors.title && <p className="font-body text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {contentType === "youtube" ? (
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">YouTube URL *</label>
                    <input
                      {...register("youtubeUrl", { required: "YouTube URL is required" })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="input-base"
                    />
                    {errors.youtubeUrl && <p className="font-body text-xs text-red-500 mt-1">{errors.youtubeUrl.message}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Content *</label>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-t-xl border border-gray-200 border-b-0">
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>B</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>I</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>H2</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>H3</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>• List</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>1. List</ToolbarButton>
                      <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")}>&ldquo;</ToolbarButton>
                    </div>
                    <div className="border-2 border-gray-200 rounded-b-xl focus-within:border-brand-purple transition-colors">
                      <EditorContent
                        editor={editor}
                        className="prose prose-sm max-w-none p-4 min-h-[200px] font-body text-sm text-gray-700 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnail URL */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Thumbnail URL (optional)</label>
                  <input {...register("thumbnail")} placeholder="https://..." className="input-base" />
                </div>

                {/* Tags */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 block mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag and press Enter"
                      className="input-base flex-1"
                    />
                    <button type="button" onClick={addTag} className="px-4 py-3 bg-brand-purple/10 text-brand-purple rounded-xl font-body font-semibold text-sm hover:bg-brand-purple/20 transition-colors">
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1.5 font-body text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                          #{tag}
                          <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-gray-400 hover:text-red-400">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-outline text-sm">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary text-sm disabled:opacity-50">
                    {createMutation.isPending ? "Publishing..." : "Publish"}
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
