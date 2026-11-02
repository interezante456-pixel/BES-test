import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma.service';

const mockAuditLog = {
  id: 'audit-uuid-1',
  usuarioId: 'usuario-uuid-1',
  accion: 'LOGIN',
  entidad: 'Usuario',
  entidadId: 'usuario-uuid-1',
  detalles: '{"email":"test@oracon.com"}',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date(),
};

describe('AuditService', () => {
  let service: AuditService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── log ──────────────────────────────────────────────────────────────────

  describe('log', () => {
    it('debe crear un registro de auditoría con detalles como string JSON', async () => {
      prisma.auditLog.create.mockResolvedValue(mockAuditLog);

      await service.log({
        usuarioId: 'usuario-uuid-1',
        accion: 'LOGIN',
        entidad: 'Usuario',
        entidadId: 'usuario-uuid-1',
        detalles: { email: 'test@oracon.com' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accion: 'LOGIN',
          detalles: '{"email":"test@oracon.com"}',
          ipAddress: '127.0.0.1',
        }),
      });
    });

    it('debe aceptar detalles como string directamente', async () => {
      prisma.auditLog.create.mockResolvedValue(mockAuditLog);

      await service.log({ accion: 'LOGOUT', detalles: 'salida manual' });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ detalles: 'salida manual' }),
      });
    });

    it('debe manejar errores silenciosamente sin lanzar excepción', async () => {
      prisma.auditLog.create.mockRejectedValue(new Error('DB error'));

      await expect(service.log({ accion: 'TEST' })).resolves.toBeUndefined();
    });

    it('debe crear log sin usuarioId (acciones anónimas)', async () => {
      prisma.auditLog.create.mockResolvedValue({ ...mockAuditLog, usuarioId: null });

      await service.log({ accion: 'LOGIN_FALLIDO', detalles: { email: 'x@x.com' } });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ usuarioId: null }),
      });
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada con meta', async () => {
      prisma.auditLog.count.mockResolvedValue(5);
      prisma.auditLog.findMany.mockResolvedValue([mockAuditLog]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({ total: 5, page: 1, limit: 10, totalPages: 1 });
    });

    it('debe filtrar por usuarioId', async () => {
      prisma.auditLog.count.mockResolvedValue(1);
      prisma.auditLog.findMany.mockResolvedValue([mockAuditLog]);

      await service.findAll({ usuarioId: 'usuario-uuid-1' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ usuarioId: 'usuario-uuid-1' }),
        }),
      );
    });

    it('debe filtrar por rango de fechas', async () => {
      prisma.auditLog.count.mockResolvedValue(0);
      prisma.auditLog.findMany.mockResolvedValue([]);

      await service.findAll({ desde: '2025-01-01', hasta: '2025-12-31' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('debe aplicar límite máximo de 100 registros', async () => {
      prisma.auditLog.count.mockResolvedValue(0);
      prisma.auditLog.findMany.mockResolvedValue([]);

      await service.findAll({ limit: 9999 });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  // ─── getAccionesUnicas ─────────────────────────────────────────────────────

  describe('getAccionesUnicas', () => {
    it('debe retornar lista de acciones únicas', async () => {
      prisma.auditLog.findMany.mockResolvedValue([
        { accion: 'LOGIN' },
        { accion: 'LOGOUT' },
        { accion: 'CREAR_EMPRESA' },
      ]);

      const result = await service.getAccionesUnicas();

      expect(result).toEqual(['LOGIN', 'LOGOUT', 'CREAR_EMPRESA']);
    });
  });
});
