"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Pedido, Status } from "@/types/index";

// Tipos leves só para popular os selects do modal
type ClienteSelect = Pick<import("@/types/index").Cliente, "id" | "nome" | "status">;
type ProdutoSelect = Pick<import("@/types/index").Produto, "id" | "nome" | "preco" | "estoque" | "status">;

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── helpers ──────────────────────────────────────────────────────────────────
function statusClass(status: string) {
  if (["pendente", "em_andamento"].includes(status)) return "bg-yellow-100 text-yellow-700";
  if (["em_producao", "agendado", "confirmado"].includes(status)) return "bg-blue-100 text-blue-700";
  if (["pronto", "pago", "concluido"].includes(status)) return "bg-green-100 text-green-700";
  if (["entregue", "inativo"].includes(status)) return "bg-gray-100 text-gray-600";
  if (["cancelado", "atrasado", "em_falta"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    em_producao: "Em Produção",
    pronto: "Pronto",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

function pagamentoLabel(forma: string) {
  const map: Record<string, string> = {
    dinheiro: "Dinheiro",
    cartao_credito: "Cartão Crédito",
    cartao_debito: "Cartão Débito",
    pix: "Pix",
    parcelado: "Parcelado",
  };
  return map[forma] ?? forma;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_OPTIONS: Status[] = [
  "pendente", "em_producao", "pronto", "entregue", "cancelado",
];

const PAGAMENTO_OPTIONS = [
  "dinheiro", "cartao_credito", "cartao_debito", "pix", "parcelado",
] as const;

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
type PedidoForm = Omit<Pedido, "id" | "created_at">;

interface ModalProps {
  pedido?: Pedido | null;
  clientes: ClienteSelect[];
  produtos: ProdutoSelect[];
  onClose: () => void;
  onSave: (data: PedidoForm) => Promise<void>;
  saving: boolean;
}

function PedidoModal({ pedido, clientes, produtos, onClose, onSave, saving }: ModalProps) {
  const [cliente_id, setClienteId] = useState(pedido?.cliente_id ?? "");
  const [produto_id, setProdutoId] = useState(
    pedido?.produtos[0]?.produto_id ?? ""
  );
  const [quantidade, setQuantidade] = useState(
    pedido?.produtos[0]?.quantidade ?? 1
  );
  const [forma_pagamento, setFormaPagamento] = useState<Pedido["forma_pagamento"]>(
    pedido?.forma_pagamento ?? "pix"
  );
  const [status, setStatus] = useState<Status>(pedido?.status ?? "pendente");

  const clienteSelecionado = clientes.find((c) => c.id === cliente_id);
  const produtoSelecionado = produtos.find((p) => p.id === produto_id);
  const total = produtoSelecionado ? produtoSelecionado.preco * quantidade : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteSelecionado || !produtoSelecionado) return;

    await onSave({
      cliente_id,
      cliente_nome: clienteSelecionado.nome,
      produtos: [
        {
          produto_id,
          nome: produtoSelecionado.nome,
          quantidade,
          preco: produtoSelecionado.preco,
        },
      ],
      total,
      status,
      forma_pagamento,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-base text-foreground">
            {pedido ? "Editar Pedido" : "Novo Pedido"}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100 disabled:pointer-events-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Cliente */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Cliente</label>
              <select
                required
                value={cliente_id}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Produto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Produto</label>
              <select
                required
                value={produto_id}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Quantidade</label>
              <input
                type="number"
                min={1}
                required
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Forma de pagamento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Forma de pagamento</label>
              <select
                value={forma_pagamento}
                onChange={(e) => setFormaPagamento(e.target.value as Pedido["forma_pagamento"])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PAGAMENTO_OPTIONS.map((p) => (
                  <option key={p} value={p}>{pagamentoLabel(p)}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Total calculado */}
            {produtoSelecionado && (
              <div className="sm:col-span-2 bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total estimado</span>
                <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
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
              {pedido ? "Salvar alterações" : "Criar pedido"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modal Confirmar Delete ───────────────────────────────────────────────────
function ConfirmModal({ label, onConfirm, onCancel, deleting }: {
  label: string;
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
            <h3 className="font-semibold text-foreground text-sm">Excluir pedido</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o pedido de <span className="font-medium text-foreground">{label}</span>?
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
export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientesLista, setClientesLista] = useState<ClienteSelect[]>([]);
  const [produtosLista, setProdutosLista] = useState<ProdutoSelect[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Pedido | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Pedido | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Fetch pedidos ──────────────────────────────────────────────────────────
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Erro ao carregar pedidos.", "error");
    } else {
      setPedidos(data ?? []);
    }
    setLoading(false);
  }, []);

  // ── Fetch clientes e produtos para os selects do modal ────────────────────
  const fetchSelects = useCallback(async () => {
    const [{ data: cls }, { data: prds }] = await Promise.all([
      supabase.from("clientes").select("id, nome, status").eq("status", "ativo").order("nome"),
      supabase.from("produtos").select("id, nome, preco, estoque, status").neq("status", "inativo").order("nome"),
    ]);
    setClientesLista(cls ?? []);
    setProdutosLista(prds ?? []);
  }, []);

  useEffect(() => {
    fetchPedidos();
    fetchSelects();
  }, [fetchPedidos, fetchSelects]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("pedidos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPedidos]);

  // ── Filtro local ───────────────────────────────────────────────────────────
  const filtrados = pedidos.filter((p) => {
    const q = busca.toLowerCase();
    const matchBusca =
      p.cliente_nome.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave(data: PedidoForm) {
    setSaving(true);
    try {
      if (editando) {
        const { error } = await supabase
          .from("pedidos")
          .update(data)
          .eq("id", editando.id);
        if (error) throw error;
        showToast("Pedido atualizado com sucesso!", "success");
      } else {
        const { error } = await supabase
          .from("pedidos")
          .insert([data]);
        if (error) throw error;
        showToast("Pedido criado com sucesso!", "success");
      }
      setModalOpen(false);
      setEditando(null);
      fetchPedidos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      showToast(`Erro: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Troca rápida de status inline ─────────────────────────────────────────
  async function handleStatusChange(id: string, novoStatus: Status) {
    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      showToast("Erro ao atualizar status.", "error");
    } else {
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
      );
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", confirmDelete.id);

    if (error) {
      showToast("Erro ao excluir pedido.", "error");
    } else {
      showToast("Pedido excluído.", "success");
      fetchPedidos();
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
            placeholder="Buscar por cliente ou nº do pedido…"
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
          Novo Pedido
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Carregando pedidos…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtrados.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {busca || filtroStatus !== "todos"
              ? "Nenhum pedido encontrado para esse filtro."
              : "Nenhum pedido cadastrado ainda."}
          </p>
        </div>
      )}

      {/* Tabela */}
      {!loading && filtrados.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pedido</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Pagamento</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtrados.map((pedido, i) => (
                  <motion.tr
                    key={pedido.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground font-mono text-xs">
                        #{pedido.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pedido.produtos.length} item(s)
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{pedido.cliente_nome}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {pagamentoLabel(pedido.forma_pagamento)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(pedido.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(pedido.total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={pedido.status}
                        onChange={(e) => handleStatusChange(pedido.id, e.target.value as Status)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-ring ${statusClass(pedido.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditando(pedido); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(pedido)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label="Deletar"
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

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {modalOpen && (
          <PedidoModal
            pedido={editando}
            clientes={clientesLista}
            produtos={produtosLista}
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
            label={confirmDelete.cliente_nome}
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