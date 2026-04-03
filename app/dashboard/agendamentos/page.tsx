"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Calendar, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Agendamento } from "@/types/index";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipo leve só para o select de clientes no modal
type ClienteSelect = { id: string; nome: string };

// ─── helpers ──────────────────────────────────────────────────────────────────
function statusClass(status: string) {
  if (status === "agendado") return "bg-yellow-100 text-yellow-700";
  if (status === "confirmado") return "bg-blue-100 text-blue-700";
  if (status === "concluido") return "bg-green-100 text-green-700";
  if (status === "cancelado") return "bg-red-100 text-red-700";
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
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const TIPOS = ["consulta", "entrega", "ajuste", "remoto"] as const;
const STATUS_OPTIONS = ["agendado", "confirmado", "concluido", "cancelado"] as const;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
        ${type === "success" ? "bg-green-600 text-white" : "bg-destructive text-destructive-foreground"}`}
    >
      {type === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  );
}

// ─── Modal Criar/Editar ───────────────────────────────────────────────────────
type AgendamentoForm = Omit<Agendamento, "id" | "created_at">;

interface ModalProps {
  agendamento?: Agendamento | null;
  clientes: ClienteSelect[];
  onClose: () => void;
  onSave: (data: AgendamentoForm) => Promise<void>;
  saving: boolean;
}

function AgendamentoModal({ agendamento, clientes, onClose, onSave, saving }: ModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    cliente_id: agendamento?.cliente_id ?? "",
    cliente_nome: agendamento?.cliente_nome ?? "",
    data: agendamento?.data ?? hoje,
    hora: agendamento?.hora ?? "09:00",
    tipo: agendamento?.tipo ?? "consulta",
    status: agendamento?.status ?? "agendado",
    observacao: agendamento?.observacao ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === form.cliente_id);
    if (!cliente) return;

    await onSave({
      cliente_id: form.cliente_id,
      cliente_nome: cliente.nome,
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
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100 disabled:pointer-events-none"
          >
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
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
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
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {agendamento ? "Salvar alterações" : "Agendar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modal Confirmar Delete ───────────────────────────────────────────────────
function ConfirmModal({ nome, onConfirm, onCancel, deleting }: {
  nome: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Excluir agendamento</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o agendamento de{" "}
          <span className="font-medium text-foreground">{nome}</span>?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientesLista, setClientesLista] = useState<ClienteSelect[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Agendamento | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Agendamento | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Fetch agendamentos ─────────────────────────────────────────────────────
  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      showToast("Erro ao carregar agendamentos.", "error");
    } else {
      setAgendamentos(data ?? []);
    }
    setLoading(false);
  }, []);

  // ── Fetch clientes para o select do modal ──────────────────────────────────
  const fetchClientes = useCallback(async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("status", "ativo")
      .order("nome");
    setClientesLista(data ?? []);
  }, []);

  useEffect(() => {
    fetchAgendamentos();
    fetchClientes();
  }, [fetchAgendamentos, fetchClientes]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("agendamentos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => {
        fetchAgendamentos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAgendamentos]);

  // ── Filtro local ───────────────────────────────────────────────────────────
  const filtrados = agendamentos.filter((a) => {
    const matchBusca = a.cliente_nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave(data: AgendamentoForm) {
    setSaving(true);
    try {
      if (editando) {
        const { error } = await supabase
          .from("agendamentos")
          .update(data)
          .eq("id", editando.id);
        if (error) throw error;
        showToast("Agendamento atualizado!", "success");
      } else {
        const { error } = await supabase
          .from("agendamentos")
          .insert([data]);
        if (error) throw error;
        showToast("Agendamento criado!", "success");
      }
      setModalOpen(false);
      setEditando(null);
      fetchAgendamentos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      showToast(`Erro: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from("agendamentos")
      .delete()
      .eq("id", confirmDelete.id);

    if (error) {
      showToast("Erro ao excluir agendamento.", "error");
    } else {
      showToast("Agendamento excluído.", "success");
      fetchAgendamentos();
    }
    setDeleting(false);
    setConfirmDelete(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Toolbar */}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Carregando agendamentos…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtrados.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {busca || filtroStatus !== "todos"
              ? "Nenhum agendamento encontrado para esse filtro."
              : "Nenhum agendamento cadastrado ainda."}
          </p>
        </div>
      )}

      {/* Grid de cards */}
      {!loading && filtrados.length > 0 && (
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
                  <p className="text-sm font-semibold text-foreground leading-tight">{ag.cliente_nome}</p>
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
                  onClick={() => { setEditando(ag); setModalOpen(true); }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(ag)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  aria-label="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {modalOpen && (
          <AgendamentoModal
            agendamento={editando}
            clientes={clientesLista}
            onClose={() => { if (!saving) { setModalOpen(false); setEditando(null); } }}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Modal Confirmar Delete */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            nome={confirmDelete.cliente_nome}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}