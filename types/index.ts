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
  createdAt: string;
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
  clienteId: string;
  clienteNome: string;
  produtos: { produtoId: string; nome: string; quantidade: number; preco: number }[];
  total: number;
  status: Status;
  formaPagamento: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "parcelado";
  createdAt: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  hora: string;
  tipo: "consulta" | "entrega" | "ajuste" | "remoto";
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  observacao?: string;
}

export interface Receita {
  id: string;
  clienteId: string;
  clienteNome: string;
  medico?: string;
  data: string;
  olhoDireito: {
    esferico: string;
    cilindrico: string;
    eixo: string;
    dnp: string;
  };
  olhoEsquerdo: {
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
  pedidoId?: string;
  clienteNome: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  status: "pago" | "pendente" | "atrasado";
  parcela?: string;
  vencimento: string;
  createdAt: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "pedido" | "agendamento" | "estoque" | "financeiro";
  lida: boolean;
  createdAt: string;
}