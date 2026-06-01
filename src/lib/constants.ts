export enum Perfil {
  GESTOR = "GESTOR",
  COLABORADOR = "COLABORADOR",
}

export enum StatusUsuario {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export enum StatusEquipamento {
  DISPONIVEL = "DISPONIVEL",
  EMPRESTADO = "EMPRESTADO",
  MANUTENCAO = "MANUTENCAO",
  AVARIADO = "AVARIADO",
  INATIVO = "INATIVO",
}

export enum StatusCautela {
  ABERTA = "ABERTA",
  EM_USO = "EM_USO",
  ATRASADA = "ATRASADA",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
  PENDENTE = "PENDENTE",
}

export enum TipoChecklist {
  SAIDA = "SAIDA",
  DEVOLUCAO = "DEVOLUCAO",
}

export const PERFIL_LABELS: Record<Perfil, string> = {
  [Perfil.GESTOR]: "Gestor",
  [Perfil.COLABORADOR]: "Colaborador",
};

export const STATUS_USUARIO_LABELS: Record<StatusUsuario, string> = {
  [StatusUsuario.ATIVO]: "Ativo",
  [StatusUsuario.INATIVO]: "Inativo",
};

export const STATUS_EQUIPAMENTO_LABELS: Record<StatusEquipamento, string> = {
  [StatusEquipamento.DISPONIVEL]: "Disponível",
  [StatusEquipamento.EMPRESTADO]: "Emprestado",
  [StatusEquipamento.MANUTENCAO]: "Em Manutenção",
  [StatusEquipamento.AVARIADO]: "Avariado",
  [StatusEquipamento.INATIVO]: "Inativo",
};

export const STATUS_CAUTELA_LABELS: Record<StatusCautela, string> = {
  [StatusCautela.ABERTA]: "Aberta",
  [StatusCautela.EM_USO]: "Em Uso",
  [StatusCautela.ATRASADA]: "Atrasada",
  [StatusCautela.FINALIZADA]: "Finalizada",
  [StatusCautela.CANCELADA]: "Cancelada",
  [StatusCautela.PENDENTE]: "Com Pendência",
};

export const STATUS_CAUTELA_COLORS: Record<StatusCautela, string> = {
  [StatusCautela.ABERTA]: "bg-blue-100 text-blue-800",
  [StatusCautela.EM_USO]: "bg-green-100 text-green-800",
  [StatusCautela.ATRASADA]: "bg-red-100 text-red-800",
  [StatusCautela.FINALIZADA]: "bg-gray-100 text-gray-800",
  [StatusCautela.CANCELADA]: "bg-yellow-100 text-yellow-800",
  [StatusCautela.PENDENTE]: "bg-orange-100 text-orange-800",
};

export const STATUS_EQUIPAMENTO_COLORS: Record<StatusEquipamento, string> = {
  [StatusEquipamento.DISPONIVEL]: "bg-green-100 text-green-800",
  [StatusEquipamento.EMPRESTADO]: "bg-blue-100 text-blue-800",
  [StatusEquipamento.MANUTENCAO]: "bg-yellow-100 text-yellow-800",
  [StatusEquipamento.AVARIADO]: "bg-red-100 text-red-800",
  [StatusEquipamento.INATIVO]: "bg-gray-100 text-gray-800",
};

export const TRANSICOES_EQUIPAMENTO: Record<StatusEquipamento, StatusEquipamento[]> = {
  [StatusEquipamento.DISPONIVEL]: [StatusEquipamento.EMPRESTADO, StatusEquipamento.MANUTENCAO, StatusEquipamento.INATIVO],
  [StatusEquipamento.EMPRESTADO]: [StatusEquipamento.DISPONIVEL, StatusEquipamento.AVARIADO, StatusEquipamento.MANUTENCAO],
  [StatusEquipamento.AVARIADO]: [StatusEquipamento.DISPONIVEL, StatusEquipamento.MANUTENCAO],
  [StatusEquipamento.MANUTENCAO]: [StatusEquipamento.DISPONIVEL],
  [StatusEquipamento.INATIVO]: [StatusEquipamento.DISPONIVEL],
};
