import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { ToastProvider } from "@/lib/context/toast-context";
import { LanguageProvider } from "@/lib/i18n";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chunav Setu | Election Campaign Management SaaS",
  description:
    "Enterprise-grade election campaign management platform for Candidates, Booth Committees, and Volunteers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}>
      <body className="min-h-screen bg-[#F7F7F7] text-[#212529] flex flex-col font-sans selection:bg-[#714B67] selection:text-white antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="flex-1 flex flex-col">{children}</div>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
