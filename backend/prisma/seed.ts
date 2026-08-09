import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const oldAdminEmail = 'admin@bes.com';
  const adminEmail = 'admin@oracon.com';
  const adminPassword = 'admin_password_2026';

  // Si existe el antiguo admin@bes.com, actualizar su correo a admin@oracon.com para conservar su cuenta
  const oldAdmin = await prisma.usuario.findUnique({ where: { email: oldAdminEmail } });
  if (oldAdmin) {
    await prisma.usuario.update({
      where: { id: oldAdmin.id },
      data: { email: adminEmail, apellidos: 'ORACON' },
    });
    console.log('🔄 Usuario admin@bes.com migrado exitosamente a admin@oracon.com');
  }

  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombres: 'Super Admin',
        apellidos: 'ORACON',
        dni: '00000000',
        password: hashedPassword,
        rol: Role.SUPER_ADMIN,
      },
    });
    console.log('✅ Super Admin creado con éxito');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } else {
    console.log('⚠️ El Super Admin (admin@oracon.com) ya existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
