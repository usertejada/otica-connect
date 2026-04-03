"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const pageTitles: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/dashboard/clientes":     "Clientes",
  "/dashboard/produtos":     "Produtos",
  "/dashboard/pedidos":      "Pedidos",
  "/dashboard/receitas":     "Receitas",
  "/dashboard/agendamentos": "Agendamentos",
  "/dashboard/financeiro":   "Financeiro",
  "/dashboard/remoto":       "Atendimento Remoto",
  "/dashboard/funcionarios": "Funcionários",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "ÓticaVis";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={pathname}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Header
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}