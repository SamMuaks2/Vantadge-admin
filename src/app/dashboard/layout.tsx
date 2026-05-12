"use client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.adminRole;
      if (!role) {
        router.push("/auth/login");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
          <p className="font-body text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
