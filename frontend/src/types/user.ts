export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USUARIO_LOCAL';

export type ModuloAcceso = 'SUNAT' | 'SUNAFIL' | 'AUDITORIA' | 'GESTION_USUARIOS' | 'GESTION_EMPRESAS';

export interface User {
  id: string;
  email: string;
  nombres?: string;
  apellidos?: string;
  nombre: string;
  dni?: string;
  rol: UserRole;
  modulosPermitidos?: ModuloAcceso[];
  telegramChatId?: string | null;
}
