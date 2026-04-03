"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Calendar } from "lucide-react";
import { agendamentos as mockAgendamentos, clientes } from "@/data/mock";
import { Agendamento } from "@/types/index";

// ─── helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  if (["agendado"].includes(status)) return "bg-yellow-100 text-yellow-700";
  if (["confirmado"].includes(status)) return "bg-blue-100 text-blue-700";
  if (["concluido"].includes(status)) return "bg-green-100 text-green-700";
  if (["cancelado"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
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

function tipoClass(tipo: string) {
  const map: Record<string, string> = {
    consulta: "bg-purple-100 text-purple-700",
    entrega: "bg-accent/10 text-accent",
    ajuste: "bg-amber-100 text-amber-700",
    remoto: "bg-primary/10 text-primary",
  };
  return map[tipo] ?? "bg-gray-100 text-gray-600";
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const TIPOS = ["consulta", "entrega", "ajuste", "remoto"] as const;
const STATUS_OPTIONS = ["agendado", "confirmado", "concluido", "cancelado"] as const;

// ─── modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  agendamento?: Agendamento | null;
  onClose: () => void;
  onSave: (data: Omit<Agendamento, "id">) => void;
}

function AgendamentoModal({ agendamento, onClose, onSave }: ModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    clienteId: agendamento?.clienteId ?? "",
    data: agendamento?.data ?? hoje,
    hora: agendamento?.hora ?? "09:00",
    tipo: agendamento?.tipo ?? "consulta",
    status: agendamento?.status ?? "agendado",
    observacao: agendamento?.observacao ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === form.clienteId);
    if (!cliente) return;
    onSave({
      clienteId: form.clienteId,
      clienteNome: cliente.nome,
      data: form.data,
      hora: form.hora,
      tipo: form.tipo as Agendamento["tipo"],
      status: form.status as Agendamento["status"],
      observacao: form.observacao || undefined,
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
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
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
                required
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                className={inputCls}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data</label>
              <input
                type="date"
                required
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Hora */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Hora</label>
              <input
                type="time"
                required
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as Agendamento["tipo"] })}
                className={inputCls}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{tipoLabel(t)}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Agendamento["status"] })}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Observação */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Observação <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                placeholder="Anotações sobre o agendamento…"
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {agendamento ? "Salvar alterações" : "Agendar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Agendamento | null>(null);

  const filtrados = agendamentos.filter((a) => {
    const matchBusca = a.clienteNome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  function handleSave(data: Omit<Agendamento, "id">) {
    if (editando) {
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === editando.id ? { ...a, ...data } : a))
      );
    } else {
      setAgendamentos((prev) => [{ ...data, id: String(Date.now()) }, ...prev]);
    }
    setModalOpen(false);
    setEditando(null);
  }

  function handleDelete(id: string) {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }

  function openEdit(ag: Agendamento) {
    setEditando(ag);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente…"
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
          Novo Agendamento
        </button>
      </div>

      {/* ── Grid de cards ── */}
      {filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((ag, i) => (
            <motion.div
              key={ag.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{ag.clienteNome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(ag.data)} às {ag.hora}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusClass(ag.status)}`}>
                  {statusLabel(ag.status)}
                </span>
              </div>

              {/* Tipo */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipoClass(ag.tipo)}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tipoClass(ag.tipo)}`}>
                  {tipoLabel(ag.tipo)}
                </span>
              </div>

              {/* Observação */}
              {ag.observacao && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
                  {ag.observacao}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-border">
                <button
                  onClick={() => openEdit(ag)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ag.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <AgendamentoModal
            agendamento={editando}
            onClose={() => { setModalOpen(false); setEditando(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}