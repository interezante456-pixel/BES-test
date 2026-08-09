import { Module } from '@nestjs/common';
import { EmpresaAccessService } from './empresa-access.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EmpresaAccessService],
  exports: [EmpresaAccessService],
})
export class CommonModule {}
