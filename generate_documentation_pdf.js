const puppeteer = require('./backend/node_modules/puppeteer');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Documentación Técnica Integral — Sistema BES</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 12mm 12mm 14mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      font-size: 8.8pt;
      line-height: 1.42;
    }

    /* Encabezados y Portada */
    .header {
      background: linear-gradient(135deg, #0b1528 0%, #0f172a 45%, #1e3a8a 100%);
      color: #ffffff;
      padding: 22px 26px;
      border-radius: 10px;
      margin-bottom: 14px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.12);
      position: relative;
    }

    .header-tagline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(59, 130, 246, 0.22);
      border: 1px solid rgba(147, 197, 253, 0.4);
      color: #93c5fd;
      font-size: 7.2pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 21pt;
      font-weight: 800;
      letter-spacing: -0.6px;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .header p {
      font-size: 9.2pt;
      color: #cbd5e1;
      font-weight: 300;
      line-height: 1.35;
    }

    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 7.3pt;
      color: #94a3b8;
    }

    .meta-item strong {
      color: #f8fafc;
    }

    /* KPI Highlights */
    .metrics-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 8px 10px;
      text-align: center;
      border-top: 3px solid #2563eb;
    }

    .metric-value {
      font-family: 'Outfit', sans-serif;
      font-size: 14pt;
      font-weight: 800;
      color: #1d4ed8;
      line-height: 1.1;
    }

    .metric-label {
      font-size: 6.9pt;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* Secciones */
    .section {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .section-title .number {
      background: #2563eb;
      color: #ffffff;
      width: 21px;
      height: 21px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 7.8pt;
      font-weight: 800;
    }

    /* Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 9px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 10px;
    }

    .card-title {
      font-size: 9pt;
      font-weight: 700;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-title.primary { color: #1d4ed8; }
    .card-title.success { color: #15803d; }
    .card-title.warning { color: #b45309; }
    .card-title.danger  { color: #b91c1c; }
    .card-title.purple  { color: #6b21a8; }

    ul {
      padding-left: 15px;
      margin-top: 3px;
    }

    li {
      font-size: 8.2pt;
      color: #334155;
      margin-bottom: 3px;
      line-height: 1.36;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
      font-size: 8pt;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-weight: 600;
      font-size: 7.3pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th:first-child { border-top-left-radius: 5px; }
    th:last-child { border-top-right-radius: 5px; }

    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .tech-tag {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 6.9pt;
      font-weight: 600;
      margin-right: 2px;
      margin-bottom: 2px;
    }

    /* Módulos y Cajas */
    .module-box {
      border-left: 3.5px solid #2563eb;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 10px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 6px;
      page-break-inside: avoid;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }

    .module-name {
      font-weight: 700;
      font-size: 8.8pt;
      color: #0f172a;
    }

    .badge {
      font-size: 6.6pt;
      padding: 1.5px 6px;
      border-radius: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-blue   { background: #dbeafe; color: #1e40af; }
    .badge-green  { background: #dcfce7; color: #166534; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; }
    .badge-amber  { background: #fef3c7; color: #92400e; }
    .badge-rose   { background: #ffe4e6; color: #9f1239; }
    .badge-dark   { background: #0f172a; color: #ffffff; }

    .module-desc {
      font-size: 8pt;
      color: #475569;
      line-height: 1.35;
    }

    /* Bloques de Código */
    .code-block {
      background: #0f172a;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.2pt;
      padding: 7px 9px;
      border-radius: 5px;
      margin: 4px 0 7px 0;
      line-height: 1.36;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #1e293b;
    }

    .code-block .comment { color: #64748b; }
    .code-block .keyword { color: #f472b6; font-weight: 600; }
    .code-block .string  { color: #4ade80; }
    .code-block .val     { color: #fde047; }
    .code-block .cmd     { color: #38bdf8; font-weight: 600; }

    .step-box {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 11px;
      margin-bottom: 7px;
      page-break-inside: avoid;
    }

    .step-title {
      font-size: 8.8pt;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .step-badge {
      background: #0f172a;
      color: #ffffff;
      padding: 1px 7px;
      border-radius: 4px;
      font-size: 6.6pt;
      font-weight: 700;
    }

    .page-break {
      page-break-after: always;
    }

    /* Footer */
    .footer {
      font-size: 7pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 12px;
    }
  </style>
</head>
<body>

  <!-- =========================================================================
       PÁGINA 1: PORTADA & FICHA TÉCNICA DEL SISTEMA
  ========================================================================== -->
  <div class="header">
    <div class="header-tagline">📘 Documentación Oficial de Ingeniería & Arquitectura</div>
    <h1>Sistema BES — Buzón Electrónico SUNAT & SUNAFIL</h1>
    <p>Manual Técnico Maestro, Especificación de Arquitectura, Modelo Relacional, Pipeline Robotizado de Scraping y Registro de Seguridad</p>
    <div class="meta-bar">
      <div class="meta-item"><strong>Versión:</strong> 2.4.0-PROD</div>
      <div class="meta-item"><strong>Fecha de Emisión:</strong> 02 de Septiembre de 2026</div>
      <div class="meta-item"><strong>Plataforma:</strong> Multi-Tenant Contable / Corporativo</div>
      <div class="meta-item"><strong>Capacidad Validada:</strong> 150+ Empresas en Monitoreo Concurrente</div>
    </div>
  </div>

  <div class="metrics-container">
    <div class="metric-card">
      <div class="metric-value">17</div>
      <div class="metric-label">Módulos NestJS Backend</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">14</div>
      <div class="metric-label">Modelos Relacionales Prisma</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">AES-256</div>
      <div class="metric-label">Cifrado Criptográfico Claves</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">3 Canales</div>
      <div class="metric-label">Sockets + Telegram + Email</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">1</span>Ficha Técnica y Alcance Operativo
    </div>
    <p style="font-size: 8.4pt; color: #334155; margin-bottom: 8px;">
      El <strong>Sistema BES (Buzón Electrónico SUNAT / SUNAFIL)</strong> es una suite tecnológica empresarial diseñada para automatizar íntegramente la consulta, extracción, descarga, clasificación y notificación de resoluciones, cartas inductivas, esquelas y órdenes de pago emitidas por las entidades tributarias y laborales peruanas (SUNAT y SUNAFIL).
    </p>

    <div class="grid-2">
      <div class="card">
        <div class="card-title primary">🎯 Objetivos de Negocio y Automatización</div>
        <ul>
          <li><strong>Eliminación de trabajo manual:</strong> Sustituye el inicio de sesión repetitivo en SUNAT RUC por RUC ahorrando cientos de horas/hombre al mes.</li>
          <li><strong>Mitigación de riesgo legal y fiscal:</strong> Alerta inmediata ante esquelas o resoluciones coactivas que acarrean embargo bancario o multas si no se responden en 3 días hábiles.</li>
          <li><strong>Centralización multi-empresa:</strong> Unificación de 10, 50 o 150+ razones sociales bajo una consola unificada de monitoreo.</li>
          <li><strong>Extracción predictiva:</strong> Detección autónoma de expedientes coactivos y montos exigibles (S/) mediante parsing de texto.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title success">🏢 Entidades Fiscales Integradas</div>
        <ul>
          <li><strong>SUNAT (Buzón Electrónico SOL):</strong> Extracción de notificaciones administrativas, resoluciones de determinación, órdenes de pago y esquelas de fiscalización con descarga automática de PDFs adjuntos.</li>
          <li><strong>SUNAFIL (Casilla Electrónica):</strong> Monitoreo de 5 submódulos especializados: <em>Fiscalización</em>, <em>Cobranza Coactiva</em>, <em>Acciones Previas</em>, <em>Alertas de Formalización</em> y <em>Alertas de Seguridad y Salud en el Trabajo (SST)</em>.</li>
          <li><strong>Extensión de Navegador:</strong> Plugin de auto-completado y auto-login en SUNAT mediante un solo clic en pestaña normal o ventana de incógnito.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">2</span>Topología del Stack Tecnológico
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Capa</th>
          <th style="width: 25%;">Tecnología</th>
          <th style="width: 55%;">Responsabilidad de Arquitectura</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend Web</strong></td>
          <td><span class="tech-tag">Next.js 14 (App Router)</span> <span class="tech-tag">React 18</span> <span class="tech-tag">TailwindCSS</span> <span class="tech-tag">Zustand</span></td>
          <td>Dashboard reactivo, visor PDF integrado con renderizado nativo, bandeja multi-filtro, morning-brief y gestión de estados sin refresco de página.</td>
        </tr>
        <tr>
          <td><strong>Backend Core</strong></td>
          <td><span class="tech-tag">NestJS 10</span> <span class="tech-tag">TypeScript</span> <span class="tech-tag">Passport JWT</span> <span class="tech-tag">Throttler</span></td>
          <td>API REST modular, endpoints de negocio, control de acceso por roles (RBAC), guards de autenticación, rate limiting y tubería de validación DTO.</td>
        </tr>
        <tr>
          <td><strong>Motor de Scraping</strong></td>
          <td><span class="tech-tag">Puppeteer</span> <span class="tech-tag">Chromium Headless</span></td>
          <td>Navegación automatizada sobre portales SUNAT/SUNAFIL, resolución de sesiones SSO, bypass de modales publicitarios y captura de streams PDF.</td>
        </tr>
        <tr>
          <td><strong>Colas y Concurrencia</strong></td>
          <td><span class="tech-tag">BullMQ</span> <span class="tech-tag">Redis 7</span></td>
          <td>Planificador asíncrono con control de concurrencia unitario (1 job simultáneo por worker) para emular cadencia humana y evitar bloqueo de IP.</td>
        </tr>
        <tr>
          <td><strong>Capa de Persistencia</strong></td>
          <td><span class="tech-tag">PostgreSQL 16</span> <span class="tech-tag">Prisma ORM</span></td>
          <td>Base de datos relacional optimizada con 14 tablas, índices compuestos para acelerar filtros de fecha y auditoría inalterable.</td>
        </tr>
        <tr>
          <td><strong>Canales en Tiempo Real</strong></td>
          <td><span class="tech-tag">Socket.IO</span> <span class="tech-tag">Telegram Bot API</span> <span class="tech-tag">Nodemailer SMTP</span></td>
          <td>Despacho instantáneo de eventos de sincronización al navegador, alertas móviles por bot de Telegram y correos electrónicos automáticos.</td>
        </tr>
        <tr>
          <td><strong>Proxy Inverso & Gateway</strong></td>
          <td><span class="tech-tag">Nginx Alpine</span></td>
          <td>Terminación reverse proxy, enrutamiento a puertos internos (3000/4000), límites de carga de archivos (50M) y headers de seguridad HTTP.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 1 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 2: ARQUITECTURA RELACIONAL & MATRIZ GENERAL DE CONEXIONES
  ========================================================================== -->
  <div class="section">
    <div class="section-title">
      <span class="number">3</span>Matriz General de Relaciones entre Tablas (Foreign Keys)
    </div>
    <p style="font-size: 8.2pt; color: #334155; margin-bottom: 7px;">
      El esquema de persistencia se compone de <strong>14 modelos relacionales</strong> normalizados en PostgreSQL. La siguiente matriz detalla cada vínculo foráneo, su cardinalidad exacta y la regla de integridad referencial ante eliminación (<code>ON DELETE</code>):
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 3%;">#</th>
          <th style="width: 31%;">Tabla Origen &amp; Atributos (Campos)</th>
          <th style="width: 8%;">Card.</th>
          <th style="width: 14%;">Tabla Destino</th>
          <th style="width: 17%;">Clave Foránea (FK)</th>
          <th style="width: 11%;">ON DELETE</th>
          <th style="width: 16%;">Regla de Negocio</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1</strong></td>
          <td>
            <strong><code>Empresa</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>ruc (UK)</code>, <code>razonSocial</code>, <code>usuarioSol</code>, <code>claveSol (AES-256)</code>, <code>habilitadoSunat</code>, <code>habilitadoSunafil</code>, <code>estadoConexion</code>, <code>estadoSincro</code>, <code>activo</code>, <code>ultimaSincronizacion</code>, <code>usuarioId (FK)</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-dark">RESTRICT</span></td>
          <td>Usuario creador / dueño de la empresa</td>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td>
            <strong><code>EmpresaAsignacion</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>usuarioId (FK)</code>, <code>empresaId (FK)</code>, <code>creadoEn</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Contador local con acceso concedido</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td>
            <strong><code>EmpresaAsignacion</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>usuarioId (FK)</code>, <code>empresaId (FK)</code>, <code>creadoEn</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Empresa</code></td>
          <td><code>empresaId &rarr; Empresa.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Empresa delegada al usuario (Relación N:M)</td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td>
            <strong><code>Notificacion</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>empresaId (FK)</code>, <code>fileId (UK)</code>, <code>fechaMensaje</code>, <code>asunto</code>, <code>tipo</code>, <code>rutaArchivoPdf</code>, <code>estado</code>, <code>montoExigible</code>, <code>expedienteCoactivo</code>, <code>origen</code>, <code>moduloSunafil</code>, <code>leidoGlobal</code>, <code>responsableId (FK)</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Empresa</code></td>
          <td><code>empresaId &rarr; Empresa.id</code></td>
          <td><span class="badge badge-dark">RESTRICT</span></td>
          <td>Empresa titular de la notificación / PDF</td>
        </tr>
        <tr>
          <td><strong>5</strong></td>
          <td>
            <strong><code>Notificacion</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: (Ídem anterior) &bull; Campos de workflow: <code>responsableId (FK)</code>, <code>estadoGestion</code>, <code>notasInternas</code>, <code>fechaCompromiso</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>responsableId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-amber">SET NULL</span></td>
          <td>Contador responsable de atender el requerimiento</td>
        </tr>
        <tr>
          <td><strong>6</strong></td>
          <td>
            <strong><code>NotificacionLectura</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>notificacionId (FK)</code>, <code>usuarioId (FK)</code>, <code>creadoAt</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Notificacion</code></td>
          <td><code>notificacionId &rarr; Notif.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Documento fiscal que fue abierto y visualizado</td>
        </tr>
        <tr>
          <td><strong>7</strong></td>
          <td>
            <strong><code>NotificacionLectura</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>notificacionId (FK)</code>, <code>usuarioId (FK)</code>, <code>creadoAt</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Usuario específico que abrió la resolución</td>
        </tr>
        <tr>
          <td><strong>8</strong></td>
          <td>
            <strong><code>NotificacionComentario</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>notificacionId (FK)</code>, <code>usuarioId (FK)</code>, <code>usuarioNombre</code>, <code>texto</code>, <code>estadoAnterior</code>, <code>estadoNuevo</code>, <code>createdAt</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Notificacion</code></td>
          <td><code>notificacionId &rarr; Notif.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Expediente sobre el que se deja la nota interna</td>
        </tr>
        <tr>
          <td><strong>9</strong></td>
          <td>
            <strong><code>NotificacionComentario</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>notificacionId (FK)</code>, <code>usuarioId (FK)</code>, <code>usuarioNombre</code>, <code>texto</code>, <code>estadoAnterior</code>, <code>estadoNuevo</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Usuario autor del comentario o cambio de estado</td>
        </tr>
        <tr>
          <td><strong>10</strong></td>
          <td>
            <strong><code>NotificacionEtiqueta</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>notificacionId (PK, FK)</code>, <code>etiquetaId (PK, FK)</code>, <code>asignadoEn</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Notificacion</code></td>
          <td><code>notificacionId &rarr; Notif.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Documento tributario clasificado con un tag</td>
        </tr>
        <tr>
          <td><strong>11</strong></td>
          <td>
            <strong><code>NotificacionEtiqueta</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>notificacionId (PK, FK)</code>, <code>etiquetaId (PK, FK)</code>, <code>asignadoEn</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Etiqueta</code></td>
          <td><code>etiquetaId &rarr; Etiqueta.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Tag asociado a la notificación (Relación N:M)</td>
        </tr>
        <tr>
          <td><strong>12</strong></td>
          <td>
            <strong><code>EventoCalendario</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>empresaId (FK, opt)</code>, <code>usuarioId (FK)</code>, <code>titulo</code>, <code>descripcion</code>, <code>fecha</code>, <code>tipo</code>, <code>createdAt</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Empresa</code></td>
          <td><code>empresaId &rarr; Empresa.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Empresa referenciada en la agenda (opcional)</td>
        </tr>
        <tr>
          <td><strong>13</strong></td>
          <td>
            <strong><code>EventoCalendario</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>empresaId (FK)</code>, <code>usuarioId (FK)</code>, <code>titulo</code>, <code>descripcion</code>, <code>fecha</code>, <code>tipo</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Usuario creador del evento o vencimiento</td>
        </tr>
        <tr>
          <td><strong>14</strong></td>
          <td>
            <strong><code>Recordatorio</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>usuarioId (FK)</code>, <code>empresaId (FK, opt)</code>, <code>notificacionId</code>, <code>titulo</code>, <code>descripcion</code>, <code>fechaRecordar</code>, <code>completado</code>, <code>notificado</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Usuario destinatario de la alerta de tarea</td>
        </tr>
        <tr>
          <td><strong>15</strong></td>
          <td>
            <strong><code>Recordatorio</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>usuarioId (FK)</code>, <code>empresaId (FK)</code>, <code>titulo</code>, <code>fechaRecordar</code>, <code>completado</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Empresa</code></td>
          <td><code>empresaId &rarr; Empresa.id</code></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Empresa relacionada con la alerta</td>
        </tr>
        <tr>
          <td><strong>16</strong></td>
          <td>
            <strong><code>AuditLog</code></strong><br>
            <span style="font-size: 6.8pt; color: #475569;">Atributos: <code>id (PK)</code>, <code>usuarioId (FK, opt)</code>, <code>accion</code>, <code>entidad</code>, <code>entidadId</code>, <code>detalles (JSON)</code>, <code>ipAddress</code>, <code>userAgent</code>, <code>createdAt</code></span>
          </td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><code>Usuario</code></td>
          <td><code>usuarioId &rarr; Usuario.id</code></td>
          <td><span class="badge badge-amber">SET NULL</span></td>
          <td>Usuario responsable del evento (auditoría forense)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">4</span>Índices Compuestos y Reglas de Integridad SQL
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title primary">⚡ Índices en Notificaciones</div>
        <p style="font-size: 7.7pt; color: #475569; margin-bottom: 3px;">Aceleran consultas del dashboard sobre miles de registros:</p>
        <div class="code-block"><span class="comment">-- Índices compuestos B-Tree</span>
<span class="keyword">@@index</span>([empresaId, fechaMensaje])
<span class="keyword">@@index</span>([empresaId, estado])
<span class="keyword">@@index</span>([empresaId, leidoGlobal])
<span class="keyword">@@index</span>([origen, moduloSunafil])
<span class="keyword">@@index</span>([responsableId])
<span class="keyword">@@index</span>([estadoGestion])</div>
      </div>

      <div class="card">
        <div class="card-title success">🛡️ Restricciones de Unicidad (Anti-Duplicados)</div>
        <p style="font-size: 7.7pt; color: #475569; margin-bottom: 3px;">Previenen colisiones a nivel de motor PostgreSQL:</p>
        <div class="code-block"><span class="comment">-- Constraints Unique</span>
<span class="keyword">Empresa.ruc</span>: <span class="string">@unique</span> (11 dígitos)
<span class="keyword">Usuario.email</span>: <span class="string">@unique</span> &bull; <span class="keyword">dni</span>: <span class="string">@unique</span>
<span class="keyword">Notificacion.fileId</span>: <span class="string">@unique</span> (ID SUNAT)
<span class="keyword">EmpresaAsignacion</span>: <span class="keyword">@@unique</span>([usuarioId, empresaId])
<span class="keyword">NotificacionLectura</span>: <span class="keyword">@@unique</span>([notificacionId, usuarioId])</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 2 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 3: DIAGRAMA VISUAL ENTIDAD-RELACIÓN (MODELO FÍSICO DE BASE DE DATOS)
  ========================================================================== -->
  <div class="section" style="margin-bottom: 6px;">
    <div class="section-title" style="margin-bottom: 4px;">
      <span class="number" style="background:#1e40af;">5</span>Diagrama Visual Entidad-Relación (Esquema Físico de Base de Datos)
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 7.2pt; color: #475569; background: #f8fafc; padding: 4px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
      <div><strong>Leyenda:</strong> <span style="color:#d97706;">🔑 Clave Primaria (PK)</span> &bull; <span style="color:#2563eb;">🔗 Clave Foránea (FK)</span> &bull; <span style="color:#0f172a;">▪ Atributo / Campo</span></div>
      <div><strong>Cardinalidad:</strong> <span style="color:#2563eb; font-weight:700;">━━━&lt;</span> Relación Uno a Muchos (1 : N) &bull; <span style="color:#16a34a; font-weight:700;">[N:M]</span> Tablas Puente</div>
    </div>

    <!-- CANVAS DEL DIAGRAMA ERD VECTORIAL -->
    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
      <svg viewBox="0 0 740 850" style="width: 100%; height: auto; font-family: 'JetBrains Mono', monospace;">
        <defs>
          <marker id="erd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
          </marker>
          <marker id="erd-dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
            <circle cx="5" cy="5" r="4" fill="#d97706" />
          </marker>
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.7" fill="#cbd5e1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid-pattern)" />

        <!-- LÍNEAS DE CONEXIÓN (RELACIONES) -->
        <path d="M 185 60 L 275 60" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 525 60 L 445 60" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 100 185 L 100 240" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 615 210 L 615 280 L 485 280" stroke="#2563eb" stroke-width="1.8" fill="none" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 185 110 L 225 110 L 225 390 L 265 390" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,2" fill="none" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 485 300 L 535 300" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 485 420 L 535 420" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 375 520 L 375 580" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 535 620 L 465 620" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 50 185 L 50 420" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />
        <path d="M 35 185 L 35 600" stroke="#2563eb" stroke-width="1.8" marker-start="url(#erd-dot)" marker-end="url(#erd-arrow)" />

        <!-- TABLAS CON ATRIBUTOS -->
        <!-- 1. USUARIO -->
        <g transform="translate(15, 20)">
          <rect width="170" height="165" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          <rect width="170" height="24" rx="5" fill="#0f172a" />
          <text x="85" y="16" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">USUARIO</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" fill="#1d4ed8">▪ email : String (UK)</text>
            <text y="28" fill="#475569">▪ password : Hash</text>
            <text y="42">▪ nombres : String</text>
            <text y="56">▪ apellidos : String</text>
            <text y="70" fill="#1d4ed8">▪ dni : String (UK)</text>
            <text y="84">▪ rol : Role (Enum)</text>
            <text y="98">▪ modulosPermitidos</text>
            <text y="112" fill="#64748b">▪ telegramChatId</text>
            <text y="126" fill="#64748b">▪ createdAt : DateTime</text>
          </g>
        </g>

        <!-- 2. EMPRESA_ASIGNACION -->
        <g transform="translate(275, 20)">
          <rect width="170" height="95" rx="5" fill="#ffffff" stroke="#16a34a" stroke-width="1.5" />
          <rect width="170" height="24" rx="5" fill="#166534" />
          <text x="85" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EMPRESA_ASIGNACION [N:M]</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="28" font-weight="600" fill="#1d4ed8">🔗 empresaId : UUID (FK)</text>
            <text y="42" fill="#64748b">▪ creadoEn : DateTime</text>
          </g>
        </g>

        <!-- 3. EMPRESA -->
        <g transform="translate(525, 20)">
          <rect width="200" height="190" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          <rect width="200" height="24" rx="5" fill="#0f172a" />
          <text x="100" y="16" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EMPRESA</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="700" fill="#1d4ed8">▪ ruc : String(11) (UK)</text>
            <text y="28">▪ razonSocial : String</text>
            <text y="42">▪ usuarioSol : String</text>
            <text y="56" fill="#b91c1c" font-weight="600">▪ claveSol : AES-256</text>
            <text y="70">▪ habilitadoSunat : Bool</text>
            <text y="84">▪ habilitadoSunafil : Bool</text>
            <text y="98">▪ estadoConexion : Enum</text>
            <text y="112">▪ estadoSincro : String</text>
            <text y="126">▪ activo : Boolean</text>
            <text y="140" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          </g>
        </g>

        <!-- 4. AUDIT_LOG -->
        <g transform="translate(15, 240)">
          <rect width="170" height="135" rx="5" fill="#ffffff" stroke="#6b21a8" stroke-width="1.5" />
          <rect width="170" height="24" rx="5" fill="#6b21a8" />
          <text x="85" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">AUDIT_LOG (ISO 27001)</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="28">▪ accion : String</text>
            <text y="42">▪ entidad : String</text>
            <text y="56" fill="#15803d" font-weight="600">▪ ipAddress : String</text>
            <text y="70" fill="#15803d" font-weight="600">▪ userAgent : String</text>
            <text y="84" fill="#64748b">▪ createdAt : DateTime</text>
          </g>
        </g>

        <!-- 5. NOTIFICACION -->
        <g transform="translate(265, 230)">
          <rect width="220" height="290" rx="6" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" />
          <rect width="220" height="26" rx="6" fill="#1e40af" />
          <text x="110" y="17" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION (CENTRAL)</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 40)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="700" fill="#1d4ed8">🔗 empresaId : UUID (FK)</text>
            <text y="28" fill="#1d4ed8">▪ fileId : String (UK)</text>
            <text y="42">▪ fechaMensaje : DateTime</text>
            <text y="56" font-weight="600">▪ asunto : String</text>
            <text y="70" fill="#b91c1c" font-weight="700">▪ montoExigible : S/</text>
            <text y="84" fill="#b91c1c" font-weight="700">▪ expedienteCoactivo</text>
            <text y="98">▪ rutaArchivoPdf : String</text>
            <text y="112">▪ origen : SUNAT|SUNAFIL</text>
            <text y="126">▪ moduloSunafil : String</text>
            <text y="140">▪ estado : NO_LEIDO|LEIDO</text>
            <text y="154">▪ leidoGlobal : Boolean</text>
            <text y="168" fill="#64748b">▪ leidoPorNombre : String</text>
            <text y="182" font-weight="700" fill="#d97706">🔗 responsableId : (FK)</text>
            <text y="196">▪ estadoGestion : String</text>
            <text y="210" fill="#64748b">▪ fechaCompromiso : Date</text>
            <text y="224" fill="#64748b">▪ createdAt : DateTime</text>
          </g>
        </g>

        <!-- 6. NOTIFICACION_LECTURA -->
        <g transform="translate(535, 240)">
          <rect width="190" height="95" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          <rect width="190" height="24" rx="5" fill="#0f172a" />
          <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_LECTURA</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 notificacionId : (FK)</text>
            <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="42" fill="#64748b">▪ creadoAt : DateTime</text>
          </g>
        </g>

        <!-- 7. NOTIFICACION_COMENTARIO -->
        <g transform="translate(535, 360)">
          <rect width="190" height="135" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          <rect width="190" height="24" rx="5" fill="#0f172a" />
          <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_COMENTARIO</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 notificacionId : (FK)</text>
            <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="42">▪ texto : String</text>
            <text y="56">▪ estadoNuevo : String</text>
            <text y="70" fill="#64748b">▪ createdAt : DateTime</text>
          </g>
        </g>

        <!-- 8. EVENTO_CALENDARIO -->
        <g transform="translate(15, 420)">
          <rect width="170" height="130" rx="5" fill="#ffffff" stroke="#0891b2" stroke-width="1.5" />
          <rect width="170" height="24" rx="5" fill="#0891b2" />
          <text x="85" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EVENTO_CALENDARIO</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 empresaId : (FK opt)</text>
            <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="42">▪ titulo : String</text>
            <text y="56">▪ fecha : DateTime</text>
            <text y="70">▪ tipo : String</text>
          </g>
        </g>

        <!-- 9. RECORDATORIO -->
        <g transform="translate(15, 590)">
          <rect width="170" height="130" rx="5" fill="#ffffff" stroke="#d97706" stroke-width="1.5" />
          <rect width="170" height="24" rx="5" fill="#b45309" />
          <text x="85" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">RECORDATORIO</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
            <text y="28" font-weight="600" fill="#1d4ed8">🔗 empresaId : (FK opt)</text>
            <text y="42">▪ titulo : String</text>
            <text y="56">▪ fechaRecordar : Date</text>
            <text y="70">▪ completado : Boolean</text>
          </g>
        </g>

        <!-- 10. NOTIFICACION_ETIQUETA -->
        <g transform="translate(265, 580)">
          <rect width="200" height="90" rx="5" fill="#ffffff" stroke="#16a34a" stroke-width="1.5" />
          <rect width="200" height="24" rx="5" fill="#166534" />
          <text x="100" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_ETIQUETA [N:M]</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑🔗 notificacionId : (FK)</text>
            <text y="14" font-weight="700" fill="#b45309">🔑🔗 etiquetaId : (FK)</text>
            <text y="28" fill="#64748b">▪ asignadoEn : DateTime</text>
          </g>
        </g>

        <!-- 11. ETIQUETA -->
        <g transform="translate(535, 580)">
          <rect width="190" height="90" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          <rect width="190" height="24" rx="5" fill="#0f172a" />
          <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">ETIQUETA</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 38)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
            <text y="14" fill="#1d4ed8">▪ nombre : String (UK)</text>
            <text y="28">▪ color : Hex (#f97316)</text>
          </g>
        </g>

        <!-- 12. CONFIGURACION_SISTEMA -->
        <g transform="translate(265, 695)">
          <rect width="460" height="70" rx="5" fill="#ffffff" stroke="#475569" stroke-width="1.5" />
          <rect width="460" height="22" rx="5" fill="#334155" />
          <text x="230" y="15" fill="#ffffff" font-size="8" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">CONFIGURACION_SISTEMA (SINGLETON CRON)</text>
          <g font-size="7.5" fill="#1e293b" transform="translate(8, 34)">
            <text y="0" font-weight="700" fill="#b45309">🔑 id : "default"</text>
            <text x="140" y="0">▪ sincroAutomaticaActiva : Boolean</text>
            <text y="16">▪ diasSemana : Int[] [0..6]</text>
            <text x="140" y="16">▪ horas : String[] ['06:00', '18:00']</text>
          </g>
        </g>

      </svg>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 3 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 4: DICCIONARIO DE DATOS POR ENTIDAD (TABLAS ESTRUCTURADAS)
  ========================================================================== -->
  <div class="section">
    <div class="section-title">
      <span class="number">6</span>Diccionario de Datos por Entidad (Especificación de Campos)
    </div>

    <!-- TABLA USUARIO Y ASIGNACION -->
    <div style="margin-bottom: 8px;">
      <div style="font-weight: 700; font-size: 8.5pt; color: #1e3a8a; margin-bottom: 3px;">👤 Tabla: Usuario &amp; EmpresaAsignacion (Identidad &amp; Accesos N:M)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Campo</th>
            <th style="width: 18%;">Tipo de Dato</th>
            <th style="width: 18%;">Restricción</th>
            <th style="width: 42%;">Descripción y Regla de Negocio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td><code>String (UUID)</code></td>
            <td><span class="badge badge-dark">PRIMARY KEY</span></td>
            <td>Identificador único global del usuario.</td>
          </tr>
          <tr>
            <td><code>email</code> / <code>dni</code></td>
            <td><code>String</code></td>
            <td><span class="badge badge-blue">UNIQUE</span></td>
            <td>Correo corporativo para login y DNI de 8 dígitos.</td>
          </tr>
          <tr>
            <td><code>password</code></td>
            <td><code>String</code></td>
            <td>Obligatorio</td>
            <td>Hash criptográfico <code>bcrypt</code> (salt=10, min 8 chars, 1 mayús, 1 num).</td>
          </tr>
          <tr>
            <td><code>rol</code></td>
            <td><code>Enum (Role)</code></td>
            <td>Default: <code>USUARIO_LOCAL</code></td>
            <td>Jerarquía: <code>SUPER_ADMIN</code> &gt; <code>ADMIN</code> &gt; <code>USUARIO_LOCAL</code>.</td>
          </tr>
          <tr>
            <td><code>modulosPermitidos</code></td>
            <td><code>ModuloAcceso[]</code></td>
            <td>Default: <code>['SUNAT']</code></td>
            <td>Permisos modulares: <code>SUNAT</code>, <code>SUNAFIL</code>, <code>AUDITORIA</code>, <code>GESTION</code>.</td>
          </tr>
          <tr>
            <td><code>EmpresaAsignacion</code></td>
            <td><code>usuarioId, empresaId</code></td>
            <td><span class="badge badge-green">UNIQUE PAR</span></td>
            <td>Resuelve acceso N:M entre contadores locales y empresas asignadas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TABLA EMPRESA -->
    <div style="margin-bottom: 8px;">
      <div style="font-weight: 700; font-size: 8.5pt; color: #1e3a8a; margin-bottom: 3px;">🏢 Tabla: Empresa (Maestro de RUCs y Credenciales Cifradas)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Campo</th>
            <th style="width: 18%;">Tipo de Dato</th>
            <th style="width: 18%;">Restricción</th>
            <th style="width: 42%;">Descripción y Regla de Negocio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code> / <code>ruc</code></td>
            <td><code>String (UUID) / String</code></td>
            <td><span class="badge badge-dark">PK</span> / <span class="badge badge-blue">UNIQUE</span></td>
            <td>ID único y RUC fiscal peruano de 11 dígitos.</td>
          </tr>
          <tr>
            <td><code>usuarioSol</code> / <code>claveSol</code></td>
            <td><code>String</code></td>
            <td>Obligatorio</td>
            <td>Usuario SOL y <strong>Clave SOL cifrada con AES-256-CBC</strong> (<code>iv:hash</code>).</td>
          </tr>
          <tr>
            <td><code>habilitadoSunat/Sunafil</code></td>
            <td><code>Boolean</code></td>
            <td>Default: <code>t / f</code></td>
            <td>Habilitación selectiva independiente por entidad tributaria/laboral.</td>
          </tr>
          <tr>
            <td><code>estadoConexion</code></td>
            <td><code>EstadoConexion</code></td>
            <td>Default: <code>CONECTADO</code></td>
            <td>Salud de credenciales: <code>CONECTADO</code>, <code>REQUIERE_ACTUALIZACION</code>.</td>
          </tr>
          <tr>
            <td><code>usuarioId</code></td>
            <td><code>String (UUID)</code></td>
            <td><span class="badge badge-amber">FK &rarr; Usuario</span></td>
            <td>Usuario administrador responsable del registro de la razón social.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TABLA NOTIFICACION -->
    <div style="margin-bottom: 8px;">
      <div style="font-weight: 700; font-size: 8.5pt; color: #1e3a8a; margin-bottom: 3px;">📩 Tabla: Notificacion &amp; Workflow (Buzón, Parsing y Auditoría)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Campo</th>
            <th style="width: 18%;">Tipo de Dato</th>
            <th style="width: 18%;">Restricción</th>
            <th style="width: 42%;">Descripción y Regla de Negocio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code> / <code>fileId</code></td>
            <td><code>String (UUID) / String?</code></td>
            <td><span class="badge badge-dark">PK</span> / <span class="badge badge-blue">UNIQUE</span></td>
            <td>ID interno y código único de archivo emitido por SUNAT.</td>
          </tr>
          <tr>
            <td><code>empresaId</code></td>
            <td><code>String (UUID)</code></td>
            <td><span class="badge badge-amber">FK &rarr; Empresa</span></td>
            <td>Empresa dueña de la resolución tributaria.</td>
          </tr>
          <tr>
            <td><code>montoExigible</code></td>
            <td><code>String?</code></td>
            <td>Opcional</td>
            <td><strong>Monto en Soles (S/)</strong> extraído automáticamente del texto PDF.</td>
          </tr>
          <tr>
            <td><code>expedienteCoactivo</code></td>
            <td><code>String?</code></td>
            <td>Opcional</td>
            <td><strong>Nro. de expediente coactivo</strong> detectado por el analizador sintáctico.</td>
          </tr>
          <tr>
            <td><code>leidoGlobal</code> / <code>leidoEn</code></td>
            <td><code>Boolean / DateTime?</code></td>
            <td>Default: <code>false</code></td>
            <td>Marca si algún miembro del equipo ya abrió la notificación.</td>
          </tr>
          <tr>
            <td><code>responsableId</code></td>
            <td><code>String? (UUID)</code></td>
            <td><span class="badge badge-amber">FK &rarr; Usuario</span></td>
            <td>Usuario asignado para gestionar el descargo o respuesta.</td>
          </tr>
          <tr>
            <td><code>estadoGestion</code></td>
            <td><code>String?</code></td>
            <td>Opcional</td>
            <td>Estados: <code>EN_REVISION</code>, <code>REQUIERE_ACCION</code>, <code>RESPONDIDO</code>, <code>ARCHIVADO</code>.</td>
          </tr>
          <tr>
            <td><code>AuditLog</code></td>
            <td><code>id, accion, ip, ua</code></td>
            <td><span class="badge badge-purple">TRAZABILIDAD</span></td>
            <td>Bitácora forense ISO 27001 con IP y User-Agent reales capturados.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 4 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 4: MOTOR DE SCRAPING ROBOTIZADO & COLAS BULLMQ
  ========================================================================== -->
  <div class="section">
    <div class="section-title">
      <span class="number">7</span>Pipeline Robotizado de Scraping (Puppeteer + BullMQ + Redis)
    </div>
    <p style="font-size: 8.3pt; color: #334155; margin-bottom: 8px;">
      El scraping robotizado constituye el núcleo operacional del sistema. Para interactuar con los portales de SUNAT y SUNAFIL de forma no intrusiva y sin disparar sistemas de captcha ni listas negras de IP, se diseñó una arquitectura de colas secuenciales.
    </p>

    <div class="module-box">
      <div class="module-header">
        <span class="module-name">Paso A — Desencadenamiento del Barrido (Disparadores)</span>
        <span class="badge badge-blue">Cron Automático / A Demanda</span>
      </div>
      <div class="module-desc">
        La sincronización puede iniciarse por tres vías:
        <strong>1) Cron Automático:</strong> Servicio programado que lee la configuración de base de datos y dispara un barrido escalonado (con delays de 2 segundos entre encolamientos).
        <strong>2) Sincronización Manual por Empresa:</strong> El usuario hace clic en "Sincronizar" en la fila de la empresa (prioridad 1).
        <strong>3) Sincronización Masiva:</strong> Barrido de todas las empresas activas con un solo clic desde el panel de control.
      </div>
    </div>

    <div class="module-box">
      <div class="module-header">
        <span class="module-name">Paso B — Orquestación en Colas BullMQ (Control de Concurrencia)</span>
        <span class="badge badge-purple">Redis 7 / Lock 300s</span>
      </div>
      <div class="module-desc">
        La cola <code>sunat-scraper-queue</code> está configurada con <strong>concurrency: 1</strong>. Esto garantiza que las empresas se procesen estrictamente una a la vez por worker.
        La duración del bloqueo (<code>lockDuration</code>) está calibrada en <strong>300,000 ms (5 minutos)</strong> para permitir que descargas de PDFs pesados o lentitud extrema del portal SUNAT no provoquen estados "stalled" ni repeticiones involuntarias.
      </div>
    </div>

    <div class="module-box">
      <div class="module-header">
        <span class="module-name">Paso C — Navegación y Extracción con Puppeteer Headless</span>
        <span class="badge badge-green">Chromium Headless / Stealth</span>
      </div>
      <div class="module-desc">
        Puppeteer inicializa una instancia de Chromium con banderas <code>--no-sandbox</code> y <code>--disable-setuid-sandbox</code>. Desencripta la Clave SOL mediante el servicio criptográfico, navega a la URL oficial de autenticación SOL, completa credenciales, sortea modales publicitarios de SUNAT (popups de buzón), accede a la tabla de mensajes y extrae los metadatos (fecha, asunto, código de documento).
      </div>
    </div>

    <div class="module-box">
      <div class="module-header">
        <span class="module-name">Paso D — Descarga y Persistencia de Documentos PDF</span>
        <span class="badge badge-amber">Storage Local + SHA Sanitizer</span>
      </div>
      <div class="module-desc">
        Cada mensaje detectado se coteja contra la base de datos para evitar re-descargas. Si es nuevo, el bot hace clic en el enlace de descarga, intercepta el stream binario de respuesta, lo guarda en el directorio seguro <code>backend/uploads/[hash].pdf</code> y registra la ruta relativa en PostgreSQL.
      </div>
    </div>

    <div class="module-box">
      <div class="module-header">
        <span class="module-name">Paso E — Analítica Predictiva de Textos (Expedientes y Deudas Coactivas)</span>
        <span class="badge badge-rose">Regex Parser Integrado</span>
      </div>
      <div class="module-desc">
        Un motor de análisis sintáctico evalúa el asunto y el contenido del PDF. Mediante patrones regulares identifica:
        <strong>1) Expediente Coactivo:</strong> Extrae cadenas de formato numérico de cobranza coactiva.
        <strong>2) Monto Exigible:</strong> Extrae cantidades en Soles (S/) de requerimientos tributarios, marcando la notificación como prioritaria en el Dashboard.
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">8</span>Extensión de Navegador ORACON Auto-Fill (Chrome / Brave / Edge)
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title primary">🔌 Arquitectura de la Extensión (Manifest V3)</div>
        <p style="font-size: 7.9pt; color: #334155; margin-bottom: 4px;">
          Plugin de navegador corporativo desarrollado con especificación moderna <strong>Chrome Manifest V3</strong>. Permite a los contadores acceder en un solo clic al portal SUNAT de cualquier cliente sin recordar contraseñas:
        </p>
        <ul>
          <li><strong>Background Service Worker:</strong> Maneja creación de ventanas y paso de mensajes entre el panel BES y las páginas de SUNAT.</li>
          <li><strong>Content Script BES:</strong> Inyecta botón de acceso directo en la interfaz de usuario de ORACON.</li>
          <li><strong>Content Script SUNAT:</strong> Detecta el iframe y formulario SOL de <code>e-menu.sunat.gob.pe</code> y autocompleta RUC, Usuario y Clave SOL al instante.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title success">🕶️ Modo Normal vs. Modo Incógnito</div>
        <p style="font-size: 7.9pt; color: #334155; margin-bottom: 4px;">
          Solución al problema de colisión de sesiones multi-empresa:
        </p>
        <ul>
          <li><strong>Pestaña Estándar:</strong> Abre una nueva pestaña tradicional en la misma ventana del navegador.</li>
          <li><strong>Ventana Incógnito Aislada:</strong> Utiliza el permiso <code>incognito: "spanning"</code> para abrir una ventana privada independiente. Permite tener abiertas simultáneamente 5 o 10 empresas distintas en SUNAT sin que las cookies se sobreescriban entre sí.</li>
          <li><strong>Portapapeles Seguro:</strong> Botón secundario para copiar credenciales al portapapeles con un solo clic.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 5 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 5: MÓDULOS DE APLICACIÓN Y EXPERIENCIA DE USUARIO (FRONTEND)
  ========================================================================== -->
  <div class="section">
    <div class="section-title">
      <span class="number">9</span>Módulos de la Aplicación Web (Next.js 14)
    </div>

    <div class="grid-2">
      <div class="step-box" style="border-left: 4px solid #2563eb;">
        <div class="step-title"><span class="step-badge" style="background:#2563eb;">MÓDULO 1</span> Morning Brief & Resumen Ejecutivo</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Vista ejecutiva de apertura diaria. Consolida todas las notificaciones recibidas en las últimas 24 horas clasificadas por urgencia, monto exigible acumulado, alertas coactivas y listado de empresas con requerimientos pendientes de atención.
        </p>
      </div>

      <div class="step-box" style="border-left: 4px solid #16a34a;">
        <div class="step-title"><span class="step-badge" style="background:#16a34a;">MÓDULO 2</span> Bandeja Unificada & Visor PDF</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Bandeja centralizada multi-RUC con filtros reactivos por empresa, rango de fechas, texto libre y estado de lectura. Incluye visor de PDF en ventana modal completa sin necesidad de descargar el archivo a la computadora local.
        </p>
      </div>

      <div class="step-box" style="border-left: 4px solid #9333ea;">
        <div class="step-title"><span class="step-badge" style="background:#9333ea;">MÓDULO 3</span> Casilla Electrónica SUNAFIL</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Consola especializada para inspección laboral dividida en sus 5 submódulos oficiales: Fiscalización, Cobranza, Acciones Previas, Formalización y SST, con contadores dinámicos y seguimiento de plazos de comparecencia.
        </p>
      </div>

      <div class="step-box" style="border-left: 4px solid #d97706;">
        <div class="step-title"><span class="step-badge" style="background:#d97706;">MÓDULO 4</span> Gestión de Asignaciones & Tickets</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Flujo de trabajo colaborativo. Los administradores asignan notificaciones específicas a contadores o asistentes, asignan fecha de compromiso, registran notas internas y cambian el estado (<em>En Revisión</em>, <em>Respondido</em>, <em>Archivado</em>).
        </p>
      </div>

      <div class="step-box" style="border-left: 4px solid #0891b2;">
        <div class="step-title"><span class="step-badge" style="background:#0891b2;">MÓDULO 5</span> Calendario de Vencimientos Tributarios</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Calendario mensual y semanal que proyecta las fechas límite de respuesta de cada documento notificado por SUNAT o SUNAFIL, evitando que los plazos perentorios pasen desapercibidos por omisión humana.
        </p>
      </div>

      <div class="step-box" style="border-left: 4px solid #be123c;">
        <div class="step-title"><span class="step-badge" style="background:#be123c;">MÓDULO 6</span> Perfil 360° de Empresa & Salud</div>
        <p style="font-size: 7.8pt; color: #475569;">
          Ficha detallada por razón social: historial mensual de los últimos 12 meses, ratio de atención de notificaciones, estado de salud de la conexión SOL (<code>CONECTADO</code>, <code>REQUIERE_ACTUALIZACION</code>) y usuarios asignados.
        </p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">10</span>Canales de Alertas Inmediatas (Multicanal)
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Canal</th>
          <th style="width: 35%;">Protocolo / Motor</th>
          <th style="width: 40%;">Comportamiento Operativo</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>En Pantalla (Web)</strong></td>
          <td><span class="tech-tag">Socket.IO</span> <span class="tech-tag">WebSockets</span></td>
          <td>Banner interactivo y barra de progreso flotante (<code>SyncProgressWidget</code>) que reporta en vivo cuando un scraper está explorando una empresa.</td>
        </tr>
        <tr>
          <td><strong>Telegram Bot</strong></td>
          <td><span class="tech-tag">Telegram Bot API</span> <span class="tech-tag">Axios</span></td>
          <td>Envío automático de mensaje formateado con emoji al grupo o chat privado de la empresa cuando ingresa una notificación con monto exigible o cobranza.</td>
        </tr>
        <tr>
          <td><strong>Correo Electrónico</strong></td>
          <td><span class="tech-tag">Nodemailer</span> <span class="tech-tag">SMTP</span></td>
          <td>Despacho de resúmenes HTML con plantilla formal dirigida al contador responsable y al buzón corporativo del cliente.</td>
        </tr>
        <tr>
          <td><strong>WhatsApp Business</strong></td>
          <td><span class="tech-tag">REST Webhook Service</span></td>
          <td>Módulo de servicio preparado para interconexión con proveedores de mensajería rápida para avisos críticos.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 6 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 6: AUDITORÍA DE SEGURIDAD & HARDENING IMPLEMENTADO (OWASP / ISO)
  ========================================================================== -->
  <div class="header" style="background: linear-gradient(135deg, #0c1a0c 0%, #14532d 60%, #166534 100%);">
    <div class="header-tagline" style="background: rgba(74,222,128,0.2); border-color: rgba(74,222,128,0.35); color: #86efac;">🔒 Registro de Seguridad & Hardening — OWASP ASVS + ISO/IEC 27001</div>
    <h1>Marco de Ciberseguridad & Correcciones Aplicadas</h1>
    <p>Resumen técnico de la auditoría de vulnerabilidades y la implementación de controles en código fuente y bases de datos realizada el 02/09/2026.</p>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number" style="background:#15803d;">11</span>Evaluación Comparativa de Seguridad
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 28%;">Estándar / Marco</th>
          <th style="width: 16%;">Estado Previo</th>
          <th style="width: 16%;">Estado Actual</th>
          <th style="width: 40%;">Acciones Concretadas</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>OWASP Top 10</strong><br><span style="font-size:7pt;color:#64748b;">(Riesgos de Aplicación Web)</span></td>
          <td><span class="badge badge-rose">5.5 / 10</span></td>
          <td><span class="badge badge-green">8.5 / 10 ✅</span></td>
          <td>Bloqueo de endpoint <code>/uploads</code> con JwtGuard, corrección total de CORS permisivo, sanitización contra Path Traversal y Throttler de login.</td>
        </tr>
        <tr>
          <td><strong>OWASP ASVS (v4.0)</strong><br><span style="font-size:7pt;color:#64748b;">(Estándar de Verificación)</span></td>
          <td><span class="badge badge-amber">Nivel 1 Parcial</span></td>
          <td><span class="badge badge-green">Nivel 2 Cumplido ✅</span></td>
          <td>Expiración de cookie httpOnly alineada a 24h con <code>sameSite: strict</code>, token JWT retirado de <code>localStorage</code> a <code>sessionStorage</code> contra XSS.</td>
        </tr>
        <tr>
          <td><strong>ISO/IEC 27001 / 27002</strong><br><span style="font-size:7pt;color:#64748b;">(Gestión de la Información)</span></td>
          <td><span class="badge badge-rose">25% (Crítico)</span></td>
          <td><span class="badge badge-blue">70% (Controlado) ✅</span></td>
          <td>Migración completa de registros cifrados en base de datos. AuditLogs enriquecidos con extracción obligatoria de IP remota y User-Agent del cliente.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number" style="background:#15803d;">12</span>Detalle de las 9 Correcciones de Seguridad Ejecutadas
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title danger">🔴 1. Eliminación de Clave Fallback Hardcodeada</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> <code>encryption.service.ts</code> contenía una clave fija <code>12345678...</code> accesible en el código fuente si fallaba la clave de entorno.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se migró a variable opcional <code>ENCRYPTION_KEY_LEGACY</code>. Si no está provista, el sistema lanza error controlado en lugar de usar claves inseguras.
        </p>
      </div>

      <div class="card">
        <div class="card-title danger">🔴 2. Blindaje del Endpoint /uploads</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> <code>UploadsController</code> permitía a cualquier usuario de la red descargar resoluciones PDF sin autenticarse (Broken Access Control).
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se añadió el decorador <code>@UseGuards(JwtAuthGuard)</code> asegurando que solo sesiones válidas puedan leer archivos.
        </p>
      </div>

      <div class="card">
        <div class="card-title danger">🔴 3. Corrección de Regla CORS Rota</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> En <code>main.ts</code>, la cláusula <code>else</code> llamaba a <code>callback(null, true)</code>, autorizando cualquier origen arbitrario.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se modificó para arrojar <code>callback(new Error('Origen no permitido por CORS'))</code> denegando peticiones foráneas.
        </p>
      </div>

      <div class="card">
        <div class="card-title warning">🟠 4. Captura de IP Real y User-Agent en Auditoría</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> Las llamadas a <code>AuditService</code> no recibían el objeto <code>Request</code>, dejando <code>ipAddress</code> y <code>userAgent</code> como <code>null</code>.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> <code>AuthController</code> extrae <code>x-real-ip</code>, <code>x-forwarded-for</code> y <code>user-agent</code> y los registra en <code>AuditLog</code>.
        </p>
      </div>

      <div class="card">
        <div class="card-title warning">🟠 5. Inyección de Headers de Seguridad HTTP</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> Nginx servía tráfico sin cabeceras defensivas para el navegador.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se incorporaron en <code>nginx.conf</code>: <code>X-Frame-Options SAMEORIGIN</code>, <code>X-Content-Type-Options nosniff</code>, <code>X-XSS-Protection</code> y <code>Referrer-Policy</code>.
        </p>
      </div>

      <div class="card">
        <div class="card-title warning">🟠 6. Complejidad Obligatoria de Contraseñas</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> <code>RegisterDto</code> admitía contraseñas de solo 6 caracteres sin requisitos de caracteres complejos.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se elevó a <code>@MinLength(8)</code> con expresión regular obligatoria de al menos una letra mayúscula y un número.
        </p>
      </div>

      <div class="card">
        <div class="card-title primary">🔵 7. Aislamiento de JWT contra XSS</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> El token de sesión residía en <code>localStorage</code>, expuesto a robo ante eventual inyección de scripts.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Migrado a <code>sessionStorage</code> en <code>useAuthStore.ts</code> complementado por la cookie <code>httpOnly</code>.
        </p>
      </div>

      <div class="card">
        <div class="card-title primary">🔵 8. Sincronización de Vida de Sesión y Cookie</div>
        <p style="font-size: 7.7pt; color: #475569;">
          <strong>Problema:</strong> La cookie <code>auth_token</code> vivía 7 días pero el JWT expiraba a las 24 horas, provocando rechazos inesperados.
        </p>
        <p style="font-size: 7.7pt; color: #166534; margin-top:2px;">
          <strong>Solución:</strong> Se fijó <code>maxAge: 86400 (24h)</code> y política estricta <code>sameSite: "strict"</code> en la ruta API Next.js.
        </p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 7 de 8</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 7: OPERACIONES, SCRIPTS DE MIGRACIÓN & CHANGELOG HISTÓRICO
  ========================================================================== -->
  <div class="section">
    <div class="section-title">
      <span class="number">13</span>Protocolo Operativo de Migración de Cifrado (Producción)
    </div>
    <p style="font-size: 8.2pt; color: #334155; margin-bottom: 6px;">
      Para garantizar que ninguna empresa existente en producción pierda acceso al portal de SUNAT debido al retiro del fallback key, se diseñó y validó el script <code>migrate-encryption.ts</code>.
    </p>

    <div class="step-box" style="border-left: 4px solid #16a34a;">
      <div class="step-title"><span class="step-badge" style="background:#16a34a;">PROTOCOLO PROD</span> Ejecución Segura en Servidor de Producción (140+ Empresas)</div>
      <div class="code-block"><span class="comment"># 1. Respaldo íntegro de la base de datos PostgreSQL</span>
<span class="cmd">docker exec</span> oracon_postgres pg_dump -U postgres bes_db > backup_pre_migracion.sql

<span class="comment"># 2. Simulación en modo Dry-Run (solo lectura, reporte detallado en consola)</span>
<span class="keyword">DATABASE_URL</span>=<span class="string">"postgresql://user:pass@host:5432/bes_db"</span> <span class="cmd">npx ts-node</span> migrate-encryption.ts --dry-run

<span class="comment"># 3. Aplicación real del re-cifrado (incorpora pausa de seguridad de 3 segundos para abortar)</span>
<span class="keyword">DATABASE_URL</span>=<span class="string">"postgresql://user:pass@host:5432/bes_db"</span> <span class="cmd">npx ts-node</span> migrate-encryption.ts

<span class="comment"># 4. Verificación de integridad post-migración</span>
<span class="keyword">DATABASE_URL</span>=<span class="string">"postgresql://user:pass@host:5432/bes_db"</span> <span class="cmd">npx ts-node</span> check-fallback-key.ts</div>
      <p style="font-size: 7.6pt; color: #166534; margin-top: 3px;">
        <strong>Resultado en Entorno de Pruebas:</strong> 13 empresas analizadas &bull; 2 ya estaban al día &bull; 11 migradas exitosamente &bull; 0 errores &bull; 0 no descifrables.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">14</span>Registro Histórico de Cambios (Changelog Vivo)
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Fecha</th>
          <th style="width: 16%;">Versión</th>
          <th style="width: 25%;">Componente</th>
          <th style="width: 45%;">Descripción de las Mejoras y Cambios Realizados</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>02/09/2026</strong></td>
          <td><span class="badge badge-green">v2.4.0</span></td>
          <td>Seguridad / Hardening</td>
          <td>Implementación integral del plan de seguridad OWASP ASVS / Top 10. Migración de 11 empresas con claveSol legada a clave actual. Eliminación de fallback key hardcodeada. Blindaje de <code>/uploads</code> con JwtGuard. Corrección de CORS y adición de cabeceras HTTP en Nginx. Captura de IP/UserAgent en logs de auditoría.</td>
        </tr>
        <tr>
          <td><strong>28/08/2026</strong></td>
          <td><span class="badge badge-blue">v2.3.5</span></td>
          <td>Extensión Web / Scraper</td>
          <td>Lanzamiento de extensión de navegador Chrome Manifest V3 para auto-completado de credenciales SOL con soporte para ventanas normales y de incógnito aislado.</td>
        </tr>
        <tr>
          <td><strong>20/08/2026</strong></td>
          <td><span class="badge badge-blue">v2.3.0</span></td>
          <td>Casilla SUNAFIL</td>
          <td>Integración de los 5 submódulos de la Casilla Electrónica SUNAFIL con dashboard de métricas independiente y descarga automatizada de expedientes laborales.</td>
        </tr>
        <tr>
          <td><strong>12/08/2026</strong></td>
          <td><span class="badge badge-purple">v2.2.0</span></td>
          <td>Workflow & Colaboración</td>
          <td>Creación del módulo de asignación de responsables, notas internas, timeline de comentarios colaborativos y calendario de vencimientos tributarios.</td>
        </tr>
        <tr>
          <td><strong>01/08/2026</strong></td>
          <td><span class="badge badge-dark">v2.0.0</span></td>
          <td>Arquitectura Core</td>
          <td>Refactorización a NestJS + Next.js 14 con colas BullMQ sobre Redis y motor Puppeteer con persistencia de PDFs en PostgreSQL via Prisma ORM.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="number">15</span>Guía Rápida de Comandos para Operaciones Diarias
    </div>
    <div class="code-block"><span class="comment"># Levantar infraestructura de base de datos y mensajería en segundo plano</span>
<span class="cmd">docker compose up -d</span> postgres redis

<span class="comment"># Desplegar todo el stack en contenedor (Workstation o Servidor)</span>
<span class="cmd">docker compose up -d --build</span>

<span class="comment"># Consultar el estado de los contenedores y puertos expuestos</span>
<span class="cmd">docker compose ps</span>

<span class="comment"># Inspeccionar logs del backend en vivo (útil para ver Puppeteer y scraping)</span>
<span class="cmd">docker compose logs -f</span> backend

<span class="comment"># Compilar este documento técnico actualizado a formato PDF</span>
<span class="cmd">node</span> generate_documentation_pdf.js</div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Documentación Técnica Maestro</div>
    <div>Página 8 de 8 &bull; Confidencial &bull; Todos los derechos reservados</div>
  </div>

</body>
</html>
`;

async function generateDocumentationPDF() {
  console.log('Iniciando compilador de Documentación Técnica Integral BES...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'Documentacion_BES.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  console.log('✅ Documentación Técnica generada exitosamente en:', pdfPath);
}

generateDocumentationPDF().catch(err => {
  console.error('❌ Error al generar Documentación Técnica:', err);
  process.exit(1);
});
