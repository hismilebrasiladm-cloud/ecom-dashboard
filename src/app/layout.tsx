import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Ecom Club - Dashboard Comercial",
  description: "Performance comercial Bottrel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen antialiased">
        <Sidebar />
        <main className="flex-1 ml-56 p-8 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
