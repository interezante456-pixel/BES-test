import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'passwordoracon2026';
  const hash = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.usuario.update({
    where: { email: 'admin@oracon.com' },
    data: { password: hash },
  });

  console.log('✅ Contraseña actualizada para:', updated.email);
  console.log('Nueva contraseña: passwordoracon2026');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

