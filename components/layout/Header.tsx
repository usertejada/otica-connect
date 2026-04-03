"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Crown, Bell, LogOut,
  ShoppingCart, Package, Calendar, DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notificacoes } from "@/data/mock";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const notifIcons: Record<string, React.ElementType> = {
  pedido: ShoppingCart,
  estoque: Package,
  agendamento: Calendar,
  financeiro: DollarSign,
};

const notifColors: Record<string, string> = {
  pedido: "bg-accent/10 text-accent",
  estoque: "bg-destructive/10 text-destructive",
  agendamento: "bg-primary/10 text-primary",
  financeiro: "bg-amber-100 text-amber-600",
};

export function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(notificacoes);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.lida).length;

  // Busca dados do usuário logado
useEffect(() => {
  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email ?? "");

    // Tenta pegar nome dos metadados primeiro (mais rápido)
    const nomeMetadata = user.user_metadata?.nome;
    if (nomeMetadata) setNome(nomeMetadata);

    // Depois confirma com o perfil do banco
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", user.id)
      .single();

    if (profile?.nome) setNome(profile.nome);
  }
  fetchUser();
}, []);

  // Fecha notificações ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Gera iniciais do nome para o avatar
  const iniciais = nome
    ? nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="flex items-center h-16 px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-sm gap-3 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="font-heading font-semibold text-lg text-foreground flex-1">
        {title}
      </h1>

      {/* Premium button */}
      <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold transition-all duration-200 shadow-sm">
        <Crown className="w-3.5 h-3.5" />
        Premium
      </button>

      {/* Notification bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-card border border-border rounded-xl shadow-xl z-40"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm text-foreground">Notificações</span>
                <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                  Marcar tudo como lido
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((notif) => {
                  const Icon = notifIcons[notif.tipo] ?? Bell;
                  const colorClass = notifColors[notif.tipo] ?? "bg-muted text-muted-foreground";
                  return (
                    <div key={notif.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-snug">{notif.titulo}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{notif.descricao}</p>
                      </div>
                      {!notif.lida && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User info + logout */}
      <div className="border-l border-border pl-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center select-none">
          {iniciais}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-medium text-foreground leading-tight">
            {nome || "Carregando..."}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}