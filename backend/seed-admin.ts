import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  // 1. admin@oracon.com
  await prisma.usuario.upsert({
    where: { email: 'admin@oracon.com' },
    update: {
      rol: 'SUPER_ADMIN',
      password,
    },
    create: {
      email: 'admin@oracon.com',
      password,
      nombres: 'Super Admin',
      apellidos: 'ORACON',
      dni: '00000000',
      rol: 'SUPER_ADMIN',
    },
  });

  // 2. admin@bes.com
  await prisma.usuario.upsert({
    where: { email: 'admin@bes.com' },
    update: {
      rol: 'SUPER_ADMIN',
      password,
    },
    create: {
      email: 'admin@bes.com',
      password,
      nombres: 'Super',
      apellidos: 'Administrador',
      dni: '00000000',
      rol: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin configurado con éxito:');
  console.log(`📧 Correo: admin@oracon.com`);
  console.log(`🔑 Contraseña: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
