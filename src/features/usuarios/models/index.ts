export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  telefone: string | null;
  perfil: "GESTOR" | "COLABORADOR";
  status: "ATIVO" | "INATIVO";
  consentimento_lgpd: string | null;
  createdAt: string;
}
