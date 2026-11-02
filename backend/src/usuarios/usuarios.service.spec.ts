import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsuariosService, generateAutoEmail } from './usuarios.service';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

const mockUsuario = {
  id: 'usuario-uuid-1',
  email: 'jg12345678@oracon.com',
  nombres: 'Juan',
  apellidos: 'García',
  dni: '12345678',
  rol: 'USUARIO_LOCAL',
  modulosPermitidos: ['SUNAT'],
  telegramChatId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  password: '$2b$10$hashedpassword',
};

describe('generateAutoEmail', () => {
  it('debe generar email con iniciales y DNI', () => {
    const email = generateAutoEmail('Juan', 'García', '12345678');
    expect(email).toBe('jg12345678@oracon.com');
  });

  it('debe manejar nombres compuestos', () => {
    const email = generateAutoEmail('Juan Carlos', 'García López', '87654321');
    expect(email).toBe('jcgl87654321@oracon.com');
  });

  it('debe eliminar acentos y caracteres especiales', () => {
    const email = generateAutoEmail('María', 'Pérez', '11111111');
    expect(email).toBe('mp11111111@oracon.com');
  });
});

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: any;
  let eventsGateway: any;

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    eventsGateway = {
      emitToUser: jest.fn(),
      emitAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventsGateway, useValue: eventsGateway },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('debe retornar el perfil del usuario', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      const result = await service.getProfile('usuario-uuid-1');
      expect(result).toEqual(mockUsuario);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('SUPER_ADMIN debe ver todos los usuarios (sin filtro)', async () => {
      prisma.usuario.findMany.mockResolvedValue([mockUsuario]);

      await service.findAll('SUPER_ADMIN');

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('ADMIN no debe ver SUPER_ADMIN', async () => {
      prisma.usuario.findMany.mockResolvedValue([mockUsuario]);

      await service.findAll('ADMIN');

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rol: { not: 'SUPER_ADMIN' } },
        }),
      );
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('debe retornar el usuario por id', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);

      const result = await service.findOne('usuario-uuid-1');
      expect(result).toEqual(mockUsuario);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const validData = {
      nombres: 'Juan',
      apellidos: 'García',
      dni: '12345678',
      password: 'password123',
      rol: 'USUARIO_LOCAL',
    };

    it('debe lanzar ForbiddenException si el rol es SUPER_ADMIN', async () => {
      await expect(service.create({ ...validData, rol: 'SUPER_ADMIN' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe lanzar BadRequestException si no hay nombres', async () => {
      await expect(service.create({ ...validData, nombres: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el DNI no tiene 8 dígitos', async () => {
      await expect(service.create({ ...validData, dni: '123' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar ConflictException si el DNI ya existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario); // DNI ya existe

      await expect(service.create(validData)).rejects.toThrow(ConflictException);
    });

    it('debe crear el usuario exitosamente', async () => {
      prisma.usuario.findUnique
        .mockResolvedValueOnce(null) // DNI no existe
        .mockResolvedValueOnce(null); // Email no existe
      prisma.usuario.create.mockResolvedValue(mockUsuario);

      const result = await service.create(validData);

      expect(prisma.usuario.create).toHaveBeenCalled();
      expect(result).toEqual(mockUsuario);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.update('bad-id', { nombres: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ForbiddenException si se intenta promover a SUPER_ADMIN', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ ...mockUsuario, rol: 'ADMIN' });

      await expect(service.update('usuario-uuid-1', { rol: 'SUPER_ADMIN' }, 'ADMIN')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe actualizar y emitir evento si cambian módulos', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue({
        ...mockUsuario,
        modulosPermitidos: ['SUNAT', 'SUNAFIL'],
      });

      await service.update('usuario-uuid-1', { modulosPermitidos: ['SUNAT', 'SUNAFIL'] });

      expect(eventsGateway.emitToUser).toHaveBeenCalled();
      expect(eventsGateway.emitAll).toHaveBeenCalled();
    });

    it('debe regenerar el email si cambian nombres/apellidos/dni', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue({
        ...mockUsuario,
        nombres: 'Pedro',
        email: 'pg12345678@oracon.com',
      });

      const result = await service.update('usuario-uuid-1', { nombres: 'Pedro' });

      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: expect.stringContaining('@oracon.com') }),
        }),
      );
      expect(result.nombres).toBe('Pedro');
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si se intenta eliminar al SUPER_ADMIN', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ ...mockUsuario, rol: 'SUPER_ADMIN' });

      await expect(service.remove('usuario-uuid-1')).rejects.toThrow(ForbiddenException);
    });

    it('debe eliminar el usuario correctamente', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.delete.mockResolvedValue(mockUsuario);

      const result = await service.remove('usuario-uuid-1');

      expect(prisma.usuario.delete).toHaveBeenCalledWith({ where: { id: 'usuario-uuid-1' } });
      expect(result).toEqual(mockUsuario);
    });
  });
});
