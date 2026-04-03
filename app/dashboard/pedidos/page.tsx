"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, ShoppingCart } from "lucide-react";
import { pedidos as mockPedidos, clientes, produtos } from "@/data/mock";
import { Pedido, Status } from "@/types/index";

// ─── helpers ─────────────────────────────────────────────────────────────────

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
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
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

// ─── modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  pedido?: Pedido | null;
  onClose: () => void;
  onSave: (data: Omit<Pedido, "id" | "createdAt">) => void;
}

function PedidoModal({ pedido, onClose, onSave }: ModalProps) {
  const [clienteId, setClienteId] = useState(pedido?.clienteId ?? "");
  const [produtoId, setProdutoId] = useState(
    pedido?.produtos[0]?.produtoId ?? ""
  );
  const [quantidade, setQuantidade] = useState(
    pedido?.produtos[0]?.quantidade ?? 1
  );
  const [formaPagamento, setFormaPagamento] = useState<Pedido["formaPagamento"]>(
    pedido?.formaPagamento ?? "pix"
  );
  const [status, setStatus] = useState<Status>(pedido?.status ?? "pendente");

  const clienteSelecionado = clientes.find((c) => c.id === clienteId);
  const produtoSelecionado = produtos.find((p) => p.id === produtoId);
  const total = produtoSelecionado ? produtoSelecionado.preco * quantidade : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteSelecionado || !produtoSelecionado) return;

    onSave({
      clienteId,
      clienteNome: clienteSelecionado.nome,
      produtos: [
        {
          produtoId,
          nome: produtoSelecionado.nome,
          quantidade,
          preco: produtoSelecionado.preco,
        },
      ],
      total,
      status,
      formaPagamento,
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
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100"
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
                value={clienteId}
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
                value={produtoId}
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
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as Pedido["formaPagamento"])}
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
          </div>

          {/* Total calculado */}
          {total > 0 && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Total do pedido</span>
              <span className="font-heading font-bold text-foreground text-base">
                {formatCurrency(total)}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {pedido ? "Salvar alterações" : "Criar pedido"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Pedido | null>(null);

  const filtrados = pedidos.filter((p) => {
    const matchBusca =
      p.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      p.id.includes(busca);
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  function handleSave(data: Omit<Pedido, "id" | "createdAt">) {
    if (editando) {
      setPedidos((prev) =>
        prev.map((p) => (p.id === editando.id ? { ...p, ...data } : p))
      );
    } else {
      const novo: Pedido = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPedidos((prev) => [novo, ...prev]);
    }
    setModalOpen(false);
    setEditando(null);
  }

  function handleStatusChange(id: string, novoStatus: Status) {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
    );
  }

  function handleDelete(id: string) {
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  }

  function openEdit(pedido: Pedido) {
    setEditando(pedido);
    setModalOpen(true);
  }

  function openNew() {
    setEditando(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou nº do pedido…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filtro status */}
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

        {/* Botão novo */}
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>

      {/* ── Tabela ── */}
      {filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum pedido encontrado.</p>
        </div>
      ) : (
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
                      <p className="font-medium text-foreground">#{pedido.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {pedido.produtos.length} item(s)
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{pedido.clienteNome}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {pagamentoLabel(pedido.formaPagamento)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(pedido.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(pedido.total)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Troca rápida de status inline */}
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
                          onClick={() => openEdit(pedido)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pedido.id)}
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

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <PedidoModal
            pedido={editando}
            onClose={() => { setModalOpen(false); setEditando(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}