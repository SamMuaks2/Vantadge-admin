"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Reply, Trash2, Circle, Send, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export default function EmailAdminPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["admin-emails"],
    queryFn: async () => {
      const res = await api.get("/contact/messages");
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/contact/messages/${id}/read`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-emails"] }),
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const res = await api.post(`/contact/messages/${id}/reply`, { reply });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Reply sent!");
      queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
      setReplyText("");
      setSelected(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/contact/messages/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
      setSelected(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleOpen = (msg: ContactMessage) => {
    setSelected(msg);
    setReplyText("");
    if (!msg.read) markReadMutation.mutate(msg._id);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          Email Inbox
          {unreadCount > 0 && (
            <span className="bg-brand-purple text-white text-xs font-bold px-2.5 py-1 rounded-full font-body">
              {unreadCount} unread
            </span>
          )}
        </h1>
        <p className="font-body text-sm text-gray-400">Contact form messages from the website</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Message List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="font-body text-xs text-gray-400 font-semibold">{messages.length} messages</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Mail size={32} className="mb-3 text-gray-200" />
                <p className="font-body text-sm">No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => handleOpen(msg)}
                  className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${
                    selected?._id === msg._id ? "bg-brand-purple/5 border-r-2 border-brand-purple" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!msg.read && (
                      <Circle size={7} className="fill-brand-purple text-brand-purple mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0" style={{ marginLeft: msg.read ? "15px" : "0" }}>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`font-body text-sm truncate ${!msg.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {msg.name}
                        </p>
                        <p className="font-body text-xs text-gray-400 shrink-0 ml-2">
                          {format(new Date(msg.createdAt), "d MMM")}
                        </p>
                      </div>
                      <p className="font-body text-xs text-gray-500 truncate mb-1">{msg.subject}</p>
                      <p className="font-body text-xs text-gray-400 truncate">{msg.message}</p>
                      {msg.replied && (
                        <span className="font-body text-xs text-brand-mint font-semibold mt-1 block">✓ Replied</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-lg">{selected.subject}</h3>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    From: <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                  </p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">
                    {format(new Date(selected.createdAt), "EEEE, d MMMM yyyy 'at' HH:mm")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (confirm("Delete this message?")) deleteMutation.mutate(selected._id); }}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                  <p className="font-body text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Reply */}
                <div>
                  <label className="font-body text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <Reply size={14} className="text-brand-purple" />
                    Reply to {selected.name}
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Hi ${selected.name},\n\nThank you for reaching out...`}
                    rows={6}
                    className="input-base resize-none text-sm mb-4"
                  />
                  <button
                    disabled={!replyText.trim() || replyMutation.isPending}
                    onClick={() => replyMutation.mutate({ id: selected._id, reply: replyText })}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Send size={14} />
                    {replyMutation.isPending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8">
              <Mail size={48} className="mb-4" />
              <p className="font-body text-sm text-gray-400">Select a message to read and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
