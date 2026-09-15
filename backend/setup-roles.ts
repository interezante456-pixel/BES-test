import { PrismaClient, Role, ModuloAcceso } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'sadmin@oracon.com';
  const superAdminPassword = 'passwordoracon2026@';

  console.log('\n=============================================================');
  console.log('       CONFIGURACIÓN DE ROLES: SUPER_ADMIN Y ADMIN');
  console.log('=============================================================\n');

  // 1. Degradar cuentas SUPER_ADMIN previas al rol ADMIN (excepto la nueva sadmin)
  const previousSuperAdmins = await prisma.usuario.findMany({
    where: {
      rol: Role.SUPER_ADMIN,
      email: { not: superAdminEmail },
    },
  });

  if (previousSuperAdmins.length > 0) {
    for (const u of previousSuperAdmins) {
      await prisma.usuario.update({
        where: { id: u.id },
        data: { rol: Role.ADMIN },
      });
      console.log(`  🔄 Rol de cuenta dueña degradado a ADMIN: ${u.email} (${u.nombres} ${u.apellidos})`);
    }
  } else {
    // Si no había ningún SUPER_ADMIN que no fuera sadmin, revisar admin@oracon.com o admin@bes.com
    const defaultAdmins = await prisma.usuario.findMany({
      where: {
        email: { in: ['admin@oracon.com', 'admin@bes.com'] },
        rol: { not: Role.ADMIN },
      },
    });
    for (const u of defaultAdmins) {
      await prisma.usuario.update({
        where: { id: u.id },
        data: { rol: Role.ADMIN },
      });
      console.log(`  🔄 Cuenta configurada a ADMIN: ${u.email}`);
    }
  }

  // 2. Crear o actualizar la cuenta SUPER_ADMIN para soporte/desarrollo
  const existingSuperAdmin = await prisma.usuario.findUnique({
    where: { email: superAdminEmail },
  });

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
  const allModules: ModuloAcceso[] = [
    ModuloAcceso.SUNAT,
    ModuloAcceso.SUNAFIL,
    ModuloAcceso.AUDITORIA,
    ModuloAcceso.GESTION_USUARIOS,
    ModuloAcceso.GESTION_EMPRESAS,
  ];

  if (!existingSuperAdmin) {
    // Verificar si el DNI 99999999 ya existe
    let dniToUse = '99999999';
    const existingDni = await prisma.usuario.findUnique({ where: { dni: dniToUse } });
    if (existingDni) {
      dniToUse = '99999998';
    }

    const created = await prisma.usuario.create({
      data: {
        email: superAdminEmail,
        nombres: 'Super',
        apellidos: 'Admin',
        dni: dniToUse,
        password: hashedPassword,
        rol: Role.SUPER_ADMIN,
        modulosPermitidos: allModules,
      },
    });
    console.log(`\n  ✅ Cuenta SUPER_ADMIN creada exitosamente:`);
    console.log(`     - Email     : ${created.email}`);
    console.log(`     - Rol       : ${created.rol}`);
    console.log(`     - Contraseña: ${superAdminPassword}`);
  } else {
    const updated = await prisma.usuario.update({
      where: { id: existingSuperAdmin.id },
      data: {
        password: hashedPassword,
        rol: Role.SUPER_ADMIN,
        modulosPermitidos: allModules,
      },
    });
    console.log(`\n  ✅ Cuenta SUPER_ADMIN actualizada exitosamente:`);
    console.log(`     - Email     : ${updated.email}`);
    console.log(`     - Rol       : ${updated.rol}`);
    console.log(`     - Contraseña: ${superAdminPassword}`);
  }

  // 3. Resumen de cuentas actuales
  console.log('\n-------------------------------------------------------------');
  console.log('              RESUMEN DE CUENTAS ADMINISTRATIVAS');
  console.log('-------------------------------------------------------------');

  const allAdmins = await prisma.usuario.findMany({
    where: {
      rol: { in: [Role.SUPER_ADMIN, Role.ADMIN] },
    },
    select: {
      email: true,
      nombres: true,
      apellidos: true,
      rol: true,
    },
    orderBy: { rol: 'desc' },
  });

  for (const adm of allAdmins) {
    const badge = adm.rol === Role.SUPER_ADMIN ? '⭐ SUPER_ADMIN (Acceso Total + Beta)' : '💼 ADMIN (Producción Limpia)';
    console.log(`  • ${adm.email.padEnd(25)} -> ${badge}`);
  }

  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error al configurar roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
