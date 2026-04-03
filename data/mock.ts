import { Cliente, Produto, Pedido, Agendamento, Receita, Financeiro, Notificacao } from "@/types/index";

export const clientes: Cliente[] = [
  { id: "1", nome: "Ana Paula Silva", email: "ana@email.com", telefone: "(11) 99999-1111", cidade: "São Paulo", status: "ativo", createdAt: "2024-01-10" },
  { id: "2", nome: "Carlos Mendes", email: "carlos@email.com", telefone: "(11) 99999-2222", cidade: "Campinas", status: "ativo", createdAt: "2024-02-05" },
  { id: "3", nome: "Fernanda Costa", email: "fernanda@email.com", telefone: "(11) 99999-3333", cidade: "Santo André", status: "inativo", createdAt: "2024-03-01" },
  { id: "4", nome: "Ricardo Souza", email: "ricardo@email.com", telefone: "(11) 99999-4444", cidade: "São Paulo", status: "ativo", createdAt: "2024-03-15" },
];

export const produtos: Produto[] = [
  { id: "1", nome: "Armação Ray-Ban RB5154", marca: "Ray-Ban", categoria: "armacao", material: "acetato", preco: 450, estoque: 8, status: "ativo" },
  { id: "2", nome: "Lente Transitions 1.67", marca: "Essilor", categoria: "lente", preco: 320, estoque: 15, status: "ativo" },
  { id: "3", nome: "Óculos Solar Oakley", marca: "Oakley", categoria: "solar", preco: 680, estoque: 0, status: "em_falta" },
  { id: "4", nome: "Armação Silhouette", marca: "Silhouette", categoria: "armacao", material: "titanio", preco: 890, estoque: 3, status: "ativo" },
];

export const pedidos: Pedido[] = [
  { id: "1", clienteId: "1", clienteNome: "Ana Paula Silva", produtos: [{ produtoId: "1", nome: "Armação Ray-Ban", quantidade: 1, preco: 450 }], total: 450, status: "pronto", formaPagamento: "pix", createdAt: "2024-04-01" },
  { id: "2", clienteId: "2", clienteNome: "Carlos Mendes", produtos: [{ produtoId: "2", nome: "Lente Transitions", quantidade: 2, preco: 320 }], total: 640, status: "em_producao", formaPagamento: "parcelado", createdAt: "2024-04-03" },
  { id: "3", clienteId: "4", clienteNome: "Ricardo Souza", produtos: [{ produtoId: "4", nome: "Armação Silhouette", quantidade: 1, preco: 890 }], total: 890, status: "pendente", formaPagamento: "cartao_credito", createdAt: "2024-04-05" },
];

export const agendamentos: Agendamento[] = [
  { id: "1", clienteId: "1", clienteNome: "Ana Paula Silva", data: "2024-04-10", hora: "09:00", tipo: "entrega", status: "confirmado" },
  { id: "2", clienteId: "2", clienteNome: "Carlos Mendes", data: "2024-04-11", hora: "14:30", tipo: "consulta", status: "agendado" },
  { id: "3", clienteId: "4", clienteNome: "Ricardo Souza", data: "2024-04-12", hora: "10:00", tipo: "ajuste", status: "agendado" },
];

export const receitas: Receita[] = [
  {
    id: "1", clienteId: "1", clienteNome: "Ana Paula Silva", medico: "Dr. João Oliveira", data: "2024-03-20",
    olhoDireito: { esferico: "-2.00", cilindrico: "-0.50", eixo: "180", dnp: "32" },
    olhoEsquerdo: { esferico: "-1.75", cilindrico: "-0.25", eixo: "175", dnp: "31" },
    adicao: "+2.00",
  },
];

export const financeiro: Financeiro[] = [
  { id: "1", clienteNome: "Ana Paula Silva", descricao: "Pedido #1", valor: 450, tipo: "entrada", status: "pago", vencimento: "2024-04-01", createdAt: "2024-04-01" },
  { id: "2", clienteNome: "Carlos Mendes", descricao: "Pedido #2 - Parcela 1/3", valor: 213.33, tipo: "entrada", status: "pendente", parcela: "1/3", vencimento: "2024-04-10", createdAt: "2024-04-03" },
  { id: "3", clienteNome: "Ricardo Souza", descricao: "Pedido #3", valor: 890, tipo: "entrada", status: "pendente", vencimento: "2024-04-15", createdAt: "2024-04-05" },
];

export const notificacoes: Notificacao[] = [
  { id: "1", titulo: "Pedido pronto", descricao: "Pedido de Ana Paula Silva está pronto para retirada", tipo: "pedido", lida: false, createdAt: "2024-04-05" },
  { id: "2", titulo: "Estoque em falta", descricao: "Óculos Solar Oakley está sem estoque", tipo: "estoque", lida: false, createdAt: "2024-04-04" },
  { id: "3", titulo: "Agendamento confirmado", descricao: "Ana Paula confirmou entrega para 10/04", tipo: "agendamento", lida: true, createdAt: "2024-04-03" },
];