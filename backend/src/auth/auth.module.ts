import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule,
    JwtModule.register({
      global: true,
      secret: (() => {
        const secret = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY;
        if (!secret) {
          throw new Error('⛔ JWT_SECRET no está definido en las variables de entorno. Configure JWT_SECRET en su archivo .env');
        }
        return secret;
      })(),
      // A4: Token expira en 24h — los usuarios deben re-autenticarse diariamente
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

