import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle() // El health check no debe ser limitado por rate limiting
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Verificar conexión a PostgreSQL
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
