# BES — Sistema Centralizado de Monitoreo de Buzones Electrónicos

> **ORACON BES · Versión 2.1.0** *(Septiembre 2026)*  
> Plataforma empresarial de grado de producción para el monitoreo automatizado, extracción documental y gestión de notificaciones tributarias y laborales ante **SUNAT** y **SUNAFIL**.

![Version](https://img.shields.io/badge/versión-2.1.0-blue.svg)
![NestJS](https://img.shields.io/badge/backend-NestJS%2011-E0234E.svg)
![Next.js](https://img.shields.io/badge/frontend-Next.js%2015-000000.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2015-336791.svg)
![Redis](https://img.shields.io/badge/cache%20&%20queues-Redis%207%20%2F%20BullMQ-DC382D.svg)
![Puppeteer](https://img.shields.io/badge/scraping-Puppeteer%2024-40B5A4.svg)
![Docker](https://img.shields.io/badge/deploy-Docker%20Compose-2496ED.svg)

---

## 📋 Tabla de Contenidos
- [1. Descripción General](#1-descripción-general)
- [2. Novedades de la Versión 2.1.0](#2-novedades-de-la-versión-210)
- [3. Portales y Extractores Soportados](#3-portales-y-extractores-soportados)
- [4. Arquitectura del Sistema (Diagrama C4)](#4-arquitectura-del-sistema-diagrama-c4)
- [5. Estructura del Repositorio](#5-estructura-del-repositorio)
- [6. Variables de Entorno](#6-variables-de-entorno)
- [7. Despliegue en Producción (Docker Compose)](#7-despliegue-en-producción-docker-compose)
- [8. Entornos y Puertos de Red](#8-entornos-y-puertos-de-red)
- [9. Desarrollo Local](#9-desarrollo-local)
- [10. Resumen de Endpoints Principales](#10-resumen-de-endpoints-principales)
- [11. Runbooks de Operación y Seguridad](#11-runbooks-de-operación-y-seguridad)
- [12. Solución de Problemas (Troubleshooting)](#12-solución-de-problemas-troubleshooting)
- [13. Documentación Complementaria y QA](#13-documentación-complementaria-y-qa)

---

## 1. Descripción General

**BES (Buzón Electrónico SUNAT & SUNAFIL)** centraliza y automatiza el cumplimiento tributario y laboral para estudios contables y empresas con múltiples razones sociales. 

El sistema ejecuta agentes de scraping programados para inspeccionar de forma desatendida las casillas electrónicas del Estado, descargar los documentos oficiales en formato PDF, procesar resoluciones y montos de cobranza, y disponibilizar toda la información en un panel interactivo en tiempo real con soporte para múltiples usuarios, roles y auditoría forense.

### Dependencias Principales
- **Externas (Upstream)**: Portal SUNAT Operaciones en Línea (SOL), Casilla Electrónica SUNAFIL.
- **Internas (Downstream)**: Servidor de correo SMTP (alertas por correo), almacenamiento local persistente (`/uploads` para PDFs).

---

## 2. Novedades de la Versión 2.1.0

- 🏢 **Casilla Electrónica SUNAFIL Completa**: Monitoreo y extracción automatizada en sus 5 módulos de fiscalización y prevención.
- 👥 **Modelo de Roles Jerárquico (RBAC)**:
  - `SUPER_ADMIN`: Acceso irrestricto, configuración global, auditoría total y módulos beta.
  - `ADMIN`: Gestión operativa de empresas, asignación de carteras de clientes y métricas de equipo.
  - `USUARIO_LOCAL`: Vista acotada a las empresas asignadas (*Mis Asignadas*).
  - Matriz de permisos granulares (`SUNAT`, `SUNAFIL`, `AUDITORIA`, `GESTION_USUARIOS`, `GESTION_EMPRESAS`).
- ☀️ **Morning Brief**: Vista ejecutiva matutina que destaca notificaciones críticas, cobros coactivos y plazos por vencer.
- 🗄️ **Flujo de Atención y Archivo**: Estados operativos (`EN_REVISION`, `REQUIERE_ACCION`, `RESPONDIDO`, `ARCHIVADO`), asignación de analistas, notas internas y fechas de compromiso.
- 🛡️ **Seguridad Criptográfica Reforzada**: Cifrado AES-256-CBC para Claves SOL y contraseñas de SUNAFIL, con herramientas de diagnóstico y migración de llaves en caliente.
- 🌐 **Reverse Proxy Nginx Unificado**: Enrutamiento optimizado para API REST, WebSockets (`/socket.io`) y frontend bajo un único puerto y dominio.

---

## 3. Portales y Extractores Soportados

```text
Portales del Estado
 ├── 🏛️ SUNAT SOL
 │    ├── Mensajes Informativos
 │    ├── Notificaciones de Cobranza Coactiva (Extracción de montos y expedientes)
 │    ├── Órdenes de Pago y Resoluciones de Determinación
 │    └── Descarga y almacenamiento persistente de PDFs y Constancias
 │
 └── ⚖️ SUNAFIL (5 Módulos de Casilla Electrónica)
      ├── 1. Acciones Previas (Cartas inductivas y comunicaciones preventivas)
      ├── 2. Fiscalización (Órdenes de inspección y actas de infracción)
      ├── 3. Cobranza Coactiva (Resoluciones de ejecución coactiva laboral)
      ├── 4. Formalización (Requerimientos de registro en T-Registro)
      └── 5. Seguridad y Salud en el Trabajo (SST e inspección de comités)
```

---

## 4. Arquitectura del Sistema (Diagrama C4)

```mermaid
flowchart TB
    subgraph Usuarios ["👥 Clientes y Usuarios"]
        U1["Contador / Administrador"]
        U2["Super Administrador"]
    end

    subgraph Entrada ["🌐 Capa de Entrada y Seguridad"]
        NGINX["Nginx Reverse Proxy (:8080 / :80)<br/>• Cabeceras OWASP ASVS<br/>• Manejo de CORS & SSL<br/>• Proxy WebSockets /socket.io"]
    end

    subgraph FrontendApp ["💻 Capa de Presentación"]
        NEXT["Next.js 15 (App Router)<br/>• Dashboard & Morning Brief<br/>• Bandejas SUNAT y SUNAFIL<br/>• Zustand State Management"]
    end

    subgraph BackendApp ["⚙️ Capa de Aplicación"]
        NEST["NestJS 11 Backend<br/>• API REST & Auth JWT<br/>• Gateway WebSockets (Socket.IO)<br/>• Guards RBAC & Auditoría"]
    end

    subgraph Procesamiento ["🔄 Capa de Colas y Scraping"]
        REDIS["Redis 7 + BullMQ 5<br/>• Concurrency: 1 (Secuencial)<br/>• LockDuration: 5 min"]
        PUPPETEER["Workers Puppeteer 24<br/>• Navegación sigilosa anti-bloqueo<br/>• Extractores SUNAT & SUNAFIL"]
    end

    subgraph Persistencia ["💾 Capa de Persistencia"]
        PG[("PostgreSQL 15 (bes_db)<br/>• Prisma ORM<br/>• Credenciales Cifradas AES-256")]
        FS["Almacenamiento Local (/uploads)<br/>• Resoluciones y Constancias PDF"]
    end

    subgraph PortalesEstado ["🏛️ Portales Gubernamentales"]
        SUNAT["Portal SUNAT SOL"]
        SUNAFIL["Casilla SUNAFIL"]
    end

    U1 & U2 -->|HTTPS / HTTP| NGINX
    NGINX -->|Rutas Web /| NEXT
    NGINX -->|Rutas API & WebSockets| NEST
    NEXT <-->|Axios API & Socket.IO| NEST
    NEST -->|Lectura / Escritura| PG
    NEST -->|Encolar Sincronización| REDIS
    REDIS -->|Despachar Tareas| PUPPETEER
    PUPPETEER -->|Descarga de Documentos| FS
    PUPPETEER -->|Sesión y Scraping| SUNAT
    PUPPETEER -->|Sesión y Scraping| SUNAFIL
    PUPPETEER -->|Notificar Resultados| NEST
```

---

## 5. Estructura del Repositorio

| Directorio / Archivo | Propósito Principal |
| :--- | :--- |
| `backend/src/auth/` | Autenticación JWT, guards de roles (`SUPER_ADMIN`, `ADMIN`, `USUARIO_LOCAL`) y hashing. |
| `backend/src/empresas/` | Gestión de empresas, importación masiva en Excel y asignación a usuarios. |
| `backend/src/notificaciones/` | Bandeja general, workflow de estados (`EN_REVISION`, `ARCHIVADO`), notas y lecturas. |
| `backend/src/scraper/sunat/` | Servicio y procesador Puppeteer para la extracción en SUNAT SOL. |
| `backend/src/scraper/sunafil/` | Servicio y 5 extractores especializados para la casilla SUNAFIL. |
| `backend/src/encryption/` | Módulo criptográfico con cifrado simétrico AES-256-CBC. |
| `backend/src/estadisticas/` | Agregación de métricas en tiempo real y generación del Morning Brief. |
| `backend/src/audit/` | Registro inmutable de eventos de seguridad y acciones de usuarios (`AuditLog`). |
| `backend/setup-roles.ts` | Script de inicialización y sincronización de cuentas maestras y roles. |
| `backend/migrate-encryption.ts` | Herramienta CLI para recifrado masivo ante rotación de llaves. |
| `backend/check-fallback-key.ts` | Herramienta de diagnóstico de salud del cifrado de credenciales. |
| `frontend/src/app/dashboard/` | Páginas principales: `bandeja`, `sunat`, `sunafil`, `morning-brief`, `admin`, etc. |
| `nginx.conf` | Reglas de proxy reverso, seguridad perimetral, WebSockets y CORS. |
| `docker-compose.yml` | Orquestación completa de producción con healthchecks encadenados. |

---

## 6. Variables de Entorno

El archivo de configuración principal se encuentra en `backend/.env` (basado en `backend/.env.example`):

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL con Prisma | `postgresql://postgres:postgres@postgres:5432/bes_db?schema=public` |
| `ENCRYPTION_KEY` | Clave maestra AES-256 (**Exactamente 32 caracteres**) | Generar con `crypto.randomBytes(16).toString('hex')` |
| `JWT_SECRET` | Secreto para firma de tokens JWT | Generar con `crypto.randomBytes(32).toString('hex')` |
| `REDIS_HOST` | Host del servidor Redis | `redis` (en Docker) o `localhost` (desarrollo) |
| `REDIS_PORT` | Puerto de conexión Redis | `6379` |
| `FRONTEND_URL` | URL de origen para políticas CORS del frontend | `http://panel.oracon.com` o `http://localhost:8080` |
| `BACKEND_URL` | URL pública para la generación de enlaces de descarga PDF | `http://panel.oracon.com` o `http://localhost:4000` |
| `PUPPETEER_HEADLESS`| Ejecución en segundo plano (`true`) o con ventana visible (`false`) | `true` (producción) / `false` (debug local) |
| `PORT` | Puerto interno en el que escucha NestJS | `3000` |

---

## 7. Despliegue en Producción (Docker Compose)

### Paso 1: Configurar Variables de Entorno
```bash
cd backend
cp .env.example .env
```
Genera las llaves criptográficas seguras y reemplázalas en `backend/.env`:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"  # ENCRYPTION_KEY (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # JWT_SECRET (64 caracteres)
```

### Paso 2: Configurar la URL en docker-compose.yml
Si accedes a través de un dominio de red local o IP de servidor (ej. `192.168.1.50`):
```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://192.168.1.50:8080
```

### Paso 3: Construir e Iniciar Contenedores
Desde la raíz del proyecto:
```bash
docker compose up -d --build
```

### Paso 4: Desplegar Migraciones y Aprovisionar Cuentas
Una vez levantados los servicios:
```bash
# 1. Aplicar migraciones en PostgreSQL
docker compose exec backend npx prisma migrate deploy

# 2. Inicializar cuentas administrativas y roles
docker compose exec backend npm run setup:roles
```

> **Credenciales Generadas por Defecto**:
> - **Super Admin**: `sadmin@oracon.com` | Contraseña: `passwordoracon2026@`
> - **Admin**: `admin@oracon.com` | Contraseña: `admin_password_2026`  
> *(Recomendación: Cambiar contraseñas inmediatamente al acceder al sistema).*

---

## 8. Entornos y Puertos de Red

| Servicio | Contenedor | Puerto Externo | Puerto Interno | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Proxy** | `oracon_nginx` | **`:8080`** | `80` | **Acceso principal unificado** a la plataforma web y API. |
| **Frontend** | `oracon_frontend` | `:3500` | `3000` | Acceso directo a Next.js (en caso de mantenimiento). |
| **Backend API** | `oracon_backend` | `:4000` | `3000` | API REST directa y endpoint de salud `/health`. |
| **PostgreSQL** | `oracon_postgres` | `:5433` | `5432` | Conexión de base de datos (`bes_db`). |
| **Redis** | `oracon_redis` | `:6379` | `6379` | Cola de tareas de BullMQ. |

---

## 9. Desarrollo Local

Para desarrollo activo con recarga en caliente (*hot-reload*) y visualización de Puppeteer:

### 1. Iniciar Dependencias en Contenedor
```bash
docker compose up -d postgres redis
```

### 2. Levantar el Backend en Local
Configura en `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bes_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PUPPETEER_HEADLESS="false"  # Permite ver el navegador en pantalla
PORT="3000"
```
Ejecuta:
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 3. Levantar el Frontend en Local
En una segunda terminal:
```bash
cd frontend
npm install
npm run dev
```
Disponible en `http://localhost:3001` (o `3000`).

---

## 10. Resumen de Endpoints Principales

| Módulo | Método | Endpoint | Rol Mínimo | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Público | Autenticación con email/contraseña o DNI. |
| **Empresas** | `GET` | `/empresas` | `USUARIO_LOCAL` | Lista empresas (filtradas por asignación si no es admin). |
| **Empresas** | `POST` | `/empresas/importar-excel`| `ADMIN` | Carga masiva de RUCs, usuarios y claves SOL. |
| **Notificaciones** | `GET` | `/notificaciones` | `USUARIO_LOCAL` | Bandeja paginada con filtros multicriterio. |
| **Notificaciones** | `PATCH`| `/notificaciones/:id/gestion` | `USUARIO_LOCAL` | Cambia estado (`EN_REVISION`, `ARCHIVADO`), notas y plazos. |
| **Scraper** | `POST` | `/scraper/sincronizar/:id` | `ADMIN` | Encola sincronización inmediata de una empresa. |
| **Scraper** | `POST` | `/scraper/sunafil/sincronizar/:id` | `ADMIN` | Encola sincronización de Casilla SUNAFIL. |
| **Estadísticas** | `GET` | `/estadisticas/morning-brief` | `USUARIO_LOCAL` | Retorna métricas ejecutivas y alertas del día. |
| **Auditoría** | `GET` | `/auditoria` | `SUPER_ADMIN` | Consulta logs de auditoría forense del sistema. |
| **Salud** | `GET` | `/health` | Público | Healthcheck de base de datos, Redis y almacenamiento. |

---

## 11. Runbooks de Operación y Seguridad

### Runbook 1: Sincronización Manual Inmediata
Si una empresa necesita revisar notificaciones urgentes sin esperar al cronjob:
1. Dirígete a **Empresas** en el menú lateral.
2. Localiza la fila de la empresa y pulsa el botón **Sincronizar SUNAT** o **Sincronizar SUNAFIL**.
3. El trabajo entrará a la cola BullMQ y los avances se emitirán en tiempo real mediante WebSockets.

### Runbook 2: Verificación de Salud del Cifrado
Para verificar que todas las credenciales almacenadas pueden ser descifradas correctamente:
```bash
docker compose exec backend npm run check:encryption
```

### Runbook 3: Rotación de la Clave Maestra (`ENCRYPTION_KEY`)
1. Genera una nueva clave de 32 caracteres:
   ```bash
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
2. Ejecuta una prueba en seco (*dry-run*):
   ```bash
   docker compose exec backend npm run migrate:encryption:dry
   ```
3. Aplica la migración real cuando el dry-run sea satisfactorio:
   ```bash
   docker compose exec backend npm run migrate:encryption
   ```

### Runbook 4: Respaldo y Restauración de Base de Datos
```bash
# Crear backup en formato SQL comprimido:
docker compose exec postgres pg_dump -U postgres -d bes_db | gzip > backup_bes_$(date +%Y%m%d).sql.gz

# Restaurar backup:
gunzip -c backup_bes_20260918.sql.gz | docker compose exec -T postgres psql -U postgres -d bes_db
```

---

## 12. Solución de Problemas (Troubleshooting)

### 🔴 Puppeteer falla en Docker (`QPA: could not connect to display`)
- **Síntoma**: El contenedor backend arroja error al intentar iniciar una tarea de scraping.
- **Causa**: `PUPPETEER_HEADLESS` está configurado en `false` dentro de un entorno sin servidor gráfico X11.
- **Solución**: Asegurar que `PUPPETEER_HEADLESS="true"` esté definido en `backend/.env` o en las variables de entorno de Docker Compose.

### 🔴 Jobs marcados como "Stalled" en BullMQ
- **Síntoma**: La tarea de scraping queda trabada o se reintenta indefinidamente.
- **Causa**: El portal de SUNAT o SUNAFIL responde con extrema lentitud y supera el tiempo de bloqueo de la cola.
- **Solución**: El parámetro `lockDuration` en `scraper.processor.ts` está fijado en 5 minutos (`300000 ms`). No reducir este valor para tolerar la latencia gubernamental.

### 🔴 Error de Credenciales en SUNAT / Clave SOL inválida
- **Síntoma**: La empresa figura con estado `REQUIERE_ACTUALIZACION`.
- **Causa**: La Clave SOL fue cambiada directamente en SUNAT o se ingresó incorrectamente en el sistema.
- **Solución**: Editar la empresa en el panel web, actualizar usuario/clave SOL y pulsar "Probar Conexión".

### 🔴 Prevención de Bloqueos por IP (Anti-Bot)
- **Diseño**: El sistema opera bajo un esquema secuencial estricto (`concurrency: 1`) con pausas aleatorias de comportamiento humano entre empresas para evitar sobrecargar los portales y prevenir bloqueos temporales de IP.

---

## 13. Documentación Complementaria y QA

El repositorio cuenta con una suite visual e interactiva de documentación técnica y aseguramiento de calidad en la carpeta [`docs-qa/`](file:///c:/proeycto/BES/docs-qa/):

| Documento / Artefacto | Tipo | Descripción |
| :--- | :--- | :--- |
| [`bes-architecture.html`](file:///c:/proeycto/BES/docs-qa/bes-architecture.html) | HTML Interactivo | Visor de arquitectura generado con **Archify** (temas Dark/Light, filtros de componentes y rutas). |
| [`diagrama-clases.html`](file:///c:/proeycto/BES/docs-qa/diagrama-clases.html) | HTML Interactivo | Diagrama de clases UML 2.5 con selector de 3 vistas (Completo, Dominio/DDD y Servicios NestJS). |
| [`index.html`](file:///c:/proeycto/BES/docs-qa/index.html) | Portal Web | Portal de Calidad (QA), arquitectura de paquetes y matriz de Quality Gates. |
| [`casos-de-uso.md`](file:///c:/proeycto/BES/docs-qa/casos-de-uso.md) | Especificación | Catálogo formal de casos de uso (CU-01 a CU-18) con trazabilidad a pruebas. |
| [`historias-de-usuario.md`](file:///c:/proeycto/BES/docs-qa/historias-de-usuario.md) | Agile / Scrum | 25 Historias de Usuario (HU-01 a HU-25) con criterios de aceptación Gherkin. |

---

> **ORACON BES** — *Desarrollado para la excelencia operativa y la seguridad de la información tributaria.*  
> *Última revisión técnica: Septiembre 2026.*
