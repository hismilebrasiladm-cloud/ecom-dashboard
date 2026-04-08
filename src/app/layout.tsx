import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RefreshButton from "@/components/RefreshButton";

export const metadata: Metadata = {
  title: "Ecom Club - Dashboard Comercial",
  description: "Performance comercial Bottrel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen antialiased">
        <Sidebar />
        <main className="flex-1 ml-56 relative z-10">
          <div className="flex items-center justify-end px-8 pt-4">
            <RefreshButton />
          </div>
          <div className="px-8 pb-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
