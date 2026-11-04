import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initMail();
  }

  private initMail() {
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number.parseInt(port, 10),
        secure: port === '465', // true para puerto 465 (SSL), false para otros como 587 (STARTTLS)
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP de producción configurado: ${host} (${user})`);
    } else {
      this.logger.log(
        'SMTP de producción no configurado. Inicializando cuenta de prueba Ethereal...',
      );
      this.initEthereal();
    }
  }

  private initEthereal() {
    // Cuenta de prueba Ethereal generada automáticamente para desarrollo
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        this.logger.error('Error creando cuenta Ethereal: ' + err.message);
        return;
      }
      this.transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.logger.log(`Ethereal Email configurado: ${account.user}`);
    });
  }

  async sendUrgentAlert(to: string, empresaNombre: string, asunto: string) {
    if (!this.transporter) {
      this.logger.warn('Transporter no inicializado aún');
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    const info = await this.transporter.sendMail({
      from: '"ORACON Alertas" <alertas@oracon.com>',
      to,
      subject: `⚠️ URGENTE: Nueva Notificación SUNAT - ${empresaNombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #FF5500; border-radius: 12px; background-color: #0B0F17; color: #FFFFFF;">
          <h2 style="color: #FF5500; margin-top: 0;">ORACON — Alerta Urgente SUNAT</h2>
          <p>Estimado usuario, el robot de <strong>ORACON (Estudio Contable)</strong> ha detectado una notificación de alta prioridad para la empresa <strong>${empresaNombre}</strong>.</p>
          <p><strong>Asunto del documento:</strong> ${asunto}</p>
          <p style="color: #E5E7EB;">Por favor, inicie sesión en su panel de ORACON para revisar el documento PDF inmediatamente y evitar multas o embargos.</p>
          <br/>
          <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FF5500, #E64A00); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver en ORACON Panel</a>
        </div>
      `,
    });

    this.logger.log(
      `Mensaje urgente enviado a ${to}. URL Ethereal: ${nodemailer.getTestMessageUrl(info)}`,
    );
  }

  async sendPdfFailureSummary(
    to: string,
    empresaNombre: string,
    fallos: { asunto: string; fecha: string }[],
  ) {
    if (!this.transporter) {
      this.logger.warn('Transporter no inicializado aún');
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    const listaHtml = fallos
      .map(
        (f, i) => `
      <tr style="background:${i % 2 === 0 ? '#1f2937' : '#111827'}; color: #fff;">
        <td style="padding:8px 12px; border-bottom:1px solid #374151;">${f.fecha}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #374151;">${f.asunto}</td>
      </tr>
    `,
      )
      .join('');

    const info = await this.transporter.sendMail({
      from: '"ORACON Alertas" <alertas@oracon.com>',
      to,
      subject: `📋 Resumen: ${fallos.length} documento(s) sin PDF - ${empresaNombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #FF5500; border-radius: 12px; max-width: 700px; background-color: #0B0F17; color: #FFFFFF;">
          <h2 style="color: #FF5500; margin-top: 0;">ORACON — Documentos sin PDF disponible</h2>
          <p>Durante la sincronización de <strong>${empresaNombre}</strong>, los siguientes documentos fueron registrados pero <strong>no se pudo descargar su archivo PDF</strong> desde los servidores de SUNAT.</p>
          <p style="color: #9CA3AF;">Esto puede deberse a documentos expirados, permisos insuficientes o indisponibilidad temporal del servidor.</p>
          <br/>
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr style="background:#FF5500; color:white;">
                <th style="padding:10px 12px; text-align:left;">Fecha</th>
                <th style="padding:10px 12px; text-align:left;">Asunto</th>
              </tr>
            </thead>
            <tbody>${listaHtml}</tbody>
          </table>
          <br/>
          <p style="color:#9CA3AF; font-size:13px;">Los títulos de estos documentos <strong>sí fueron guardados</strong> en el panel con estado "SIN PDF". Puede revisarlos iniciando sesión.</p>
          <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FF5500, #E64A00); color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; margin-top:10px;">Ver en ORACON Panel</a>
        </div>
      `,
    });

    this.logger.log(
      `Resumen de PDFs fallidos enviado a ${to}. URL Ethereal: ${nodemailer.getTestMessageUrl(info)}`,
    );
  }
}
