#!/bin/bash
set -e

echo "======================================================="
echo "         SISTEMA BES - ACTUALIZACION DE SERVIDOR"
echo "======================================================="
echo ""

echo "[1/3] Descargando ultimos cambios de Git (git pull)..."
git pull origin main

echo ""
echo "[2/3] Reconstruyendo y actualizando contenedores Docker..."
docker compose up -d --build

echo ""
echo "[3/3] Aplicando migraciones de base de datos pendientes (Prisma)..."
docker compose exec -T backend npx prisma migrate deploy

echo ""
echo "======================================================="
echo "   ¡ACTUALIZACION COMPLETADA EXITOSAMENTE!"
echo "   El sistema BES esta listo y funcionando."
echo "======================================================="
echo ""
