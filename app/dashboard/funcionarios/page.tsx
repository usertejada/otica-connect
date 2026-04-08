"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { criarFuncionario, deletarFuncionario } from "@/app/actions/funcionario";
import { UserPlus, Trash2, Shield, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Funcionario {
  id: string;
  nome: string;
  peer_id: string;
  created_at: string;
  role: string;
}

export default function FuncionariosPage() {
  // ✅ createClient() fora do render — instância única
  const supabase = createClient();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);

  const fetchFuncionarios = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("owner_id", user.id)
      .eq("role", "funcionario")
      .order("created_at", { ascending: false });

    setFuncionarios(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSalvando(true);
    // ✅ Chama Server Action — não desloga o admin
    const result = await criarFuncionario(nome, email, senha);

    if (result.error) {
      setErro(result.error);
    } else {
      setSucesso(`Funcionário ${nome} cadastrado com sucesso!`);
      setNome("");
      setEmail("");
      setSenha("");
      fetchFuncionarios();
    }

    setSalvando(false);
  }

  async function handleDeletar(funcionarioId: string) {
    setDeletando(funcionarioId);
    const result = await deletarFuncionario(funcionarioId);

    if (result.error) {
      setErro(result.error);
    } else {
      setFuncionarios((prev) => prev.filter((f) => f.id !== funcionarioId));
    }

    setDeletando(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">Funcionários</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie quem tem acesso ao sistema
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          Apenas administradores
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Novo funcionário
            </h3>
          </div>

          <form onSubmit={handleCadastrar} className="space-y-3">
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className="w-full h-10 px-4 rounded-lg border-l-4 border-l-primary border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full h-10 px-4 rounded-lg border-l-4 border-l-primary border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full h-10 px-4 rounded-lg border-l-4 border-l-primary border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />

            <AnimatePresence>
              {erro && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                >
                  {erro}
                </motion.p>
              )}
              {sucesso && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-700 bg-green-100 rounded-lg px-3 py-2"
                >
                  {sucesso}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={salvando}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Cadastrar
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Funcionários cadastrados
            </h3>
            <span className="text-xs text-muted-foreground">
              {funcionarios.length} no total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhum funcionário ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre um funcionário para ele ter acesso ao sistema
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {funcionarios.map((func, i) => (
                <motion.div
                  key={func.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {func.nome?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{func.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDate(func.created_at)}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                    Funcionário
                  </span>
                  <button
                    onClick={() => handleDeletar(func.id)}
                    disabled={deletando === func.id}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    {deletando === func.id ? (
                      <span className="w-4 h-4 border-2 border-border border-t-destructive rounded-full animate-spin block" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}