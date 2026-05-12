"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Calendar, MessageSquare, BookOpen, Dumbbell,
  CreditCard, Users, Mail, Settings, LogOut, Menu, X,
  ChevronRight, Shield
} from "lucide-react";
import logo from "../../public/images/logo-4.png";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/blog", label: "Blog & Content", icon: BookOpen, roles: ["admin", "communications"] },
  { href: "/programs", label: "Programs", icon: Dumbbell, roles: ["admin", "trainer"] },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard, roles: ["admin", "finance"] },
  { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/email", label: "Email Inbox", icon: Mail, roles: ["admin", "pa", "communications"] },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const userRole = (session?.user as any)?.adminRole || "admin";

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-[#0f0f1a] min-h-screen flex flex-col relative border-r border-white/5`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                // src="/images/logo3.png"
                src={logo}
                alt="Vantadge Logo"
                fill
                sizes="80px"
                className="object-contain"
                priority
                // width={40}
                // height={40}
                // className="object-contain"
                // priority
              />
            </div>

            <div>
              <span className="font-script text-xl text-brand-mint block leading-none">
                Vantadge
              </span>

              <span className="font-body text-[10px] text-gray-600 tracking-widest uppercase">
                Admin
              </span>
            </div>
          </div>


          // <div>
          //   <span className="font-script text-xl text-brand-mint block leading-none">
          //     <div className="relative w-10 h-10 shrink-0">
          //       <Image
          //         src="/images/logo.png" 
          //         alt="logo" 
          //         fill 
          //         className="object-contain"
          //       />
          //     </div>
          //     Vantadge
          //   </span>
          //   <span className="font-body text-[10px] text-gray-600 tracking-widest uppercase">Admin</span>
          // </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors ml-auto"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-brand-mint" />
            <span className="font-body text-xs text-brand-mint capitalize font-semibold">{userRole}</span>
          </div>
          <p className="font-body text-xs text-gray-600 mt-0.5 truncate">{session?.user?.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-brand-gradient text-white shadow-lg shadow-brand-purple/25"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="font-body text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-60" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
              {session?.user?.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-semibold text-white truncate">{session?.user?.name}</p>
              <p className="font-body text-xs text-gray-600 truncate">{session?.user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="font-body text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
