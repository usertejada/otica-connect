"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { financeiro as mockFinanceiro, clientes } from "@/data/mock";
import { Financeiro } from "@/types/index";

// ─── helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  if (status === "pago") return "bg-green-100 text-green-700";
  if (status === "pendente") return "bg-yellow-100 text-yellow-700";
  if (status === "atrasado") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  const map: Record<string, string> = { pago: "Pago", pendente: "Pendente", atrasado: "Atrasado" };
  return map[status] ?? status;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_OPTIONS = ["pago", "pendente", "atrasado"] as const;

// ─── modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  lancamento?: Financeiro | null;
  onClose: () => void;
  onSave: (data: Omit<Financeiro, "id" | "createdAt">) => void;
}

function FinanceiroModal({ lancamento, onClose, onSave }: ModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    clienteNome: lancamento?.clienteNome ?? "",
    descricao: lancamento?.descricao ?? "",
    valor: lancamento?.valor ?? 0,
    tipo: lancamento?.tipo ?? "entrada",
    status: lancamento?.status ?? "pendente",
    parcela: lancamento?.parcela ?? "",
    vencimento: lancamento?.vencimento ?? hoje,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      clienteNome: form.clienteNome,
      descricao: form.descricao,
      valor: Number(form.valor),
      tipo: form.tipo as Financeiro["tipo"],
      status: form.status as Financeiro["status"],
      parcela: form.parcela || undefined,
      vencimento: form.vencimento,
    });
  }

  const inputCls =
    "h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-base text-foreground">
            {lancamento ? "Editar Lançamento" : "Novo Lançamento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Cliente */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Cliente</label>
              <select
                value={form.clienteNome}
                onChange={(e) => setForm({ ...form, clienteNome: e.target.value })}
                className={inputCls}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <input
                required
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Pedido #1 — Armação"
                className={inputCls}
              />
            </div>

            {/* Valor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Valor (R$)</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
                className={inputCls}
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as Financeiro["tipo"] })}
                className={inputCls}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Financeiro["status"] })}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Vencimento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Vencimento</label>
              <input
                type="date"
                required
                value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Parcela */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Parcela <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                value={form.parcela}
                onChange={(e) => setForm({ ...form, parcela: e.target.value })}
                placeholder="Ex: 1/3"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {lancamento ? "Salvar alterações" : "Registrar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Financeiro[]>(mockFinanceiro);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Financeiro | null>(null);

  const filtrados = lancamentos.filter((l) => {
    const matchBusca =
      l.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      l.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // ── stat totals ──
  const totalRecebido = lancamentos
    .filter((l) => l.tipo === "entrada" && l.status === "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalPendente = lancamentos
    .filter((l) => l.status === "pendente")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalAtrasado = lancamentos
    .filter((l) => l.status === "atrasado")
    .reduce((acc, l) => acc + l.valor, 0);

  function handleSave(data: Omit<Financeiro, "id" | "createdAt">) {
    if (editando) {
      setLancamentos((prev) =>
        prev.map((l) => (l.id === editando.id ? { ...l, ...data } : l))
      );
    } else {
      const novo: Financeiro = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLancamentos((prev) => [novo, ...prev]);
    }
    setModalOpen(false);
    setEditando(null);
  }

  function handleDelete(id: string) {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
  }

  function openEdit(l: Financeiro) {
    setEditando(l);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Recebido",
            value: formatCurrency(totalRecebido),
            icon: TrendingUp,
            iconClass: "bg-green-100 text-green-600",
          },
          {
            label: "A Receber",
            value: formatCurrency(totalPendente),
            icon: Clock,
            iconClass: "bg-yellow-100 text-yellow-600",
          },
          {
            label: "Em Atraso",
            value: formatCurrency(totalAtrasado),
            icon: TrendingDown,
            iconClass: "bg-red-100 text-red-600",
          },
        ].map((stat, i) => {
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou descrição…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>

        <button
          onClick={() => { setEditando(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* ── Tabela ── */}
      {filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum lançamento encontrado.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Parcela</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Vencimento</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtrados.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{l.descricao}</p>
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${l.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {l.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.clienteNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {l.parcela ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(l.vencimento)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) =>
                          setLancamentos((prev) =>
                            prev.map((item) =>
                              item.id === l.id
                                ? { ...item, status: e.target.value as Financeiro["status"] }
                                : item
                            )
                          )
                        }
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-ring ${statusClass(l.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(l)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <FinanceiroModal
            lancamento={editando}
            onClose={() => { setModalOpen(false); setEditando(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}