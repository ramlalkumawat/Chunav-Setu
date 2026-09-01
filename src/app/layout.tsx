import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { ToastProvider } from "@/lib/context/toast-context";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";

export const metadata: Metadata = {
  title: "Chunav Setu | Election Campaign Management SaaS",
  description:
    "Production-ready lightweight multi-tenant election campaign management platform for Candidates, Booth Teams, and Volunteers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F6F2] text-[#172033] flex flex-col font-sans selection:bg-[#1F3A5F] selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <DemoSwitcher />
            <div className="flex-1 flex flex-col">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
