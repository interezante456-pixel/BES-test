@echo off
setlocal enabledelayedexpansion
title Actualizador del Sistema BES - ORACON

echo =======================================================
echo          SISTEMA BES - ACTUALIZACION DE SERVIDOR
echo =======================================================
echo.

echo [1/3] Descargando ultimos cambios de Git (git pull)...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo descargar los cambios de Git.
    echo Revisa tu conexion a Internet o si hay conflictos locales.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Reconstruyendo y actualizando contenedores Docker...
docker compose up -d --build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Error al compilar o levantar los contenedores Docker.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Aplicando migraciones de base de datos pendientes (Prisma)...
docker compose exec -T backend npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo.
    echo [ADVERTENCIA] Esperando 5 segundos a que el contenedor backend este listo...
    timeout /t 5 /nobreak >nul
    docker compose exec -T backend npx prisma migrate deploy
)

echo.
echo =======================================================
echo    ¡ACTUALIZACION COMPLETADA EXITOSAMENTE!
echo    El sistema BES esta listo y funcionando.
echo =======================================================
echo.
pause
