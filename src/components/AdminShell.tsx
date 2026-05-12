"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (status === "loading") return;
    if (!session && !isPublic) {
      router.replace("/auth/login");
    }
  }, [status, session, isPublic, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
          <p className="font-body text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}