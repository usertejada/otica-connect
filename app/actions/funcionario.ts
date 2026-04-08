"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function criarFuncionario(
  nome: string,
  email: string,
  senha: string
) {
  // Cliente normal para pegar o admin logado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  // Verifica se é admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "Apenas administradores podem cadastrar funcionários." };
  }

  // Cliente admin com service role — cria usuário sem deslogar o admin
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // confirma direto, sem e-mail
    });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: authError.message };
  }

  // Insere na tabela profiles
  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: authData.user.id,
    nome,
    role: "funcionario",
    owner_id: user.id,
  });

  if (profileError) return { error: profileError.message };

  return { success: true };
}

export async function deletarFuncionario(funcionarioId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Deleta do Auth também
  await adminSupabase.auth.admin.deleteUser(funcionarioId);

  const { error } = await adminSupabase
    .from("profiles")
    .delete()
    .eq("id", funcionarioId);

  if (error) return { error: error.message };
  return { success: true };
}