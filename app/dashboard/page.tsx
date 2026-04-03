"use client";

import { motion } from "framer-motion";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { clientes, pedidos, produtos, agendamentos, financeiro } from "@/data/mock";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pendente: "Pendente",
    em_producao: "Em Produção",
    pronto: "Pronto",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

function statusClass(status: string) {
  if (["pendente", "em_andamento"].includes(status))
    return "bg-yellow-100 text-yellow-700";
  if (["em_producao", "agendado", "confirmado"].includes(status))
    return "bg-blue-100 text-blue-700";
  if (["pronto", "pago", "concluido"].includes(status))
    return "bg-green-100 text-green-700";
  if (["entregue", "inativo"].includes(status))
    return "bg-gray-100 text-gray-600";
  if (["cancelado", "atrasado", "em_falta"].includes(status))
    return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function tipoLabel(tipo: string) {
  const map: Record<string, string> = {
    consulta: "Consulta",
    entrega: "Entrega",
    ajuste: "Ajuste",
    remoto: "Remoto",
  };
  return map[tipo] ?? tipo;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── stat cards data ─────────────────────────────────────────────────────────

const totalFaturamento = financeiro
  .filter((f) => f.status === "pago")
  .reduce((acc, f) => acc + f.valor, 0);

const stats = [
  {
    label: "Clientes",
    value: clientes.filter((c) => c.status === "ativo").length,
    sub: `${clientes.length} no total`,
    icon: Users,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    label: "Pedidos",
    value: pedidos.length,
    sub: `${pedidos.filter((p) => p.status === "pronto").length} prontos`,
    icon: ShoppingCart,
    iconClass: "bg-accent/10 text-accent",
  },
  {
    label: "Produtos",
    value: produtos.filter((p) => p.status === "ativo").length,
    sub: `${produtos.filter((p) => p.status === "em_falta").length} em falta`,
    icon: Package,
    iconClass: "bg-purple-100 text-purple-600",
  },
  {
    label: "Faturamento",
    value: formatCurrency(totalFaturamento),
    sub: "pagamentos recebidos",
    icon: DollarSign,
    iconClass: "bg-amber-100 text-amber-600",
  },
  {
    label: "Agendamentos",
    value: agendamentos.filter((a) => a.status !== "cancelado").length,
    sub: "nos próximos dias",
    icon: Calendar,
    iconClass: "bg-destructive/10 text-destructive",
  },
];

const lowStock = produtos.filter((p) => p.estoque <= 3);

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pedidos Recentes — col-span-2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-sm text-foreground">
              Pedidos Recentes
            </h2>
            <a href="/pedidos" className="text-xs text-primary hover:underline">
              Ver todos
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pedidos.map((pedido, i) => (
                  <motion.tr
                    key={pedido.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{pedido.clienteNome}</p>
                      <p className="text-xs text-muted-foreground">#{pedido.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(pedido.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(pedido.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusClass(pedido.status)}`}>
                        {statusLabel(pedido.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Próximos Agendamentos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-sm text-foreground">
                Próximos Agendamentos
              </h2>
              <a href="/agendamentos" className="text-xs text-primary hover:underline">
                Ver todos
              </a>
            </div>
            <div className="divide-y divide-border">
              {agendamentos.map((ag, i) => (
                <motion.div
                  key={ag.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{ag.clienteNome}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(ag.data)} às {ag.hora} · {tipoLabel(ag.tipo)}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusClass(ag.status)}`}>
                    {ag.status === "confirmado" ? "Confirmado" : "Agendado"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alerta de Estoque Baixo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="font-heading font-semibold text-sm text-foreground">
                Estoque Baixo
              </h2>
            </div>
            <div className="divide-y divide-border">
              {lowStock.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  Nenhum produto com estoque crítico.
                </p>
              ) : (
                lowStock.map((prod, i) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{prod.nome}</p>
                      <p className="text-[11px] text-muted-foreground">{prod.marca}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${prod.estoque === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {prod.estoque === 0 ? "Sem estoque" : `${prod.estoque} un.`}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}