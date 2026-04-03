"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, User, Mail, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────
// Substitua pelas suas variáveis de ambiente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  crm?: string;
  status: "ativo" | "inativo";
  created_at: string;
}

type ClienteForm = Omit<Cliente, "id" | "created_at">;

// ─── helpers ─────────────────────────────────────────────────────────────────
function statusClass(status: string) {
  return status === "ativo"
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-600";
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Toast simples ────────────────────────────────────────────────────────────
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

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  cliente?: Cliente | null;
  onClose: () => void;
  onSave: (data: ClienteForm) => Promise<void>;
  saving: boolean;
}

function ClienteModal({ cliente, onClose, onSave, saving }: ModalProps) {
  const [form, setForm] = useState<ClienteForm>({
    nome: cliente?.nome ?? "",
    email: cliente?.email ?? "",
    telefone: cliente?.telefone ?? "",
    cidade: cliente?.cidade ?? "",
    crm: cliente?.crm ?? "",
    status: cliente?.status ?? "ativo",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
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
            {cliente ? "Editar Cliente" : "Novo Cliente"}
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
              <label className="text-sm font-medium text-foreground">Nome completo</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Ana Paula Silva"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(11) 99999-0000"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Cidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Cidade</label>
              <input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                placeholder="Ex: São Paulo"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* CRM */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">CRM <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <input
                value={form.crm ?? ""}
                onChange={(e) => setForm({ ...form, crm: e.target.value })}
                placeholder="Ex: CRM-SP 123456"
                className="h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "ativo" | "inativo" })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ativo">Ativo</option>
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
              {cliente ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
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
            <h3 className="font-semibold text-foreground text-sm">Excluir cliente</h3>
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
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Cliente | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Erro ao carregar clientes.", "error");
    } else {
      setClientes(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // ── Realtime (opcional) ────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("clientes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => {
        fetchClientes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchClientes]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Save (create / update) ─────────────────────────────────────────────────
  async function handleSave(data: ClienteForm) {
    setSaving(true);
    try {
      if (editando) {
        const { error } = await supabase
          .from("clientes")
          .update(data)
          .eq("id", editando.id);

        if (error) throw error;
        showToast("Cliente atualizado com sucesso!", "success");
      } else {
        const { error } = await supabase
          .from("clientes")
          .insert([data]);

        if (error) throw error;
        showToast("Cliente cadastrado com sucesso!", "success");
      }
      setModalOpen(false);
      setEditando(null);
      fetchClientes();
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
      .from("clientes")
      .delete()
      .eq("id", confirmDelete.id);

    if (error) {
      showToast("Erro ao excluir cliente.", "error");
    } else {
      showToast("Cliente excluído.", "success");
      fetchClientes();
    }
    setDeleting(false);
    setConfirmDelete(null);
  }

  // ── Filtro local ───────────────────────────────────────────────────────────
  const filtrados = clientes.filter((c) => {
    const q = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.cidade?.toLowerCase().includes(q) ?? false)
    );
  });

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
            placeholder="Buscar por nome, e-mail ou cidade…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => { setEditando(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Carregando clientes…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtrados.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {busca ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado ainda."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtrados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((cliente, i) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {getInitials(cliente.nome)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      desde {new Date(cliente.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusClass(cliente.status)}`}>
                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1.5">
                {cliente.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                {cliente.cidade && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{cliente.cidade}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-border">
                <button
                  onClick={() => { setEditando(cliente); setModalOpen(true); }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(cliente)}
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
          <ClienteModal
            cliente={editando}
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