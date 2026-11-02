import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const CURRENT_KEY = process.env.ENCRYPTION_KEY || '';
const FALLBACK_KEY = process.env.ENCRYPTION_KEY_LEGACY || '';

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

async function main() {
  const prisma = new PrismaClient();

  console.log('\n🔍 Diagnóstico de cifrado — campo claveSol en Empresa\n');
  console.log(`  ENCRYPTION_KEY actual : ${CURRENT_KEY ? `${CURRENT_KEY.substring(0, 8)}...` : '(no configurada)'}`);
  console.log(`  FALLBACK_KEY (legada) : ${FALLBACK_KEY ? `${FALLBACK_KEY.substring(0, 8)}...` : '(no configurada en .env)'}\n`);

  const empresas = await prisma.empresa.findMany({
    select: { id: true, ruc: true, razonSocial: true, claveSol: true },
  });

  if (empresas.length === 0) {
    console.log('⚠️  No hay empresas en la base de datos.\n');
    await prisma.$disconnect();
    return;
  }

  let totalCurrentKey = 0;
  let totalFallback = 0;
  let totalUnknown = 0;

  for (const empresa of empresas) {
    const withCurrent = tryDecrypt(empresa.claveSol, CURRENT_KEY);
    const withFallback = tryDecrypt(empresa.claveSol, FALLBACK_KEY);

    if (withCurrent !== null) {
      totalCurrentKey++;
      console.log(`  ✅ [CLAVE ACTUAL]   RUC: ${empresa.ruc} — ${empresa.razonSocial}`);
    } else if (withFallback !== null) {
      totalFallback++;
      console.log(`  ⚠️  [FALLBACK KEY]  RUC: ${empresa.ruc} — ${empresa.razonSocial}  ← NECESITA MIGRACIÓN`);
    } else {
      totalUnknown++;
      console.log(`  ❌ [DESCONOCIDO]   RUC: ${empresa.ruc} — ${empresa.razonSocial}  ← No se puede descifrar con ninguna clave`);
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`  Total empresas           : ${empresas.length}`);
  console.log(`  Cifradas con clave actual: ${totalCurrentKey}`);
  console.log(`  Cifradas con fallback    : ${totalFallback}  ${totalFallback > 0 ? '⚠️  ← REQUIEREN MIGRACIÓN' : '✅'}`);
  console.log(`  No descifrable           : ${totalUnknown}`);

  if (totalFallback > 0) {
    console.log('\n🔧 Acción recomendada: Re-cifrar estos registros con la ENCRYPTION_KEY actual.');
  } else {
    console.log('\n✅ Ningún registro usa el fallback key. Es seguro eliminar el fallback del código.\n');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
