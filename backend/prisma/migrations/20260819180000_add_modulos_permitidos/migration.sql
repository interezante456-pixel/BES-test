-- CreateEnum
CREATE TYPE "ModuloAcceso" AS ENUM ('SUNAT', 'SUNAFIL', 'AUDITORIA', 'GESTION_USUARIOS', 'GESTION_EMPRESAS');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "modulosPermitidos" "ModuloAcceso"[] DEFAULT ARRAY['SUNAT']::"ModuloAcceso"[];
