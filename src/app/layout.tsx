import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSocial — Enterprise Social Media Management SaaS",
  description:
    "Production-grade social media management platform featuring Buffer-style smart queueing, Sprout Social 3-pane unified engagement inbox, AI repurposing copilot, and multi-network executive analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600/20 selection:text-blue-900 min-h-screen relative">
        <div className="ambient-mesh" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
