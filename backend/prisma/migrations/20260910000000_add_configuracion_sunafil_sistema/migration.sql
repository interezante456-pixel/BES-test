-- CreateTable
CREATE TABLE IF NOT EXISTS "ConfiguracionSunafilSistema" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "sincroAutomaticaActiva" BOOLEAN NOT NULL DEFAULT true,
    "diasSemana" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "horas" TEXT[] DEFAULT ARRAY['07:00']::TEXT[],
    "soloActivas" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracionSunafilSistema_pkey" PRIMARY KEY ("id")
);
