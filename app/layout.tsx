import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Void Intelligence",
  description: "Your private intelligence graph in absolute darkness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground overflow-x-hidden">
        <Sidebar />
        <main className="md:ml-[260px] min-h-screen relative">
          {children}
        </main>
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}
