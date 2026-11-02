/**
 * SCRIPT DE MIGRACIÓN DE CIFRADO — claveSol
 * ==========================================
 * Re-cifra todos los registros de Empresa que estén cifrados con la fallback key
 * hacia la ENCRYPTION_KEY actual del entorno.
 *
 * USO:
 *   # 1. Ver qué se migraría SIN cambiar nada (recomendado primero):
 *   npx ts-node migrate-encryption.ts --dry-run
 *
 *   # 2. Ejecutar la migración real:
 *   npx ts-node migrate-encryption.ts
 *
 *   # 3. Apuntar a producción (pasar DATABASE_URL como variable de entorno):
 *   DATABASE_URL="postgresql://user:pass@host:5432/bes_db" npx ts-node migrate-encryption.ts --dry-run
 *   DATABASE_URL="postgresql://user:pass@host:5432/bes_db" npx ts-node migrate-encryption.ts
 */

import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────
const CURRENT_KEY = process.env.ENCRYPTION_KEY || '';
const FALLBACK_KEY = process.env.ENCRYPTION_KEY_LEGACY || '';
const DRY_RUN = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────
// Helpers de cifrado
// ─────────────────────────────────────────────
function tryDecrypt(hash: string, key: string): string | null {
  if (!key) return null;
  try {
    const [ivHex, encryptedHex] = hash.split(':');
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  // Validaciones de seguridad antes de correr
  if (!CURRENT_KEY || CURRENT_KEY.length !== 32) {
    console.error('\n❌ ERROR: ENCRYPTION_KEY no está definida o no tiene 32 caracteres.');
    console.error('   Asegúrate de tener el .env cargado o de pasar DATABASE_URL y ENCRYPTION_KEY como variables de entorno.\n');
    process.exit(1);
  }

  if (!FALLBACK_KEY || FALLBACK_KEY.length !== 32) {
    console.error('\n❌ ERROR: ENCRYPTION_KEY_LEGACY debe estar definida en el entorno con exactamente 32 caracteres.');
    console.error('   Define la clave anterior en .env como ENCRYPTION_KEY_LEGACY="<clave_anterior>" para migrar los registros.\n');
    process.exit(1);
  }

  if (CURRENT_KEY === FALLBACK_KEY) {
    console.error('\n❌ ERROR: La ENCRYPTION_KEY actual ES IGUAL al fallback key.');
    console.error('   Esto no es seguro. Genera una nueva clave antes de migrar.\n');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  console.log('\n' + '═'.repeat(60));
  console.log('  MIGRACIÓN DE CIFRADO — claveSol');
  console.log('═'.repeat(60));
  console.log(`  Modo           : ${DRY_RUN ? '🔍 DRY-RUN (solo lectura, sin cambios)' : '🚀 REAL (aplicará cambios en la DB)'}`);
  console.log(`  DATABASE_URL   : ${(process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':***@')}`);
  console.log(`  ENCRYPTION_KEY : ${CURRENT_KEY.substring(0, 8)}...`);
  console.log(`  FALLBACK_KEY   : ${FALLBACK_KEY.substring(0, 8)}...`);
  console.log('═'.repeat(60) + '\n');

  if (!DRY_RUN) {
    console.log('⚠️  ATENCIÓN: Esto modificará datos en la base de datos.');
    console.log('   Asegúrate de tener un backup antes de continuar.\n');
    // Pausa de 3 segundos para que el usuario pueda cancelar con Ctrl+C
    console.log('   Iniciando en 3 segundos... (Ctrl+C para cancelar)\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const empresas = await prisma.empresa.findMany({
    select: { id: true, ruc: true, razonSocial: true, claveSol: true },
  });

  console.log(`📋 Total de empresas encontradas: ${empresas.length}\n`);

  let migradas = 0;
  let yaCifradasCorrectamente = 0;
  let sinDescifrar = 0;
  let errores = 0;
  const fallbackList: string[] = [];

  for (const empresa of empresas) {
    const withCurrent = tryDecrypt(empresa.claveSol, CURRENT_KEY);

    if (withCurrent !== null) {
      // Ya está cifrada con la clave actual — no necesita migración
      yaCifradasCorrectamente++;
      console.log(`  ✅ OK          RUC: ${empresa.ruc.padEnd(12)} — ${empresa.razonSocial}`);
      continue;
    }

    const withFallback = tryDecrypt(empresa.claveSol, FALLBACK_KEY);

    if (withFallback !== null) {
      // Cifrada con fallback — necesita migración
      fallbackList.push(empresa.ruc);

      if (DRY_RUN) {
        console.log(`  ⚠️  MIGRAR      RUC: ${empresa.ruc.padEnd(12)} — ${empresa.razonSocial}`);
        migradas++;
      } else {
        // Re-cifrar con la clave actual
        try {
          const newHash = encrypt(withFallback, CURRENT_KEY);
          await prisma.empresa.update({
            where: { id: empresa.id },
            data: { claveSol: newHash },
          });
          console.log(`  🔄 MIGRADA     RUC: ${empresa.ruc.padEnd(12)} — ${empresa.razonSocial}`);
          migradas++;
        } catch (err) {
          console.error(`  ❌ ERROR       RUC: ${empresa.ruc.padEnd(12)} — ${empresa.razonSocial}: ${(err as Error).message}`);
          errores++;
        }
      }
    } else {
      // No se puede descifrar con ninguna clave
      sinDescifrar++;
      console.log(`  ❓ SIN CLAVE   RUC: ${empresa.ruc.padEnd(12)} — ${empresa.razonSocial} (no descifrable con ninguna clave conocida)`);
    }
  }

  // ─── Resumen final ───────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('  RESUMEN');
  console.log('═'.repeat(60));
  console.log(`  Total empresas                   : ${empresas.length}`);
  console.log(`  Ya cifradas con clave actual      : ${yaCifradasCorrectamente} ✅`);
  console.log(`  ${DRY_RUN ? 'Que se migrarían' : 'Migradas exitosamente'}         : ${migradas} ${DRY_RUN ? '⚠️  (pendientes)' : '🔄 ✅'}`);
  console.log(`  No descifrable (requiere revisión): ${sinDescifrar} ${sinDescifrar > 0 ? '❓' : '✅'}`);
  if (!DRY_RUN) {
    console.log(`  Errores durante migración         : ${errores} ${errores > 0 ? '❌' : '✅'}`);
  }
  console.log('═'.repeat(60));

  if (DRY_RUN && migradas > 0) {
    console.log('\n👆 Ejecuta sin --dry-run para aplicar la migración.');
    console.log('   Recuerda hacer backup de la DB antes:\n');
    console.log('   docker exec oracon_postgres pg_dump -U postgres bes_db > backup_pre_migracion.sql\n');
  }

  if (!DRY_RUN && migradas > 0 && errores === 0) {
    console.log('\n✅ Migración completada exitosamente.');
    console.log('   Ahora puedes eliminar el fallback key del código fuente con seguridad.\n');
  }

  if (!DRY_RUN && errores > 0) {
    console.log('\n⚠️  Hubo errores. Revisa los registros marcados con ❌ manualmente.');
    console.log('   El sistema sigue funcionando — el fallback key aún está en el código.\n');
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
