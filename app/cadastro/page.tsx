"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErro("Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    setSucesso(true);
    setLoading(false);
  }

  // ── Tela de sucesso ──
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
        <div className="flex w-full max-w-3xl h-[500px] rounded-2xl shadow-2xl overflow-hidden">

          {/* Lado esquerdo */}
          <div className="hidden sm:flex flex-col justify-between w-[45%] relative overflow-hidden bg-primary p-10">
            <div className="absolute inset-0 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid2)" />
              </svg>
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-white/5" />
              <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,60 C100,100 300,20 400,60 L400,100 L0,100 Z" fill="white"/>
              </svg>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-white text-base">ÓticaVis</span>
            </div>
            <div className="relative z-10">
              <p className="text-white/60 text-xs tracking-widest uppercase mb-2">Quase lá</p>
              <h2 className="font-heading font-bold text-3xl text-white leading-tight mb-4">
                VERIFIQUE<br />SEU E-MAIL
              </h2>
              <div className="w-8 h-0.5 bg-white/40" />
            </div>
            <p className="relative z-10 text-white/30 text-xs">© 2025 ÓticaVis</p>
          </div>

          {/* Lado direito - sucesso */}
          <div className="flex flex-col items-center justify-center w-full sm:w-[55%] bg-background px-8 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Conta criada!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Clique no link para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">

      {/* Card com tamanho fixo */}
      <div className="flex w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Lado esquerdo — visual azul ── */}
        <div className="hidden sm:flex flex-col justify-between w-[45%] relative overflow-hidden bg-primary p-10">
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute bottom-32 right-8 w-3 h-3 rounded-full bg-white/30" />
            <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-white/30" />
            <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,60 C100,100 300,20 400,60 L400,100 L0,100 Z" fill="white"/>
            </svg>
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-white text-base">ÓticaVis</span>
          </div>

          {/* Texto */}
          <div className="relative z-10">
            <p className="text-white/60 text-xs tracking-widest uppercase mb-2">Comece agora</p>
            <h2 className="font-heading font-bold text-3xl text-white leading-tight mb-4">
              CRIE A SUA
            </h2>
            <div className="w-8 h-0.5 bg-white/40" />
          </div>

          <p className="relative z-10 text-white/30 text-xs">© 2025 ÓticaVis</p>
        </div>

        {/* ── Lado direito — formulário ── */}
        <div className="flex flex-col justify-center w-full sm:w-[55%] bg-background px-8 py-10">

          <div className="mb-14">
            <h2 className="font-heading font-bold text-xl text-foreground">Criar conta</h2>
            <p className="text-muted-foreground text-xs mt-1">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">

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

            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha (mín. 6 caracteres)"
                className="w-full h-10 px-4 pr-10 rounded-lg border-l-4 border-l-primary border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type={showSenha ? "text" : "password"}
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Confirmar senha"
              className="w-full h-10 px-4 rounded-lg border-l-4 border-l-primary border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />

            {erro && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed !mt-4"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}