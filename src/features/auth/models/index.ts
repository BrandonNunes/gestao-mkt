export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthTokens {
  accessToken: string;
  usuario: UsuarioPublic;
}

export interface UsuarioPublic {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  perfil: "GESTOR" | "COLABORADOR";
  status: "ATIVO" | "INATIVO";
}
