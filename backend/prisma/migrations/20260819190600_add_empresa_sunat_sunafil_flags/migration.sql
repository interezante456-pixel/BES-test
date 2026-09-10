-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "habilitadoSunat" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "habilitadoSunafil" BOOLEAN NOT NULL DEFAULT false;
