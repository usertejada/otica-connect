"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  FileText, Calendar, DollarSign, Video, UserCog, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavItemDef {
  icon: React.ElementType;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItemDef[] = [
  { icon: LayoutDashboard, label: "Dashboard",          href: "/dashboard" },
  { icon: Users,           label: "Clientes",           href: "/dashboard/clientes" },
  { icon: Package,         label: "Produtos",           href: "/dashboard/produtos" },
  { icon: ShoppingCart,    label: "Pedidos",            href: "/dashboard/pedidos" },
  { icon: FileText,        label: "Receitas",           href: "/dashboard/receitas" },
  { icon: Calendar,        label: "Agendamentos",       href: "/dashboard/agendamentos" },
  { icon: DollarSign,      label: "Financeiro",         href: "/dashboard/financeiro" },
  { icon: Video,           label: "Atendimento Remoto", href: "/dashboard/remoto" },
  { icon: UserCog,         label: "Funcionários",       href: "/dashboard/funcionarios", adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
}

function NavItem({
  href, label, active, icon: Icon, onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white transition-all duration-200"
          : "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
      }
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({
  currentPath,
  onNavClick,
}: {
  currentPath: string;
  onNavClick?: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(data?.role === "admin");
    }
    checkRole();
  }, []);

  // Enquanto não carregou, esconde itens adminOnly
  // Depois que carregou, mostra baseado no role
  const filteredNav = navItems.filter((item) => {
    if (!item.adminOnly) return true;
    if (isAdmin === null) return false; // ainda carregando
    return isAdmin;
  });

  return (
    <div className="flex flex-col h-full px-3 py-5">
      <div className="px-3 mb-6">
        <h1 className="font-heading font-bold text-white text-xl">ÓticaVis</h1>
        <p className="text-[10px] text-white/40">Sistema de Gestão</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {filteredNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={currentPath === item.href}
            onClick={onNavClick}
          />
        ))}
      </nav>
      <p className="text-[10px] text-center text-white/40">ÓticaVis v2.0 © 2024</p>
    </div>
  );
}

export function Sidebar({ open, onClose, currentPath }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 z-30 bg-[hsl(224,30%,12%)]">
        <SidebarContent currentPath={currentPath} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col lg:hidden bg-[hsl(224,30%,12%)]"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent currentPath={currentPath} onNavClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}