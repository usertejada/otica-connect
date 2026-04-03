"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Package } from "lucide-react";
import { produtos as mockProdutos } from "@/data/mock";
import { Produto } from "@/types/index";

// ─── helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  if (status === "ativo") return "bg-green-100 text-green-700";
  if (status === "em_falta") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ativo: "Ativo",
    em_falta: "Em Falta",
    inativo: "Inativo",
  };
  return map[status] ?? status;
}

function categoriaLabel(cat: string) {
  const map: Record<string, string> = {
    armacao: "Armação",
    lente: "Lente",
    solar: "Solar",
    acessorio: "Acessório",
  };
  return map[cat] ?? cat;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CATEGORIAS = ["armacao", "lente", "solar", "acessorio"] as const;

// ─── modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  produto?: Produto | null;
  onClose: () => void;
  onSave: (data: Omit<Produto, "id">) => void;
}

function ProdutoModal({ produto, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    nome: produto?.nome ?? "",
    marca: produto?.marca ?? "",
    categoria: produto?.categoria ?? "armacao",
    material: produto?.material ?? "",
    preco: produto?.preco ?? 0,
    estoque: produto?.estoque ?? 0,
    status: produto?.status ?? "ativo",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      preco: Number(form.preco),
      estoque: Number(form.estoque),
    } as Omit<Produto, "id">);
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
            {produto ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nome */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Nome do produto</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Armação Ray-Ban RB5154"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Marca */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Marca</label>
              <input
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                placeholder="Ex: Ray-Ban"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as Produto["categoria"] })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{categoriaLabel(c)}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Material <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <input
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="Ex: acetato, titânio"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Preço */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Preço (R$)</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Estoque */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Estoque</label>
              <input
                required
                type="number"
                min={0}
                value={form.estoque}
                onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Produto["status"] })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ativo">Ativo</option>
                <option value="em_falta">Em Falta</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-5">
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
              {produto ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);

  const filtrados = produtos.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.marca.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      filtroCategoria === "todos" || p.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  function handleSave(data: Omit<Produto, "id">) {
    if (editando) {
      setProdutos((prev) =>
        prev.map((p) => (p.id === editando.id ? { ...p, ...data } : p))
      );
    } else {
      const novo: Produto = { ...data, id: String(Date.now()) };
      setProdutos((prev) => [novo, ...prev]);
    }
    setModalOpen(false);
    setEditando(null);
  }

  function handleDelete(id: string) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  function openEdit(produto: Produto) {
    setEditando(produto);
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
            placeholder="Buscar por nome ou marca…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filtro categoria */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{categoriaLabel(c)}</option>
          ))}
        </select>

        {/* Botão novo */}
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* ── Tabela ── */}
      {filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Marca</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Material</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Preço</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estoque</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtrados.map((produto, i) => (
                  <motion.tr
                    key={produto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{produto.nome}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {produto.marca}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {categoriaLabel(produto.categoria)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {produto.material ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(produto.preco)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${produto.estoque === 0 ? "text-destructive" : produto.estoque <= 3 ? "text-yellow-600" : "text-foreground"}`}>
                        {produto.estoque} un.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusClass(produto.status)}`}>
                        {statusLabel(produto.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(produto)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
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
          <ProdutoModal
            produto={editando}
            onClose={() => { setModalOpen(false); setEditando(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}