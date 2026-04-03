"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Package, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Produto } from "@/types/index";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── helpers ──────────────────────────────────────────────────────────────────
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

type ProdutoForm = Omit<Produto, "id">;

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
interface ModalProps {
  produto?: Produto | null;
  onClose: () => void;
  onSave: (data: ProdutoForm) => Promise<void>;
  saving: boolean;
}

function ProdutoModal({ produto, onClose, onSave, saving }: ModalProps) {
  const [form, setForm] = useState<ProdutoForm>({
    nome: produto?.nome ?? "",
    marca: produto?.marca ?? "",
    categoria: produto?.categoria ?? "armacao",
    material: produto?.material ?? "",
    preco: produto?.preco ?? 0,
    estoque: produto?.estoque ?? 0,
    status: produto?.status ?? "ativo",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      ...form,
      preco: Number(form.preco),
      estoque: Number(form.estoque),
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
            {produto ? "Editar Produto" : "Novo Produto"}
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
              <label className="text-sm font-medium text-foreground">
                Material <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                value={form.material ?? ""}
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
              {produto ? "Salvar alterações" : "Cadastrar"}
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
            <h3 className="font-semibold text-foreground text-sm">Excluir produto</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir <span className="font-medium text-foreground">{nome}</span>?
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
export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Produto | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      showToast("Erro ao carregar produtos.", "error");
    } else {
      setProdutos(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("produtos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => {
        fetchProdutos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProdutos]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Filtro local ───────────────────────────────────────────────────────────
  const filtrados = produtos.filter((p) => {
    const q = busca.toLowerCase();
    const matchBusca =
      p.nome.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q);
    const matchCategoria =
      filtroCategoria === "todos" || p.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  // ── Save (create / update) ─────────────────────────────────────────────────
  async function handleSave(data: ProdutoForm) {
    setSaving(true);
    try {
      if (editando) {
        const { error } = await supabase
          .from("produtos")
          .update(data)
          .eq("id", editando.id);

        if (error) throw error;
        showToast("Produto atualizado com sucesso!", "success");
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert([data]);

        if (error) throw error;
        showToast("Produto cadastrado com sucesso!", "success");
      }
      setModalOpen(false);
      setEditando(null);
      fetchProdutos();
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
      .from("produtos")
      .delete()
      .eq("id", confirmDelete.id);

    if (error) {
      showToast("Erro ao excluir produto.", "error");
    } else {
      showToast("Produto excluído.", "success");
      fetchProdutos();
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
            placeholder="Buscar por nome ou marca…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

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

        <button
          onClick={() => { setEditando(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Carregando produtos…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtrados.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {busca || filtroCategoria !== "todos"
              ? "Nenhum produto encontrado para esse filtro."
              : "Nenhum produto cadastrado ainda."}
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
                          onClick={() => { setEditando(produto); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(produto)}
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
          <ProdutoModal
            produto={editando}
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
            nome={confirmDelete.nome}
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