import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AdminShell } from "@/components/AdminShell";
import { Toaster } from "react-hot-toast";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vantadge Admin",
  description: "Vantadge Fitness Administration Panel",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${dancing.variable}`}
    >
      <body className="font-body antialiased bg-gray-50">
        <Providers>
          <AdminShell>{children}</AdminShell>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                borderRadius: "12px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}