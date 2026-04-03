"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Eye, Trash2, X, FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Receita } from "@/types/index";

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface ClienteOption {
  id: string;
  nome: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// ─── modal visualizar ─────────────────────────────────────────────────────────

function ReceitaViewModal({
  receita,
  onClose,
}: {
  receita: Receita;
  onClose: () => void;
}) {
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
          <div>
            <h2 className="font-heading font-semibold text-base text-foreground">
              Receita — {receita.cliente_nome}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {receita.medico && `Dr(a). ${receita.medico} · `}
              {formatDate(receita.data)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Olho</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Esférico</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Cilíndrico</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Eixo</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">DNP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">OD</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_direito.esferico}</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_direito.cilindrico}</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_direito.eixo}°</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_direito.dnp}</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">OE</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_esquerdo.esferico}</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_esquerdo.cilindrico}</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_esquerdo.eixo}°</td>
                  <td className="px-4 py-2.5 text-center text-foreground">{receita.olho_esquerdo.dnp}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {receita.adicao && (
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 border border-border">
              <span className="text-sm text-muted-foreground">Adição</span>
              <span className="font-heading font-bold text-foreground">{receita.adicao}</span>
            </div>
          )}

          {receita.observacao && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Observação</p>
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
                {receita.observacao}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── modal cadastro ───────────────────────────────────────────────────────────

interface FormState {
  cliente_id: string;
  medico: string;
  data: string;
  odEsferico: string;
  odCilindrico: string;
  odEixo: string;
  odDnp: string;
  oeEsferico: string;
  oeCilindrico: string;
  oeEixo: string;
  oeDnp: string;
  adicao: string;
  observacao: string;
}

function ReceitaFormModal({
  clientes,
  onClose,
  onSave,
}: {
  clientes: ClienteOption[];
  onClose: () => void;
  onSave: (data: Omit<Receita, "id">) => Promise<void>;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<FormState>({
    cliente_id: "",
    medico: "",
    data: hoje,
    odEsferico: "",
    odCilindrico: "",
    odEixo: "",
    odDnp: "",
    oeEsferico: "",
    oeCilindrico: "",
    oeEixo: "",
    oeDnp: "",
    adicao: "",
    observacao: "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === form.cliente_id);
    if (!cliente) return;

    setSaving(true);
    await onSave({
      cliente_id: form.cliente_id,
      cliente_nome: cliente.nome,
      medico: form.medico || undefined,
      data: form.data,
      olho_direito: {
        esferico: form.odEsferico,
        cilindrico: form.odCilindrico,
        eixo: form.odEixo,
        dnp: form.odDnp,
      },
      olho_esquerdo: {
        esferico: form.oeEsferico,
        cilindrico: form.oeCilindrico,
        eixo: form.oeEixo,
        dnp: form.oeDnp,
      },
      adicao: form.adicao || undefined,
      observacao: form.observacao || undefined,
    });
    setSaving(false);
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
        className="bg-card w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-base text-foreground">
            Nova Receita
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cliente + Médico + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Cliente</label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) => set("cliente_id", e.target.value)}
                className={inputCls}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Médico <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                value={form.medico}
                onChange={(e) => set("medico", e.target.value)}
                placeholder="Dr. Nome do Médico"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Data da receita</label>
              <input
                type="date"
                required
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Olho Direito */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground font-heading">
              Olho Direito (OD)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Esférico", field: "odEsferico", placeholder: "-2.00" },
                { label: "Cilíndrico", field: "odCilindrico", placeholder: "-0.50" },
                { label: "Eixo", field: "odEixo", placeholder: "180" },
                { label: "DNP", field: "odDnp", placeholder: "32" },
              ].map(({ label, field, placeholder }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    required
                    value={form[field as keyof FormState]}
                    onChange={(e) => set(field as keyof FormState, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Olho Esquerdo */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground font-heading">
              Olho Esquerdo (OE)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Esférico", field: "oeEsferico", placeholder: "-1.75" },
                { label: "Cilíndrico", field: "oeCilindrico", placeholder: "-0.25" },
                { label: "Eixo", field: "oeEixo", placeholder: "175" },
                { label: "DNP", field: "oeDnp", placeholder: "31" },
              ].map(({ label, field, placeholder }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    required
                    value={form[field as keyof FormState]}
                    onChange={(e) => set(field as keyof FormState, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Adição + Observação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Adição <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                value={form.adicao}
                onChange={(e) => set("adicao", e.target.value)}
                placeholder="+2.00"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Observação <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacao}
                onChange={(e) => set("observacao", e.target.value)}
                placeholder="Anotações adicionais…"
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

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
              disabled={saving}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar receita"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [busca, setBusca] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [visualizando, setVisualizando] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // ── Carrega receitas e clientes do Supabase ──────────────────────────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErro(null);

      const { data: receitasData, error: receitasError } = await supabase
        .from("receitas")
        .select("*")
        .order("created_at", { ascending: false });

      if (receitasError) {
        setErro("Erro ao carregar receitas: " + receitasError.message);
        setLoading(false);
        return;
      }

      setReceitas((receitasData ?? []) as Receita[]);

      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (clientesError) {
        setErro("Erro ao carregar clientes: " + clientesError.message);
        setLoading(false);
        return;
      }

      setClientes((clientesData ?? []) as ClienteOption[]);
      setLoading(false);
    }

    fetchData();
  }, []);

  // ── Filtro de busca ──────────────────────────────────────────────────────
  const filtradas = receitas.filter(
    (r) =>
      r.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.medico?.toLowerCase().includes(busca.toLowerCase()) ?? false)
  );

  // ── Salvar nova receita no Supabase ──────────────────────────────────────
  async function handleSave(data: Omit<Receita, "id">) {
    const { data: inserted, error } = await supabase
      .from("receitas")
      .insert([
        {
          cliente_id: data.cliente_id,
          cliente_nome: data.cliente_nome,
          medico: data.medico ?? null,
          data: data.data,
          olho_direito: data.olho_direito,
          olho_esquerdo: data.olho_esquerdo,
          adicao: data.adicao ?? null,
          observacao: data.observacao ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar receita: " + error.message);
      return;
    }

    if (inserted) {
      setReceitas((prev) => [inserted as Receita, ...prev]);
    }

    setModalForm(false);
  }

  // ── Deletar receita no Supabase ──────────────────────────────────────────
  async function handleDelete(id: string) {
    const { error } = await supabase.from("receitas").delete().eq("id", id);

    if (error) {
      alert("Erro ao deletar receita: " + error.message);
      return;
    }

    setReceitas((prev) => prev.filter((r) => r.id !== id));
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou médico…"
            className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setModalForm(true)}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Receita
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Carregando receitas…</p>
        </div>
      )}

      {/* ── Erro ── */}
      {erro && !loading && (
        <div className="bg-destructive/10 rounded-xl border border-destructive/30 p-6 text-center">
          <p className="text-destructive text-sm">{erro}</p>
        </div>
      )}

      {/* ── Vazio ── */}
      {!loading && !erro && filtradas.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma receita encontrada.</p>
        </div>
      )}

      {/* ── Grid de cards ── */}
      {!loading && !erro && filtradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((receita, i) => (
            <motion.div
              key={receita.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {receita.cliente_nome}
                  </p>
                  {receita.medico && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dr(a). {receita.medico}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  {formatDate(receita.data)}
                </span>
              </div>

              {/* Graus resumidos */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "OD", data: receita.olho_direito },
                  { label: "OE", data: receita.olho_esquerdo },
                ].map(({ label, data }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-3 border border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</p>
                    <div className="space-y-0.5">
                      <p className="text-xs text-foreground">
                        <span className="text-muted-foreground">Esf: </span>{data.esferico}
                      </p>
                      <p className="text-xs text-foreground">
                        <span className="text-muted-foreground">Cil: </span>{data.cilindrico}
                      </p>
                      <p className="text-xs text-foreground">
                        <span className="text-muted-foreground">Eixo: </span>{data.eixo}°
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {receita.adicao && (
                <p className="text-xs text-muted-foreground">
                  Adição: <span className="font-medium text-foreground">{receita.adicao}</span>
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-border">
                <button
                  onClick={() => setVisualizando(receita)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(receita.id)}
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

      {/* ── Modais ── */}
      <AnimatePresence>
        {modalForm && (
          <ReceitaFormModal
            clientes={clientes}
            onClose={() => setModalForm(false)}
            onSave={handleSave}
          />
        )}
        {visualizando && (
          <ReceitaViewModal
            receita={visualizando}
            onClose={() => setVisualizando(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}