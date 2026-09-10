-- CreateTable
CREATE TABLE "ConfiguracionSistema" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "sincroAutomaticaActiva" BOOLEAN NOT NULL DEFAULT true,
    "diasSemana" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
    "horas" TEXT[] DEFAULT ARRAY['06:00', '18:00']::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracionSistema_pkey" PRIMARY KEY ("id")
);
