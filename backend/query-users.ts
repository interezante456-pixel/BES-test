import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany();

  console.log('--- USUARIOS EN BASE DE DATOS ---');
  for (const u of usuarios) {
    console.log(`\n👤 Usuario: ${u.email} (${u.rol})`);
    console.log(`   - ¿Coincide 'admin_password_2026'?:`, await bcrypt.compare('admin_password_2026', u.password));
    console.log(`   - ¿Coincide 'admin123'?:`, await bcrypt.compare('admin123', u.password));
    console.log(`   - ¿Coincide '123456'?:`, await bcrypt.compare('123456', u.password));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
