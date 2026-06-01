import { z } from "zod";
import { Perfil, StatusEquipamento } from "./constants";

export const emailSchema = z.string().email("E-mail inválido");

export const senhaSchema = z.string().min(8, "Mínimo de 8 caracteres");

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  novaSenha: senhaSchema,
});

export const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: senhaSchema,
});

export const createUsuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: emailSchema,
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  telefone: z.string().optional(),
  perfil: z.nativeEnum(Perfil),
  senha: senhaSchema,
});

export const updateUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  email: emailSchema.optional(),
  matricula: z.string().min(1).optional(),
  telefone: z.string().optional(),
  perfil: z.nativeEnum(Perfil).optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const createCategoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const createEquipamentoSchema = z.object({
  codigo_patrimonial: z.string().min(1, "Código patrimonial é obrigatório"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoria_id: z.string().uuid(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  descricao: z.string().optional(),
  data_aquisicao: z.string().datetime().optional(),
  valor_aquisicao: z.number().positive().optional(),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

export const updateEquipamentoSchema = createEquipamentoSchema.partial();

export const updateStatusSchema = z.object({
  status: z.nativeEnum(StatusEquipamento),
  observacao: z.string().optional(),
});

export const createAcessorioSchema = z.object({
  nome: z.string().min(2),
  codigo_interno: z.string().optional(),
  descricao: z.string().optional(),
});

export const updateAcessorioSchema = createAcessorioSchema.partial().extend({
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const createCautelaSchema = z.object({
  usuario_id: z.string().uuid(),
  equipamento_ids: z.array(z.string().uuid()).min(1, "Selecione pelo menos um equipamento"),
  data_prevista_retorno: z.string().datetime(),
});

export const emitirCautelaSchema = z.object({
  checklist_id: z.string().uuid(),
  respostas: z.array(z.object({
    pergunta_id: z.string().uuid(),
    resposta: z.boolean(),
  })),
  observacoes: z.string().optional(),
});

export const devolverCautelaSchema = z.object({
  checklist_id: z.string().uuid(),
  respostas: z.array(z.object({
    pergunta_id: z.string().uuid(),
    resposta: z.boolean(),
  })),
  tem_avarias: z.boolean(),
  avarias_descricao: z.string().optional(),
  observacoes: z.string().optional(),
});

export const createChecklistSchema = z.object({
  nome: z.string().min(3),
  tipo: z.enum(["SAIDA", "DEVOLUCAO"]),
  perguntas: z.array(z.object({
    pergunta: z.string().min(5),
    obrigatoria: z.boolean().default(true),
    ordem: z.number().int(),
  })),
});
