"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function criarFuncionario(
  nome: string,
  email: string,
  senha: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "Apenas administradores podem cadastrar funcionários." };
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome,
      role: "funcionario",
      owner_id: user.id,
    },
  });

  if (authError) {
    if (
      authError.message.includes("already been registered") ||
      authError.message.includes("already registered")
    ) {
      return { error: "Este e-mail já está cadastrado." };
    }
    if (authError.message.includes("invalid email")) {
      return { error: "E-mail inválido. Verifique o formato." };
    }
    if (
      authError.message.includes("weak password") ||
      authError.message.includes("Password")
    ) {
      return { error: "Senha fraca. Use pelo menos 6 caracteres com letras e números." };
    }
    return { error: authError.message };
  }

  // ✅ Sem insert aqui — o trigger handle_new_user() já insere na profiles!
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

  await adminSupabase.auth.admin.deleteUser(funcionarioId);

  return { success: true };
  // ✅ Sem delete aqui — o trigger on_auth_user_deleted já deleta da profiles!
}