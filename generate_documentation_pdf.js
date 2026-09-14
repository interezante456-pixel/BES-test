const puppeteer = require('./backend/node_modules/puppeteer');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Técnico Maestro & Memoria del Proyecto — Sistema BES</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 10mm 11mm 12mm 11mm;
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
      font-size: 8.6pt;
      line-height: 1.4;
    }

    /* Portada Principal */
    .cover-container {
      min-height: 265mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: radial-gradient(circle at 85% 15%, #1e3a8a 0%, #0f172a 50%, #020617 100%);
      color: #ffffff;
      padding: 36px 32px;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px -12px rgba(2, 6, 23, 0.7);
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(59, 130, 246, 0.22);
      border: 1px solid rgba(147, 197, 253, 0.4);
      color: #93c5fd;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.4px;
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 20px;
    }

    .cover-title {
      font-family: 'Outfit', sans-serif;
      font-size: 28pt;
      font-weight: 900;
      letter-spacing: -0.8px;
      line-height: 1.12;
      color: #ffffff;
      margin-bottom: 12px;
    }

    .cover-title span {
      background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 11pt;
      color: #cbd5e1;
      font-weight: 300;
      line-height: 1.45;
      max-width: 90%;
      margin-bottom: 25px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 25px 0;
      padding: 18px;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }

    .cover-meta-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cover-meta-label {
      font-size: 7.2pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }

    .cover-meta-value {
      font-size: 9.5pt;
      color: #f8fafc;
      font-weight: 700;
    }

    .cover-kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 15px;
    }

    .cover-kpi-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .cover-kpi-num {
      font-family: 'Outfit', sans-serif;
      font-size: 16pt;
      font-weight: 800;
      color: #38bdf8;
    }

    .cover-kpi-txt {
      font-size: 7pt;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 2px;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 7.8pt;
      color: #94a3b8;
    }

    /* Encabezados de Capítulo y Secciones */
    .chapter-header {
      background: linear-gradient(135deg, #0b1528 0%, #0f172a 50%, #1e3a8a 100%);
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chapter-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chapter-num-badge {
      background: #2563eb;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 11pt;
      font-weight: 800;
      width: 32px;
      height: 32px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chapter-title {
      font-family: 'Outfit', sans-serif;
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .chapter-sub {
      font-size: 7.5pt;
      color: #94a3b8;
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 10.2pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 3px;
      margin: 10px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-title .number {
      background: #2563eb;
      color: #ffffff;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 7.2pt;
      font-weight: 800;
    }

    /* Grids & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 9px;
      margin-bottom: 7px;
    }

    .card-title {
      font-size: 8.6pt;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .card-title.primary { color: #1d4ed8; }
    .card-title.success { color: #15803d; }
    .card-title.warning { color: #b45309; }
    .card-title.danger  { color: #b91c1c; }
    .card-title.purple  { color: #6b21a8; }
    .card-title.dark    { color: #0f172a; }

    ul {
      padding-left: 14px;
      margin-top: 2px;
    }

    li {
      font-size: 8pt;
      color: #334155;
      margin-bottom: 2px;
      line-height: 1.34;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0 8px 0;
      font-size: 7.8pt;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 5px 7px;
      font-weight: 600;
      font-size: 7.1pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th:first-child { border-top-left-radius: 5px; }
    th:last-child { border-top-right-radius: 5px; }

    td {
      padding: 4.5px 7px;
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
      font-size: 6.8pt;
      font-weight: 600;
      margin-right: 2px;
      margin-bottom: 2px;
    }

    .badge {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 4px;
      font-size: 6.6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-blue   { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-green  { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-amber  { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-rose   { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
    .badge-dark   { background: #0f172a; color: #f8fafc; }

    .step-box {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      padding: 6px 9px;
      margin-bottom: 6px;
      page-break-inside: avoid;
    }

    .step-title {
      font-size: 8.3pt;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }

    .step-badge {
      background: #0f172a;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 6.4pt;
      font-weight: 700;
    }

    .code-block {
      background: #0b1320;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.9pt;
      padding: 6px 8px;
      border-radius: 5px;
      margin: 3px 0 6px 0;
      line-height: 1.34;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #1e293b;
    }

    .code-block .comment { color: #64748b; }
    .code-block .keyword { color: #f472b6; font-weight: 600; }
    .code-block .string  { color: #4ade80; }
    .code-block .val     { color: #fde047; }
    .code-block .cmd     { color: #38bdf8; font-weight: 600; }

    /* Índice visual */
    .toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin: 10px 0;
    }

    .toc-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 9px 11px;
      border-left: 4px solid #2563eb;
    }

    .toc-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .toc-chapter-title {
      font-family: 'Outfit', sans-serif;
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
    }

    .toc-page-badge {
      background: #e2e8f0;
      color: #334155;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 6.8pt;
      font-weight: 700;
    }

    .toc-items {
      font-size: 7.4pt;
      color: #64748b;
      line-height: 1.35;
    }

    .page-break {
      page-break-after: always;
    }

    .footer {
      font-size: 6.9pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <!-- =========================================================================
       PÁGINA 1: PORTADA PRINCIPAL INSTITUCIONAL
  ========================================================================== -->
  <div class="cover-container">
    <div>
      <div class="cover-badge">⚡ PLATAFORMA INTEGRAL DE MONITOREO TRIBUTARIO & LABORAL</div>
      <div class="cover-title">
        SISTEMA <span>BES</span>
      </div>
      <div class="cover-subtitle">
        Buzón Electrónico Automatizado para SUNAT (Buzón SOL) &amp; Casilla Electrónica SUNAFIL
      </div>

      <div style="font-family: 'Outfit', sans-serif; font-size: 13pt; font-weight: 700; color: #93c5fd; letter-spacing: 0.5px; margin-bottom: 6px;">
        INFORME TÉCNICO MAESTRO DE INGENIERÍA &amp; MEMORIA DE ARQUITECTURA
      </div>
      <p style="font-size: 8.5pt; color: #94a3b8; line-height: 1.4; max-width: 85%;">
        Documento técnico oficial con especificación de stack tecnológico, fases de producción, diseño entidad-relación, catálogo integral de vistas, pipeline robotizado de scraping con BullMQ, auditoría de seguridad y manual de despliegue.
      </p>

      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <span class="cover-meta-label">Versión de Producción</span>
          <span class="cover-meta-value">v2.5.0-PROD (Enterprise Multi-Tenant)</span>
        </div>
        <div class="cover-meta-item">
          <span class="cover-meta-label">Fecha de Emisión</span>
          <span class="cover-meta-value">14 de Septiembre de 2026</span>
        </div>
        <div class="cover-meta-item">
          <span class="cover-meta-label">Ámbito de Implementación</span>
          <span class="cover-meta-value">Estudios Contables, Corporativos &amp; Tributarios</span>
        </div>
        <div class="cover-meta-item">
          <span class="cover-meta-label">Estándar Criptográfico</span>
          <span class="cover-meta-value">AES-256-CBC (Zero-Hardcoded Fallback Keys)</span>
        </div>
      </div>

      <div class="cover-kpis">
        <div class="cover-kpi-card">
          <div class="cover-kpi-num">17</div>
          <div class="cover-kpi-txt">Módulos NestJS Core</div>
        </div>
        <div class="cover-kpi-card">
          <div class="cover-kpi-num">14</div>
          <div class="cover-kpi-txt">Tablas Relacionales Prisma</div>
        </div>
        <div class="cover-kpi-card">
          <div class="cover-kpi-num">150+</div>
          <div class="cover-kpi-txt">Empresas en Concurrencia</div>
        </div>
        <div class="cover-kpi-card">
          <div class="cover-kpi-num">98%</div>
          <div class="cover-kpi-txt">Ahorro en Horas/Hombre</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>Sistema BES — Buzón Electrónico SUNAT &amp; SUNAFIL &bull; Ingeniería &amp; Operaciones</div>
      <div>Confidencial &bull; Documentación Oficial de Arquitectura &bull; 2026</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 2: ÍNDICE GENERAL & TABLA DE CONTENIDOS
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">Í</div>
      <div>
        <div class="chapter-title">Índice General &amp; Tabla de Contenidos</div>
        <div class="chapter-sub">Estructura modular del Informe Técnico Maestro del Sistema BES</div>
      </div>
    </div>
    <span class="badge badge-blue">Documento de Ingeniería</span>
  </div>

  <div class="toc-grid">
    <div class="toc-card" style="border-left-color: #2563eb;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 1: Introducción y Marco Conceptual</span>
        <span class="toc-page-badge">Pág. 3</span>
      </div>
      <div class="toc-items">
        &bull; 1.1 ¿Qué es el Sistema BES?<br>
        &bull; 1.2 Planteamiento del Problema &amp; Justificación<br>
        &bull; 1.3 Objetivos del Proyecto (General y Específicos)<br>
        &bull; 1.4 Alcance, Beneficios y Mitigación de Riesgos
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #0891b2;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 2: Arquitectura y Stack Tecnológico</span>
        <span class="toc-page-badge">Pág. 4</span>
      </div>
      <div class="toc-items">
        &bull; 2.1 Filosofía de Arquitectura Desacoplada<br>
        &bull; 2.2 Stack Frontend (Next.js 14, Zustand, Tailwind)<br>
        &bull; 2.3 Stack Backend (NestJS 10, Passport JWT, RBAC)<br>
        &bull; 2.4 Motor de Scraping (Puppeteer, BullMQ, Redis 7)<br>
        &bull; 2.5 Infraestructura, Docker y Nginx Reverse Proxy
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #16a34a;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 3: Ciclo de Producción (Paso a Paso)</span>
        <span class="toc-page-badge">Pág. 5</span>
      </div>
      <div class="toc-items">
        &bull; 3.1 Fase 1: Génesis, Prototipado y Desafíos Fiscales<br>
        &bull; 3.2 Fase 2: Refactorización a NestJS + Prisma ORM<br>
        &bull; 3.3 Fase 3: Orquestación Asíncrona BullMQ &amp; Redis<br>
        &bull; 3.4 Fase 4: Integración 5 Submódulos SUNAFIL<br>
        &bull; 3.5 Fase 5: Hardening OWASP y Cifrado AES-256<br>
        &bull; 3.6 Fase 6: Directorio Maestro y Desacoplamiento
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #9333ea;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 4: Modelado de Base de Datos</span>
        <span class="toc-page-badge">Pág. 6-7</span>
      </div>
      <div class="toc-items">
        &bull; 4.1 Esquema Conceptual y Justificación<br>
        &bull; 4.2 Diagrama Visual Entidad-Relación Físico<br>
        &bull; 4.3 Matriz de Relaciones Foreign Key y On Delete<br>
        &bull; 4.4 Diccionario de Datos Exhaustivo por Entidad<br>
        &bull; 4.5 Índices Compuestos y Rendimiento SQL
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #ea580c;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 5: Catálogo de Vistas (Frontend UX)</span>
        <span class="toc-page-badge">Pág. 8</span>
      </div>
      <div class="toc-items">
        &bull; 5.1 Login y Autenticación con Roles Dinámicos<br>
        &bull; 5.2 Morning Brief Matutino y KPI Ejecutivo<br>
        &bull; 5.3 Directorio Maestro de Empresas Centralizado<br>
        &bull; 5.4 Consolas Satélite SUNAT y SUNAFIL<br>
        &bull; 5.5 Bandeja Unificada &amp; Visor PDF Integrado<br>
        &bull; 5.6 Tickets, Asignaciones, Calendario y Extensión
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #be123c;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 6 &amp; 7: Scraping, Seguridad y Operación</span>
        <span class="toc-page-badge">Pág. 9</span>
      </div>
      <div class="toc-items">
        &bull; 6.1 Ciclo de Vida del Job (Disparador a Storage)<br>
        &bull; 6.2 Parsing Regex de Deudas y Expedientes Coactivos<br>
        &bull; 7.1 Hardening de Seguridad OWASP ASVS<br>
        &bull; 7.2 Scripts NPM de Migración Criptográfica<br>
        &bull; 7.3 Guía Rápida de Comandos para Operaciones
      </div>
    </div>

    <div class="toc-card" style="border-left-color: #047857;">
      <div class="toc-card-header">
        <span class="toc-chapter-title">Capítulo 8: Conclusiones y Hoja de Ruta</span>
        <span class="toc-page-badge">Pág. 10</span>
      </div>
      <div class="toc-items">
        &bull; 8.1 Logros Técnicos y Operativos Alcanzados<br>
        &bull; 8.2 Registro Histórico de Versiones (Changelog Vivo)<br>
        &bull; 8.3 Próximos Desarrollos (IA OCR, WhatsApp API)
      </div>
    </div>
  </div>

  <div class="step-box" style="border-left: 4px solid #1e3a8a; margin-top: 10px;">
    <div class="step-title"><span class="step-badge" style="background:#1e3a8a;">NOTAS DE ALCANCE</span> Metodología de Documentación Continua</div>
    <p style="font-size: 7.8pt; color: #475569; line-height: 1.35;">
      Este documento se actualiza automáticamente mediante el motor Headless Puppeteer invocando el script compilador <code>generate_documentation_pdf.js</code>. Garantiza que la arquitectura descrita coincida con el código fuente desplegado en producción.
    </p>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Índice General</div>
    <div>Página 2 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 3: CAPÍTULO 1 — INTRODUCCIÓN Y MARCO CONCEPTUAL
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">1</div>
      <div>
        <div class="chapter-title">Introducción y Marco Conceptual del Sistema</div>
        <div class="chapter-sub">Definición, justificación de negocio, problemática fiscal y objetivos de ingeniería</div>
      </div>
    </div>
    <span class="badge badge-green">Marco Conceptual</span>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">1.1</span>¿Qué es el Sistema BES?</div>
    <p style="font-size: 8.2pt; color: #334155; margin-bottom: 6px;">
      El <strong>Sistema BES (Buzón Electrónico SUNAT &amp; SUNAFIL)</strong> es una plataforma de software empresarial diseñada para automatizar íntegramente la consulta, extracción, descarga, clasificación y alerta temprana de actos administrativos, resoluciones coactivas, esquelas de citación y órdenes de pago emitidas por las entidades reguladoras del Estado Peruano: la <strong>Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)</strong> y la <strong>Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)</strong>.
    </p>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title danger">⚠️ 1.2 Planteamiento del Problema</div>
      <p style="font-size: 7.7pt; color: #475569; margin-bottom: 4px;">
        En el ecosistema empresarial peruano, la notificación electrónica surte efecto legal a partir del día hábil siguiente a su depósito en el buzón SOL, sin requerir confirmación de lectura:
      </p>
      <ul>
        <li><strong>Riesgo de Coactiva y Embargo:</strong> Resoluciones de cobranza coactiva otorgan 7 días hábiles para el pago antes de emitir medidas cautelares sobre cuentas bancarias.</li>
        <li><strong>Esquelas con Plazo de 3 Días:</strong> Fiscalizaciones tributarias exigen subsanación en plazos perentorios de 3 a 5 días hábiles; su omisión acarrea multas automáticas (Art. 177° Código Tributario).</li>
        <li><strong>Carga Laboral Repetitiva:</strong> Un estudio contable con 50 empresas gasta más de 4 horas diarias ingresando manualmente RUC por RUC, superando modales publicitarios y descargando PDFs uno a uno.</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title success">🎯 1.3 Objetivos del Proyecto</div>
      <p style="font-size: 7.7pt; color: #475569; margin-bottom: 4px;">
        <strong>Objetivo General:</strong> Eliminar el riesgo legal y fiscal por omisión de notificaciones mediante una tubería autónoma de consulta y alerta inmediata.
      </p>
      <ul>
        <li><strong>Automatización No Intrusiva:</strong> Simular navegación humana mediante bots headless con control de cadencia en colas Redis.</li>
        <li><strong>Consolidación Multi-Empresa:</strong> Directorio Maestro único para administrar 150+ RUCs con control selectivo de monitoreo.</li>
        <li><strong>Parsing Predictivo:</strong> Detección instantánea de expedientes coactivos y montos exigibles en Soles (S/) mediante expresiones regulares.</li>
        <li><strong>Seguridad de Datos Cero-Confianza:</strong> Cifrado criptográfico AES-256-CBC en todas las credenciales fiscales almacenadas.</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">1.4</span>Alcance y Beneficios Cuantitativos del Sistema</div>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Indicador Operativo</th>
          <th style="width: 35%;">Flujo Tradicional Manual</th>
          <th style="width: 40%;">Flujo Automatizado con Sistema BES</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiempo por Empresa</strong></td>
          <td>4 a 6 minutos por RUC en portal SOL</td>
          <td><span class="badge badge-green">15 a 25 segundos</span> por barrido robotizado</td>
        </tr>
        <tr>
          <td><strong>Riesgo de Omisión</strong></td>
          <td>Alto (olvidos, feriados, licencias de personal)</td>
          <td><span class="badge badge-green">0%</span> (Monitoreo cron 24/7 sin descanso)</td>
        </tr>
        <tr>
          <td><strong>Detección de Coactivas</strong></td>
          <td>Depende de apertura manual de cada PDF</td>
          <td><span class="badge badge-green">Inmediata</span> con parsing sintáctico y alerta Telegram</td>
        </tr>
        <tr>
          <td><strong>Acceso a Credenciales</strong></td>
          <td>Archivos Excel vulnerables o libretas físicas</td>
          <td><span class="badge badge-blue">Cifrado AES-256</span> + Extensión Auto-Fill</td>
        </tr>
        <tr>
          <td><strong>Cobertura Entidades</strong></td>
          <td>Solo SUNAT (SUNAFIL se suele omitir por tiempo)</td>
          <td><span class="badge badge-purple">SUNAT + SUNAFIL</span> (5 submódulos en paralelo)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Introducción y Marco Conceptual</div>
    <div>Página 3 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 4: CAPÍTULO 2 — ARQUITECTURA TECNOLÓGICA Y STACK
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">2</div>
      <div>
        <div class="chapter-title">Arquitectura Tecnológica y Stack Utilizado</div>
        <div class="chapter-sub">Topología de microservicios, frontend modular, capas backend, scraping y criptografía</div>
      </div>
    </div>
    <span class="badge badge-blue">Stack Tecnológico</span>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">2.1</span>Filosofía de Arquitectura del Sistema</div>
    <p style="font-size: 8.2pt; color: #334155; margin-bottom: 6px;">
      El sistema se diseñó bajo una arquitectura cliente-servidor orientada a servicios desacoplados. La capa visual (Next.js 14) consume la API REST de NestJS mediante contratos tipados en TypeScript, mientras que las operaciones intensivas de I/O (navegación con Chromium y descarga de PDFs) se delegan asíncronamente a colas BullMQ respaldadas por Redis 7, aislando por completo la API de bloqueos por latencia de los servidores estatales.
    </p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Capa</th>
        <th style="width: 25%;">Tecnología / Framework</th>
        <th style="width: 57%;">Responsabilidad de Arquitectura e Implementación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend Web</strong></td>
        <td><span class="tech-tag">Next.js 14 (App Router)</span> <span class="tech-tag">React 18</span> <span class="tech-tag">TailwindCSS</span> <span class="tech-tag">Zustand</span></td>
        <td>Directorio Maestro centralizado multi-entidad con toggles de monitoreo independiente, consolas satélite SUNAT/SUNAFIL, visor PDF integrado, RBAC dinámico en tiempo real y morning-brief ejecutivo.</td>
      </tr>
      <tr>
        <td><strong>Backend Core</strong></td>
        <td><span class="tech-tag">NestJS 10</span> <span class="tech-tag">TypeScript</span> <span class="tech-tag">Passport JWT</span> <span class="tech-tag">Throttler</span></td>
        <td>API REST modular, endpoints de control granular (<code>/toggle-sunat</code>, <code>/toggle-sunafil</code>), borrado en cascada transaccional seguro con auditoría obligatoria, guards RBAC y tubería DTO.</td>
      </tr>
      <tr>
        <td><strong>Motor Scraping</strong></td>
        <td><span class="tech-tag">Puppeteer Stealth</span> <span class="tech-tag">Chromium Headless</span></td>
        <td>Navegación automatizada sobre portales SUNAT/SUNAFIL, resolución de sesiones SSO, bypass de modales publicitarios y captura de streams PDF binarios.</td>
      </tr>
      <tr>
        <td><strong>Colas &amp; Concurrencia</strong></td>
        <td><span class="tech-tag">BullMQ</span> <span class="tech-tag">Redis 7 Alpine</span></td>
        <td>Planificador asíncrono con control de concurrencia unitario (1 job simultáneo por worker) y lock de 300 segundos para asegurar descargas pesadas sin estados stalled.</td>
      </tr>
      <tr>
        <td><strong>Persistencia &amp; ORM</strong></td>
        <td><span class="tech-tag">PostgreSQL 16</span> <span class="tech-tag">Prisma ORM</span></td>
        <td>Base de datos relacional con 14 tablas tipadas, migraciones versionadas y claves foráneas con reglas de integridad estrictas.</td>
      </tr>
      <tr>
        <td><strong>Criptografía</strong></td>
        <td><span class="tech-tag">Node.js Crypto</span> <span class="tech-tag">AES-256-CBC</span> <span class="tech-tag">Bcrypt</span></td>
        <td>Cifrado simétrico de Clave SOL con IV único por registro y formato <code>iv:ciphertext</code>. Hash unidireccional de passwords con salt de 10 rondas.</td>
      </tr>
      <tr>
        <td><strong>Reverse Proxy</strong></td>
        <td><span class="tech-tag">Nginx Alpine</span> <span class="tech-tag">Docker Compose</span></td>
        <td>Terminación reverse proxy, enrutamiento a puertos 3000/4000, límites de subida (50M) y headers de seguridad HTTP (HSTS, CSP, X-Frame-Options).</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-2">
    <div class="card">
      <div class="card-title primary">🔒 Seguridad Criptográfica de Credenciales</div>
      <p style="font-size: 7.7pt; color: #475569;">
        A diferencia de otros sistemas que guardan contraseñas en texto plano o usan hashes reversibles inseguros (Base64), el Sistema BES utiliza <strong>AES-256-CBC</strong>. La clave maestra reside en variables de entorno (<code>ENCRYPTION_KEY</code> de 32 bytes) y nunca se incluye en el repositorio ni en logs.
      </p>
    </div>
    <div class="card">
      <div class="card-title success">⚡ Concurrencia Unitario &amp; Stealth</div>
      <p style="font-size: 7.7pt; color: #475569;">
        El motor Puppeteer implementa técnicas anti-detección: cabeceras reales de Chrome, user-agents rotativos, desactivación de banderas <code>navigator.webdriver</code> y tiempos aleatorios de tipeo (30-80ms) para emular la interacción de un usuario humano.
      </p>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Arquitectura Tecnológica</div>
    <div>Página 4 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 5: CAPÍTULO 3 — CICLO DE PRODUCCIÓN (PASO A PASO)
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">3</div>
      <div>
        <div class="chapter-title">Ciclo de Producción y Fases de Desarrollo</div>
        <div class="chapter-sub">Evolución cronológica del proyecto, decisiones de diseño y maduración técnica</div>
      </div>
    </div>
    <span class="badge badge-purple">Ciclo de Vida</span>
  </div>

  <div class="step-box" style="border-left: 4px solid #64748b;">
    <div class="step-title"><span class="step-badge" style="background:#64748b;">FASE 1</span> Génesis, Prototipado y Superación de Obstáculos Estatales</div>
    <p style="font-size: 7.7pt; color: #475569;">
      El proyecto inició como un script en Node.js puro para automatizar el ingreso al portal Clave SOL de SUNAT. Los principales retos fueron los modales dinámicos publicitarios de SUNAT que impedían la interacción con el menú, la caducidad abrupta de cookies de sesión y los iframes anidados en <code>e-menu.sunat.gob.pe</code>. Se resolvió implementando selectores con reintentos y esperas explícitas de red.
    </p>
  </div>

  <div class="step-box" style="border-left: 4px solid #2563eb;">
    <div class="step-title"><span class="step-badge" style="background:#2563eb;">FASE 2</span> Refactorización Arquitectónica Core (NestJS + Next.js 14 + Prisma)</div>
    <p style="font-size: 7.7pt; color: #475569;">
      Para soportar concurrencia corporativa y eliminar código espagueti, se refactorizó el stack hacia <strong>NestJS 10</strong> con inyección de dependencias modular y <strong>Prisma ORM</strong> sobre PostgreSQL. En frontend se adoptó <strong>Next.js 14 (App Router)</strong> con TailwindCSS y Zustand para estado global reactivo sin sobrecargar el servidor.
    </p>
  </div>

  <div class="step-box" style="border-left: 4px solid #0891b2;">
    <div class="step-title"><span class="step-badge" style="background:#0891b2;">FASE 3</span> Orquestación Asíncrona con Colas BullMQ sobre Redis</div>
    <p style="font-size: 7.7pt; color: #475569;">
      Cuando el número de empresas superó las 30 razones sociales, la sincronización simultánea provocaba bloqueos de IP en SUNAT. Se introdujo <strong>BullMQ</strong> con concurrencia unitaria (1 empresa a la vez por worker), reintentos exponenciales automáticos y bloqueo de seguridad de 300 segundos, logrando estabilidad ininterrumpida.
    </p>
  </div>

  <div class="step-box" style="border-left: 4px solid #9333ea;">
    <div class="step-title"><span class="step-badge" style="background:#9333ea;">FASE 4</span> Integración de los 5 Submódulos de Casilla SUNAFIL</div>
    <p style="font-size: 7.7pt; color: #475569;">
      Ampliación del alcance a inspección laboral. Se desarrolló un procesador específico (<code>sunafil-scraper.processor.ts</code>) capaz de autenticarse con Clave SOL en SUNAFIL, navegar por sus 5 bandejas (Fiscalización, Cobranza Coactiva, Acciones Previas, Formalización y SST) y descargar comparecencias laborales.
    </p>
  </div>

  <div class="step-box" style="border-left: 4px solid #16a34a;">
    <div class="step-title"><span class="step-badge" style="background:#16a34a;">FASE 5</span> Hardening de Seguridad OWASP ASVS y Criptografía Limpia</div>
    <p style="font-size: 7.7pt; color: #475569;">
      Auditoría rigurosa de seguridad: retiro definitivo de fallback keys hardcodeadas, protección estricta con JwtAuthGuard en descarga de PDFs (<code>/uploads</code>), restricción de CORS a dominios productivos, cookies HTTP-only con <code>SameSite: strict</code> y sanitización estricta de nombres de archivo.
    </p>
  </div>

  <div class="step-box" style="border-left: 4px solid #059669;">
    <div class="step-title"><span class="step-badge" style="background:#059669;">FASE 6 (ACTUAL)</span> Centralización en Directorio Maestro y Desacoplamiento de Vistas</div>
    <p style="font-size: 7.7pt; color: #475569;">
      Consolidación de <code>/dashboard/empresas</code> como Directorio Maestro centralizado. Manejo unificado de credenciales SUNAT/SUNAFIL, toggles independientes de monitoreo (<code>/toggle-sunat</code>, <code>/toggle-sunafil</code>), borrado en cascada seguro y desacoplamiento de las vistas de SUNAT y SUNAFIL en consolas operativas puras.
    </p>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Ciclo de Producción</div>
    <div>Página 5 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 6: CAPÍTULO 4 — MODELADO DE LA BASE DE DATOS (DIAGRAMA ER)
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">4</div>
      <div>
        <div class="chapter-title">Diseño y Modelado de la Base de Datos (Diagrama ER)</div>
        <div class="chapter-sub">Esquema físico, entidades relacionales, claves foráneas y cardinalidades</div>
      </div>
    </div>
    <span class="badge badge-rose">Base de Datos</span>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 7.2pt; color: #475569; background: #f8fafc; padding: 4px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
    <div><strong>Leyenda:</strong> <span style="color:#d97706; font-weight:700;">🔑 Clave Primaria (PK)</span> &bull; <span style="color:#2563eb; font-weight:700;">🔗 Clave Foránea (FK)</span> &bull; <span style="color:#0f172a;">▪ Atributo</span></div>
    <div><strong>Notación Crow's Foot:</strong> <span style="color:#2563eb; font-weight:800;">━━━&lt;</span> Uno a Muchos (1 : N) &bull; <span style="color:#d97706; font-weight:800;">||━━||</span> Uno a Uno &bull; <span style="color:#16a34a; font-weight:700;">[N:M]</span> Tabla Intermedia</div>
  </div>

  <!-- CANVAS DEL DIAGRAMA ERD VECTORIAL (LUCIDCHART STYLE) -->
  <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    <svg viewBox="0 0 740 760" style="width: 100%; height: auto; font-family: 'JetBrains Mono', monospace;">
      <defs>
        <marker id="erd-crow" viewBox="0 0 14 14" refX="12" refY="7" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 1 2 L 12 7 L 1 12 M 12 1 L 12 13" fill="none" stroke="#2563eb" stroke-width="1.8" />
        </marker>
        <marker id="erd-one" viewBox="0 0 10 14" refX="5" refY="7" markerWidth="5" markerHeight="7" orient="auto-start-reverse">
          <path d="M 4 1 L 4 13 M 8 1 L 8 13" fill="none" stroke="#d97706" stroke-width="1.8" />
        </marker>
        <pattern id="grid-pattern" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.7" fill="#e2e8f0" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid-pattern)" />

      <!-- LÍNEAS DE CONEXIÓN ORTOGONALES (CROW'S FOOT) -->
      <path d="M 190 60 L 275 60" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 520 60 L 455 60" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 100 180 L 100 220" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 620 210 L 620 280 L 495 280" stroke="#2563eb" stroke-width="1.6" fill="none" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 190 120 L 225 120 L 225 360 L 260 360" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,2" fill="none" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 495 285 L 535 285" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 495 410 L 535 410" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 370 485 L 370 540" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 535 585 L 465 585" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 50 180 L 50 400" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />
      <path d="M 30 180 L 30 555" stroke="#2563eb" stroke-width="1.6" marker-start="url(#erd-one)" marker-end="url(#erd-crow)" />

      <!-- TABLAS CON CABECERA CORAL/SALMÓN ESTILO LUCIDCHART -->
      <!-- 1. USUARIO -->
      <g transform="translate(15, 15)">
        <rect width="175" height="165" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="175" height="24" rx="5" fill="#e06c75" />
        <text x="87" y="16" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">USUARIO</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" fill="#1d4ed8">▪ email : String (UK)</text>
          <text y="28" fill="#475569">▪ password : Bcrypt</text>
          <text y="42">▪ nombres : String</text>
          <text y="56">▪ apellidos : String</text>
          <text y="70" fill="#1d4ed8">▪ dni : String(8) (UK)</text>
          <text y="84">▪ rol : Role (Enum)</text>
          <text y="98">▪ modulosPermitidos</text>
          <text y="112" fill="#64748b">▪ telegramChatId</text>
          <text y="126" fill="#64748b">▪ createdAt : DateTime</text>
        </g>
      </g>

      <!-- 2. EMPRESA_ASIGNACION -->
      <g transform="translate(275, 15)">
        <rect width="180" height="95" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="180" height="24" rx="5" fill="#059669" />
        <text x="90" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EMPRESA_ASIGNACION [N:M]</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="28" font-weight="600" fill="#1d4ed8">🔗 empresaId : UUID (FK)</text>
          <text y="42" fill="#64748b">▪ creadoEn : DateTime</text>
        </g>
      </g>

      <!-- 3. EMPRESA -->
      <g transform="translate(520, 15)">
        <rect width="205" height="195" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="205" height="24" rx="5" fill="#e06c75" />
        <text x="102" y="16" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EMPRESA</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="700" fill="#1d4ed8">▪ ruc : String(11) (UK)</text>
          <text y="28">▪ razonSocial : String</text>
          <text y="42">▪ usuarioSol : String</text>
          <text y="56" fill="#b91c1c" font-weight="600">▪ claveSol : AES-256</text>
          <text y="70" fill="#15803d" font-weight="600">▪ habilitadoSunat : Bool</text>
          <text y="84" fill="#15803d" font-weight="600">▪ habilitadoSunafil : Bool</text>
          <text y="98">▪ terminosSunafil : String</text>
          <text y="112">▪ estadoConexion : Enum</text>
          <text y="126">▪ estadoSincro : String</text>
          <text y="140" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
        </g>
      </g>

      <!-- 4. AUDIT_LOG -->
      <g transform="translate(15, 220)">
        <rect width="175" height="140" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="175" height="24" rx="5" fill="#7c3aed" />
        <text x="87" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">AUDIT_LOG</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="28">▪ accion : String</text>
          <text y="42">▪ entidad : String</text>
          <text y="56" fill="#15803d" font-weight="600">▪ ipAddress : String</text>
          <text y="70" fill="#15803d" font-weight="600">▪ userAgent : String</text>
          <text y="84" fill="#64748b">▪ createdAt : DateTime</text>
        </g>
      </g>

      <!-- 5. NOTIFICACION (CENTRAL) -->
      <g transform="translate(260, 195)">
        <rect width="235" height="290" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.8" />
        <rect width="235" height="26" rx="6" fill="#1d4ed8" />
        <text x="117" y="17" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION (CENTRAL)</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 40)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="700" fill="#1d4ed8">🔗 empresaId : UUID (FK)</text>
          <text y="28" fill="#1d4ed8">▪ fileId : String (UK)</text>
          <text y="42">▪ fechaMensaje : DateTime</text>
          <text y="56" font-weight="600">▪ asunto : String</text>
          <text y="70" fill="#b91c1c" font-weight="700">▪ montoExigible : S/</text>
          <text y="84" fill="#b91c1c" font-weight="700">▪ expedienteCoactivo</text>
          <text y="98">▪ rutaArchivoPdf : String</text>
          <text y="112">▪ origen : SUNAT | SUNAFIL</text>
          <text y="126">▪ moduloSunafil : String</text>
          <text y="140">▪ estado : NO_LEIDO | LEIDO</text>
          <text y="154">▪ leidoGlobal : Boolean</text>
          <text y="168" fill="#64748b">▪ leidoPorNombre : String</text>
          <text y="182" font-weight="700" fill="#d97706">🔗 responsableId : (FK)</text>
          <text y="196">▪ estadoGestion : String</text>
          <text y="210" fill="#64748b">▪ fechaCompromiso : Date</text>
        </g>
      </g>

      <!-- 6. NOTIFICACION_LECTURA -->
      <g transform="translate(535, 240)">
        <rect width="190" height="95" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="190" height="24" rx="5" fill="#e06c75" />
        <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_LECTURA</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 notificacionId : (FK)</text>
          <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="42" fill="#64748b">▪ creadoAt : DateTime</text>
        </g>
      </g>

      <!-- 7. NOTIFICACION_COMENTARIO -->
      <g transform="translate(535, 360)">
        <rect width="190" height="125" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="190" height="24" rx="5" fill="#e06c75" />
        <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_COMENTARIO</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 notificacionId : (FK)</text>
          <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="42">▪ texto : String</text>
          <text y="56">▪ estadoNuevo : String</text>
          <text y="70" fill="#64748b">▪ createdAt : DateTime</text>
        </g>
      </g>

      <!-- 8. EVENTO_CALENDARIO -->
      <g transform="translate(15, 400)">
        <rect width="175" height="125" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="175" height="24" rx="5" fill="#0891b2" />
        <text x="87" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">EVENTO_CALENDARIO</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 empresaId : (FK opt)</text>
          <text y="28" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="42">▪ titulo : String</text>
          <text y="56">▪ fecha : DateTime</text>
          <text y="70">▪ tipo : String</text>
        </g>
      </g>

      <!-- 9. RECORDATORIO -->
      <g transform="translate(15, 555)">
        <rect width="175" height="125" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="175" height="24" rx="5" fill="#d97706" />
        <text x="87" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">RECORDATORIO</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" font-weight="600" fill="#1d4ed8">🔗 usuarioId : UUID (FK)</text>
          <text y="28" font-weight="600" fill="#1d4ed8">🔗 empresaId : (FK opt)</text>
          <text y="42">▪ titulo : String</text>
          <text y="56">▪ fechaRecordar : Date</text>
          <text y="70">▪ completado : Boolean</text>
        </g>
      </g>

      <!-- 10. NOTIFICACION_ETIQUETA -->
      <g transform="translate(265, 540)">
        <rect width="200" height="90" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="200" height="24" rx="5" fill="#059669" />
        <text x="100" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">NOTIFICACION_ETIQUETA [N:M]</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑🔗 notificacionId : (FK)</text>
          <text y="14" font-weight="700" fill="#b45309">🔑🔗 etiquetaId : (FK)</text>
          <text y="28" fill="#64748b">▪ asignadoEn : DateTime</text>
        </g>
      </g>

      <!-- 11. ETIQUETA -->
      <g transform="translate(535, 540)">
        <rect width="190" height="90" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="190" height="24" rx="5" fill="#e06c75" />
        <text x="95" y="16" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">ETIQUETA</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 38)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : UUID</text>
          <text y="14" fill="#1d4ed8">▪ nombre : String (UK)</text>
          <text y="28">▪ color : Hex (#f97316)</text>
        </g>
      </g>

      <!-- 12. CONFIGURACION_SCHEDULE -->
      <g transform="translate(265, 655)">
        <rect width="460" height="70" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect width="460" height="22" rx="5" fill="#334155" />
        <text x="230" y="15" fill="#ffffff" font-size="8" font-weight="700" text-anchor="middle" font-family="'Outfit', sans-serif">CONFIGURACION_SCHEDULE (SINGLETON CRON)</text>
        <g font-size="7.3" fill="#1e293b" transform="translate(8, 34)">
          <text y="0" font-weight="700" fill="#b45309">🔑 id : "default"</text>
          <text x="130" y="0">▪ cronExpression : String</text>
          <text y="16">▪ diasHabiles : Boolean</text>
          <text x="130" y="16">▪ activo : Boolean &bull; reintentos : 3</text>
        </g>
      </g>

    </svg>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Diagrama Entidad-Relación Físico (ERD)</div>
    <div>Página 6 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 7: CAPÍTULO 4 (CONT.) — MATRIZ RELACIONES & DICCIONARIO
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">4</div>
      <div>
        <div class="chapter-title">Matriz de Relaciones &amp; Diccionario de Datos</div>
        <div class="chapter-sub">Especificación de claves foráneas, reglas ON DELETE y especificación de campos</div>
      </div>
    </div>
    <span class="badge badge-rose">Relaciones &amp; Diccionario</span>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">4.3</span>Matriz de Relaciones Foreign Key y Reglas de Integridad</div>
    <table>
      <thead>
        <tr>
          <th style="width: 28%;">Tabla Origen &amp; FK</th>
          <th style="width: 15%;">Destino</th>
          <th style="width: 10%;">Card.</th>
          <th style="width: 15%;">ON DELETE</th>
          <th style="width: 32%;">Regla de Negocio / Comportamiento</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Empresa.usuarioId</code></td>
          <td><code>Usuario.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-dark">RESTRICT</span></td>
          <td>Usuario administrador creador de la empresa en el sistema.</td>
        </tr>
        <tr>
          <td><code>EmpresaAsignacion.empresaId</code></td>
          <td><code>Empresa.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Desvincula automáticamente permisos de contadores si la empresa se borra.</td>
        </tr>
        <tr>
          <td><code>Notificacion.empresaId</code></td>
          <td><code>Empresa.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-dark">RESTRICT</span></td>
          <td>Protección física en DB. <code>EmpresasService.remove()</code> borra en cascada controlada.</td>
        </tr>
        <tr>
          <td><code>Notificacion.responsableId</code></td>
          <td><code>Usuario.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-amber">SET NULL</span></td>
          <td>Si se desactiva un usuario, la notificación permanece sin responsable asignado.</td>
        </tr>
        <tr>
          <td><code>NotificacionLectura.notifId</code></td>
          <td><code>Notificacion.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Bitácora de quién abrió la resolución; se elimina junto con el documento.</td>
        </tr>
        <tr>
          <td><code>NotificacionComentario.notifId</code></td>
          <td><code>Notificacion.id</code></td>
          <td><span class="badge badge-blue">N : 1</span></td>
          <td><span class="badge badge-rose">CASCADE</span></td>
          <td>Notas internas y timeline de tickets de atención contable.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TABLA EMPRESA -->
  <div style="margin-bottom: 6px;">
    <div style="font-weight: 700; font-size: 8.2pt; color: #1e3a8a; margin-bottom: 2px;">🏢 Tabla: Empresa (Maestro de Razones Sociales y Credenciales)</div>
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
          <td><code>UUID / String(11)</code></td>
          <td><span class="badge badge-dark">PK</span> / <span class="badge badge-blue">UNIQUE</span></td>
          <td>Identificador único y RUC fiscal peruano validado mediante algoritmo módulo 11.</td>
        </tr>
        <tr>
          <td><code>usuarioSol</code> / <code>claveSol</code></td>
          <td><code>String</code></td>
          <td>Obligatorio</td>
          <td>Usuario SOL y <strong>Clave SOL cifrada con AES-256-CBC</strong> (formato <code>iv:hash</code>).</td>
        </tr>
        <tr>
          <td><code>habilitadoSunat</code></td>
          <td><code>Boolean</code></td>
          <td>Default: <code>true</code></td>
          <td>Habilita/pausa la sincronización con Buzón SOL (Toggle vía <code>/toggle-sunat</code>).</td>
        </tr>
        <tr>
          <td><code>habilitadoSunafil</code></td>
          <td><code>Boolean</code></td>
          <td>Default: <code>false</code></td>
          <td>Habilita/pausa la sincronización con Casilla SUNAFIL (Toggle vía <code>/toggle-sunafil</code>).</td>
        </tr>
        <tr>
          <td><code>estadoConexion</code></td>
          <td><code>Enum</code></td>
          <td>Default: <code>CONECTADO</code></td>
          <td>Salud de credenciales: <code>CONECTADO</code>, <code>REQUIERE_ACTUALIZACION</code>, <code>ERROR_SISTEMA</code>.</td>
        </tr>
        <tr>
          <td><code>estadoSincro</code></td>
          <td><code>String</code></td>
          <td>Default: <code>'IDLE'</code></td>
          <td>Estado del worker en cola: <code>IDLE</code>, <code>SYNCING</code>, <code>ERROR</code>, <code>OK</code>.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TABLA NOTIFICACION -->
  <div style="margin-bottom: 6px;">
    <div style="font-weight: 700; font-size: 8.2pt; color: #1e3a8a; margin-bottom: 2px;">📩 Tabla: Notificacion (Buzón, Parsing y Workflow de Gestión)</div>
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
          <td><code>UUID / String?</code></td>
          <td><span class="badge badge-dark">PK</span> / <span class="badge badge-blue">UNIQUE</span></td>
          <td>ID interno y código de archivo emitido por SUNAT/SUNAFIL para evitar duplicados.</td>
        </tr>
        <tr>
          <td><code>montoExigible</code></td>
          <td><code>String?</code></td>
          <td>Opcional</td>
          <td><strong>Monto en Soles (S/)</strong> extraído automáticamente mediante expresiones regulares.</td>
        </tr>
        <tr>
          <td><code>expedienteCoactivo</code></td>
          <td><code>String?</code></td>
          <td>Opcional</td>
          <td><strong>Nro. de expediente coactivo</strong> detectado por el analizador sintáctico.</td>
        </tr>
        <tr>
          <td><code>origen</code> / <code>moduloSunafil</code></td>
          <td><code>String</code></td>
          <td>Default: <code>'SUNAT'</code></td>
          <td>Entidad emisora (<code>SUNAT</code> / <code>SUNAFIL</code>) y submódulo laboral específico.</td>
        </tr>
        <tr>
          <td><code>leidoGlobal</code> / <code>leidoEn</code></td>
          <td><code>Boolean / DateTime?</code></td>
          <td>Default: <code>false</code></td>
          <td>Marca de lectura global cuando cualquier contador del equipo abre la resolución.</td>
        </tr>
        <tr>
          <td><code>estadoGestion</code></td>
          <td><code>String?</code></td>
          <td>Opcional</td>
          <td>Estados del ticket: <code>EN_REVISION</code>, <code>REQUIERE_ACCION</code>, <code>RESPONDIDO</code>, <code>ARCHIVADO</code>.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Diccionario de Datos</div>
    <div>Página 7 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 8: CAPÍTULO 5 — CATÁLOGO DE VISTAS (FRONTEND UX/UI)
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">5</div>
      <div>
        <div class="chapter-title">Catálogo de Vistas y Experiencia de Usuario (Frontend)</div>
        <div class="chapter-sub">Especificación de pantallas, dashboards reactivos, modales y extensión web</div>
      </div>
    </div>
    <span class="badge badge-amber">Interfaces de Usuario</span>
  </div>

  <div class="grid-2">
    <div class="step-box" style="border-left: 4px solid #2563eb;">
      <div class="step-title"><span class="step-badge" style="background:#2563eb;">VISTA 1</span> Morning Brief Matutino</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Pantalla de bienvenida ejecutiva. Tarjetas KPI con notificaciones de las últimas 24h, deudas acumuladas detectadas, órdenes de cobranza coactiva y requerimientos con plazos perentorios.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #059669;">
      <div class="step-title"><span class="step-badge" style="background:#059669;">VISTA 2</span> Directorio Maestro Centralizado (<code>/empresas</code>)</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Consola central para altas, bajas y edición de RUCs, credenciales SOL y credenciales de casilla SUNAFIL. Toggles interactivos independientes de monitoreo, importación Excel y borrado seguro.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #16a34a;">
      <div class="step-title"><span class="step-badge" style="background:#16a34a;">VISTA 3</span> Consola Operativa SUNAT (<code>/sunat/empresas</code>)</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Panel puramente operativo de supervisión de buzón SOL: disparadores de sincronización masiva ("Sincronizar Todo"), filtros de empresas activas y modal Quick Login.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #9333ea;">
      <div class="step-title"><span class="step-badge" style="background:#9333ea;">VISTA 4</span> Consola Operativa SUNAFIL (<code>/sunafil/empresas</code>)</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Supervisión de casilla laboral en sus 5 submódulos (Fiscalización, Coactiva, Previas, Formalización, SST), estado de conexión y sincronización directa con casilla electrónica.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #0891b2;">
      <div class="step-title"><span class="step-badge" style="background:#0891b2;">VISTA 5</span> Bandeja Unificada &amp; Visor PDF Integrado</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Bandeja multi-RUC con filtros reactivos por empresa, rango de fechas y texto libre. Visor modal completo de resoluciones PDF sin necesidad de descargar el archivo a la máquina local.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #d97706;">
      <div class="step-title"><span class="step-badge" style="background:#d97706;">VISTA 6</span> Gestión de Tickets &amp; Asignaciones</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Flujo colaborativo para delegar requerimientos tributarios o laborales a asistentes contables, establecer fecha compromiso y registrar notas internas compartidas.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #be123c;">
      <div class="step-title"><span class="step-badge" style="background:#be123c;">VISTA 7</span> Calendario Tributario y Vencimientos</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Proyección mensual interactiva de plazos de vencimiento de requerimientos de fiscalización y comparecencias laborales, mitigando omisiones por factor humano.
      </p>
    </div>

    <div class="step-box" style="border-left: 4px solid #4f46e5;">
      <div class="step-title"><span class="step-badge" style="background:#4f46e5;">VISTA 8</span> Programador Cron &amp; Extensión Web</div>
      <p style="font-size: 7.5pt; color: #475569;">
        Configurador visual de expresiones cron para SUNAFIL y plugin Chrome Manifest V3 para auto-completado de credenciales SOL con soporte para ventanas de incógnito aisladas.
      </p>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Catálogo de Vistas UX/UI</div>
    <div>Página 8 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 9: CAPÍTULO 6 & 7 — PIPELINE DE SCRAPING, SEGURIDAD Y OPERACIONES
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">6</div>
      <div>
        <div class="chapter-title">Pipeline de Scraping, Seguridad y Guía Operativa</div>
        <div class="chapter-sub">Arquitectura del worker, hardening de seguridad OWASP y scripts de migración</div>
      </div>
    </div>
    <span class="badge badge-green">Scraping &amp; Seguridad</span>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">6.1</span>Ciclo de Vida del Job de Scraping Robotizado</div>
    <div class="code-block"><span class="comment">// Flujo secuencial ejecutado por el worker Puppeteer:</span>
[1. Disparador Cron / Botón Sincronizar]
       &darr;
[2. Encolamiento en BullMQ sobre Redis (Concurrency: 1, Lock: 300s)]
       &darr;
[3. Worker inicia Chromium Headless Stealth &bull; Desencripta AES-256 Clave SOL]
       &darr;
[4. Login oficial SUNAT / SUNAFIL &bull; Cierre automático de modales publicitarios]
       &darr;
[5. Extracción de metadatos &bull; Detección de nuevos mensajes (fileId)]
       &darr;
[6. Descarga de stream PDF binario &bull; Guardado en /uploads/[hash].pdf]
       &darr;
[7. Analítica Regex: Detección de Deuda (S/) y Nro. Expediente Coactivo]
       &darr;
[8. Persistencia PostgreSQL vía Prisma &bull; Emisión Socket.IO / Telegram Bot]</div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title success">🛡️ Hardening de Seguridad OWASP ASVS</div>
      <ul>
        <li><strong>Sin Fallback Keys:</strong> Eliminación absoluta de llaves criptográficas fijas en código.</li>
        <li><strong>Protección de Descarga PDF:</strong> Ruta <code>/uploads</code> blindada con JwtAuthGuard para evitar fuga de documentos confidenciales.</li>
        <li><strong>CORS Restringido:</strong> Solo orígenes autorizados pueden consumir la API.</li>
        <li><strong>Auditoría Estricta:</strong> Captura de IP, User-Agent y usuario en cada acción crítica (<code>ELIMINAR_EMPRESA</code>, <code>TOGGLE_MONITOREO</code>).</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title primary">⚙️ Scripts de Migración de Cifrado (NPM)</div>
      <ul>
        <li><code>npm run check:encryption</code>: Audita si existen empresas con claves legadas o llaves fallback.</li>
        <li><code>npm run migrate:encryption:dry</code>: Simula la migración de credenciales sin modificar la base de datos.</li>
        <li><code>npm run migrate:encryption</code>: Re-cifra todas las contraseñas bajo la clave AES-256 activa con respaldo JSON automático.</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">7.3</span>Guía Rápida de Comandos para Operaciones Diarias</div>
    <div class="code-block"><span class="comment"># Levantar infraestructura completa en contenedores (Docker)</span>
<span class="cmd">docker compose up -d --build</span>

<span class="comment"># Inspeccionar logs de scraping en vivo (Puppeteer / Chromium)</span>
<span class="cmd">docker compose logs -f</span> backend

<span class="comment"># Diagnosticar estado de cifrado de credenciales de empresas</span>
<span class="cmd">npm run check:encryption</span>

<span class="comment"># Compilar y regenerar este documento técnico en PDF oficial</span>
<span class="cmd">node</span> generate_documentation_pdf.js</div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Scraping &amp; Seguridad</div>
    <div>Página 9 &bull; Memoria Técnica de Ingeniería</div>
  </div>

  <div class="page-break"></div>

  <!-- =========================================================================
       PÁGINA 10: CAPÍTULO 8 — CONCLUSIONES, CHANGELOG & HOJA DE RUTA
  ========================================================================== -->
  <div class="chapter-header">
    <div class="chapter-title-group">
      <div class="chapter-num-badge">8</div>
      <div>
        <div class="chapter-title">Conclusiones, Changelog Histórico y Hoja de Ruta</div>
        <div class="chapter-sub">Hitos alcanzados, registro histórico de versiones y desarrollos futuros</div>
      </div>
    </div>
    <span class="badge badge-dark">Conclusiones</span>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">8.1</span>Logros Técnicos y Operativos Alcanzados</div>
    <p style="font-size: 8.2pt; color: #334155; margin-bottom: 6px;">
      El Sistema BES ha consolidado una infraestructura robusta y madura para la gestión automatizada de riesgos fiscales y laborales. La transición hacia un <strong>Directorio Maestro Centralizado</strong> con toggles autónomos de monitoreo, unificación de credenciales SUNAT/SUNAFIL, borrado seguro en cascada y blindaje criptográfico AES-256 posiciona a la plataforma como una solución de clase empresarial lista para operar sobre más de 150 razones sociales con cero fallas de integridad.
    </p>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">8.2</span>Registro Histórico de Cambios (Changelog Vivo)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Fecha</th>
          <th style="width: 14%;">Versión</th>
          <th style="width: 26%;">Componente</th>
          <th style="width: 46%;">Descripción de Mejoras y Cambios Implementados</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>14/09/2026</strong></td>
          <td><span class="badge badge-green">v2.5.0</span></td>
          <td>Directorio Maestro / Multi-Entidad</td>
          <td>Centralización en <code>/dashboard/empresas</code> con credenciales mixtas SUNAT/SUNAFIL. Toggles independientes (<code>/toggle-sunat</code>, <code>/toggle-sunafil</code>), borrado en cascada en servicio y consolas satélite desacopladas.</td>
        </tr>
        <tr>
          <td><strong>09/09/2026</strong></td>
          <td><span class="badge badge-blue">v2.1.0</span></td>
          <td>Automatización SUNAFIL / RBAC</td>
          <td>Configurador visual cron para SUNAFIL en <code>/dashboard/configuracion</code> con <code>cron.service.ts</code>. Control de roles RBAC en tiempo real y migraciones de esquema DB.</td>
        </tr>
        <tr>
          <td><strong>02/09/2026</strong></td>
          <td><span class="badge badge-blue">v2.4.0</span></td>
          <td>Seguridad / Hardening OWASP</td>
          <td>Eliminación de fallback key hardcodeada. Blindaje de <code>/uploads</code> con JwtGuard. Cabeceras HTTP Nginx y captura de IP/UserAgent en logs de auditoría.</td>
        </tr>
        <tr>
          <td><strong>28/08/2026</strong></td>
          <td><span class="badge badge-blue">v2.3.5</span></td>
          <td>Extensión Web / Scraper</td>
          <td>Lanzamiento de extensión Chrome Manifest V3 para auto-completado Clave SOL con soporte para modo incógnito multi-empresa aislado.</td>
        </tr>
        <tr>
          <td><strong>20/08/2026</strong></td>
          <td><span class="badge badge-blue">v2.3.0</span></td>
          <td>Casilla SUNAFIL</td>
          <td>Integración de 5 submódulos de Casilla SUNAFIL con dashboard de métricas independiente y descarga automática de comparecencias.</td>
        </tr>
        <tr>
          <td><strong>01/08/2026</strong></td>
          <td><span class="badge badge-dark">v2.0.0</span></td>
          <td>Arquitectura Core</td>
          <td>Refactorización a NestJS + Next.js 14 con colas BullMQ sobre Redis y motor Puppeteer con persistencia PostgreSQL vía Prisma ORM.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title"><span class="number">8.3</span>Hoja de Ruta y Próximos Desarrollos</div>
    <div class="grid-3">
      <div class="card">
        <div class="card-title primary">🤖 OCR con IA Multimodal</div>
        <p style="font-size: 7.5pt; color: #475569;">
          Integración de modelos OCR basados en visión artificial para extraer montos de resoluciones escaneadas antiguas o documentos PDF sin capa de texto.
        </p>
      </div>
      <div class="card">
        <div class="card-title success">💬 WhatsApp Business API</div>
        <p style="font-size: 7.5pt; color: #475569;">
          Envío automático de resúmenes ejecutivos vía plantilla oficial de WhatsApp al teléfono del representante legal ante embargos o resoluciones coactivas.
        </p>
      </div>
      <div class="card">
        <div class="card-title purple">🏛️ Nuevas Entidades (SAT / MINTRA)</div>
        <p style="font-size: 7.5pt; color: #475569;">
          Módulos de scraping para la casilla electrónica del Ministerio de Trabajo y el Sistema de Administración Tributaria (SAT Lima) para multas vehiculares y prediales.
        </p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Sistema BES — Buzón Electrónico SUNAT &bull; Conclusiones &amp; Hoja de Ruta</div>
    <div>Página 10 &bull; Memoria Técnica de Ingeniería &bull; Confidencial</div>
  </div>

</body>
</html>
`;

async function generateDocumentationPDF() {
  console.log('Iniciando compilador del Informe Técnico Maestro BES (v2.5.0)...');
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
      top: '8mm',
      bottom: '8mm',
      left: '9mm',
      right: '9mm'
    }
  });

  await browser.close();
  console.log('✅ Informe Técnico Maestro generado exitosamente en:', pdfPath);
}

generateDocumentationPDF().catch(err => {
  console.error('❌ Error al generar Informe Técnico:', err);
  process.exit(1);
});
