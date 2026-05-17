import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import React from "react";

export const metadata: Metadata = {
  title: "Void Intelligence",
  description: "Your private intelligence graph in absolute darkness.",
  applicationName: "Void Intelligence",
  appleWebApp: {
    capable: true,
    title: "Void Intel",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[#030712] text-gray-200 overflow-x-hidden">
        <main className="min-h-screen relative font-sans">
          {children}
        </main>
        <Toaster position="bottom-right" richColors theme="dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
