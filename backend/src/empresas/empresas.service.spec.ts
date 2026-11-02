import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { AuditService } from '../audit/audit.service';

const mockEmpresa = {
  id: 'empresa-uuid-1',
  ruc: '20123456789',
  razonSocial: 'Empresa Test SAC',
  usuarioSol: 'TESTUSER',
  claveSol: 'encrypted-clave',
  habilitadoSunat: true,
  habilitadoSunafil: false,
  terminosSunafil: 'SIN_VERIFICAR',
  estadoConexion: 'CONECTADO',
  estadoSincro: 'IDLE',
  activo: true,
  ultimaSincronizacion: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  usuarioId: 'usuario-uuid-1',
};

describe('EmpresasService', () => {
  let service: EmpresasService;
  let prisma: any;
  let encryptionService: any;
  let auditService: any;

  beforeEach(async () => {
    prisma = {
      empresa: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      notificacion: {
        deleteMany: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      empresaAsignacion: {
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
      eventoCalendario: { deleteMany: jest.fn() },
      recordatorio: { deleteMany: jest.fn() },
    };

    encryptionService = {
      encrypt: jest.fn().mockReturnValue('encrypted-clave'),
      decrypt: jest.fn().mockReturnValue('clave-original'),
    };

    auditService = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: encryptionService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe lanzar BadRequestException si faltan campos obligatorios', async () => {
      await expect(
        service.create({ ruc: '', razonSocial: '', usuarioSol: '', claveSol: '' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar la empresa si ya existe el RUC para el usuario', async () => {
      prisma.empresa.findFirst.mockResolvedValue(mockEmpresa);
      prisma.empresa.update.mockResolvedValue({ ...mockEmpresa, usuarioSol: 'NUEVO' });

      const result = await service.create(
        { ruc: '20123456789', razonSocial: 'Empresa Test SAC', usuarioSol: 'NUEVO', claveSol: 'abc123' },
        'usuario-uuid-1',
      );

      expect(prisma.empresa.update).toHaveBeenCalled();
      expect(result.usuarioSol).toBe('NUEVO');
    });

    it('debe crear una nueva empresa si el RUC no existe', async () => {
      prisma.empresa.findFirst.mockResolvedValue(null);
      prisma.empresa.create.mockResolvedValue(mockEmpresa);

      const result = await service.create(
        { ruc: '20123456789', razonSocial: 'Empresa Test SAC', usuarioSol: 'TESTUSER', claveSol: 'abc123' },
        'usuario-uuid-1',
      );

      expect(prisma.empresa.create).toHaveBeenCalled();
      expect(encryptionService.encrypt).toHaveBeenCalledWith('abc123');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'CREAR_EMPRESA' }),
      );
      expect(result.ruc).toBe('20123456789');
    });
  });

  // ─── findAllByUser ─────────────────────────────────────────────────────────

  describe('findAllByUser', () => {
    it('debe retornar todas las empresas para SUPER_ADMIN (con clave enmascarada)', async () => {
      prisma.empresa.findMany.mockResolvedValue([mockEmpresa]);

      const result = await service.findAllByUser('usuario-uuid-1', 'SUPER_ADMIN');

      expect(prisma.empresa.findMany).toHaveBeenCalled();
      expect(result[0].claveSol).toBe('••••••••');
    });

    it('debe retornar [] si el usuario local no tiene asignaciones', async () => {
      prisma.empresaAsignacion.findMany.mockResolvedValue([]);

      const result = await service.findAllByUser('usuario-uuid-1', 'USUARIO_LOCAL');
      expect(result).toEqual([]);
    });

    it('debe filtrar empresas asignadas para USUARIO_LOCAL', async () => {
      prisma.empresaAsignacion.findMany.mockResolvedValue([{ empresaId: 'empresa-uuid-1' }]);
      prisma.empresa.findMany.mockResolvedValue([mockEmpresa]);

      const result = await service.findAllByUser('usuario-uuid-1', 'USUARIO_LOCAL');
      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('debe llamar a findFirst con id y usuarioId', async () => {
      prisma.empresa.findFirst.mockResolvedValue(mockEmpresa);

      const result = await service.findOne('empresa-uuid-1', 'usuario-uuid-1');

      expect(prisma.empresa.findFirst).toHaveBeenCalledWith({
        where: { id: 'empresa-uuid-1', usuarioId: 'usuario-uuid-1' },
      });
      expect(result).toEqual(mockEmpresa);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe encriptar la clave si viene en el DTO', async () => {
      prisma.empresa.updateMany.mockResolvedValue({ count: 1 });

      await service.update('empresa-uuid-1', { claveSol: 'nueva-clave' }, 'usuario-uuid-1');

      expect(encryptionService.encrypt).toHaveBeenCalledWith('nueva-clave');
      expect(prisma.empresa.updateMany).toHaveBeenCalled();
    });

    it('debe actualizar sin encriptar si no viene clave', async () => {
      prisma.empresa.updateMany.mockResolvedValue({ count: 1 });

      await service.update('empresa-uuid-1', { razonSocial: 'Nuevo Nombre' }, 'usuario-uuid-1');

      expect(encryptionService.encrypt).not.toHaveBeenCalled();
    });
  });

  // ─── toggleHabilitadoSunat ─────────────────────────────────────────────────

  describe('toggleHabilitadoSunat', () => {
    it('debe lanzar BadRequestException si la empresa no existe', async () => {
      prisma.empresa.findUnique.mockResolvedValue(null);

      await expect(service.toggleHabilitadoSunat('bad-id', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe invertir el estado habilitadoSunat', async () => {
      prisma.empresa.findUnique.mockResolvedValue({ ...mockEmpresa, habilitadoSunat: true });
      prisma.empresa.update.mockResolvedValue({ ...mockEmpresa, habilitadoSunat: false });

      const result = await service.toggleHabilitadoSunat('empresa-uuid-1', 'usuario-uuid-1');

      expect(prisma.empresa.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { habilitadoSunat: false } }),
      );
      expect(result.habilitadoSunat).toBe(false);
    });
  });

  // ─── toggleHabilitadoSunafil ───────────────────────────────────────────────

  describe('toggleHabilitadoSunafil', () => {
    it('debe lanzar BadRequestException si la empresa no existe', async () => {
      prisma.empresa.findUnique.mockResolvedValue(null);

      await expect(service.toggleHabilitadoSunafil('bad-id', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe invertir el estado habilitadoSunafil', async () => {
      prisma.empresa.findUnique.mockResolvedValue({ ...mockEmpresa, habilitadoSunafil: false });
      prisma.empresa.update.mockResolvedValue({ ...mockEmpresa, habilitadoSunafil: true });

      const result = await service.toggleHabilitadoSunafil('empresa-uuid-1', 'usuario-uuid-1');

      expect(prisma.empresa.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { habilitadoSunafil: true } }),
      );
      expect(result.habilitadoSunafil).toBe(true);
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('debe lanzar BadRequestException si la empresa no existe', async () => {
      prisma.empresa.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('debe eliminar empresa y sus relaciones en cascada', async () => {
      prisma.empresa.findUnique.mockResolvedValue(mockEmpresa);
      prisma.notificacion.deleteMany.mockResolvedValue({ count: 2 });
      prisma.empresaAsignacion.deleteMany.mockResolvedValue({ count: 1 });
      prisma.eventoCalendario.deleteMany.mockResolvedValue({ count: 0 });
      prisma.recordatorio.deleteMany.mockResolvedValue({ count: 0 });
      prisma.empresa.delete.mockResolvedValue(mockEmpresa);

      const result = await service.remove('empresa-uuid-1', 'usuario-uuid-1');

      expect(prisma.notificacion.deleteMany).toHaveBeenCalledWith({ where: { empresaId: 'empresa-uuid-1' } });
      expect(prisma.empresa.delete).toHaveBeenCalledWith({ where: { id: 'empresa-uuid-1' } });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ accion: 'ELIMINAR_EMPRESA' }),
      );
      expect(result).toEqual(mockEmpresa);
    });
  });

  // ─── resetStuckSync ────────────────────────────────────────────────────────

  describe('resetStuckSync', () => {
    it('debe resetear empresas atascadas en SYNCING', async () => {
      prisma.empresa.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.resetStuckSync();

      expect(prisma.empresa.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estadoSincro: 'IDLE' } }),
      );
      expect(result).toEqual({ reset: 3 });
    });
  });
});
