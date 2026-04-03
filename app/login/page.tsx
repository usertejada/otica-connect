"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    /* Background cinza claro */
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">

      {/* Card com tamanho fixo — split interno */}
      <div className="flex w-full max-w-3xl h-[500px] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Lado esquerdo — visual azul ── */}
        <div className="hidden sm:flex flex-col justify-between w-[45%] relative overflow-hidden bg-primary p-10">

          {/* Decorações */}
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
            <p className="text-white/60 text-xs tracking-widest uppercase mb-2">Que bom te ver</p>
            <h2 className="font-heading font-bold text-3xl text-white leading-tight mb-4">
              BEM-VINDO
            </h2>
            <div className="w-8 h-0.5 bg-white/40" />
          </div>

          <p className="relative z-10 text-white/30 text-xs">© 2025 ÓticaVis</p>
        </div>

        {/* ── Lado direito — formulário ── */}
        <div className="flex flex-col justify-center w-full sm:w-[55%] bg-background px-8 py-10">

          <div className="mb-6">
            <h2 className="font-heading font-bold text-xl text-foreground">Login Account</h2>
            <p className="text-muted-foreground text-xs mt-1">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

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
                placeholder="Senha"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="accent-primary" />
                Manter conectado
              </label>
              <Link href="/recuperar-senha" className="text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}