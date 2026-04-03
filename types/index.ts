export type Status =
  | "pendente"
  | "em_andamento"
  | "em_producao"
  | "pronto"
  | "entregue"
  | "cancelado"
  | "pago"
  | "atrasado"
  | "agendado"
  | "confirmado"
  | "concluido"
  | "inativo"
  | "em_falta";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  crm?: string;
  status: "ativo" | "inativo";
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  marca: string;
  categoria: "armacao" | "lente" | "solar" | "acessorio";
  material?: string;
  preco: number;
  estoque: number;
  status: "ativo" | "em_falta" | "inativo";
}

export interface Pedido {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  produtos: { produto_id: string; nome: string; quantidade: number; preco: number }[];
  total: number;
  status: Status;
  forma_pagamento: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "parcelado";
  created_at: string;
}

export interface Agendamento {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  data: string;
  hora: string;
  tipo: "consulta" | "entrega" | "ajuste" | "remoto";
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  observacao?: string;
}

export interface Receita {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  medico?: string;
  data: string;
  olho_direito: {
    esferico: string;
    cilindrico: string;
    eixo: string;
    dnp: string;
  };
  olho_esquerdo: {
    esferico: string;
    cilindrico: string;
    eixo: string;
    dnp: string;
  };
  adicao?: string;
  observacao?: string;
}

export interface Financeiro {
  id: string;
  pedido_id?: string;
  cliente_nome: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  status: "pago" | "pendente" | "atrasado";
  parcela?: string;
  vencimento: string;
  created_at: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "pedido" | "agendamento" | "estoque" | "financeiro";
  lida: boolean;
  created_at: string;
}