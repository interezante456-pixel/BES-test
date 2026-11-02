import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    process.env.ENCRYPTION_KEY = 'cb7a556721efeaa43fb244de5b95a6a1';
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Prueba 1: encrypt produce formato correcto ────────────────────────────

  it('debe cifrar un texto y producir formato iv:ciphertext', () => {
    const encrypted = service.encrypt('clave-secreta');
    expect(encrypted).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/);
  });

  // ─── Prueba 2: encrypt + decrypt son inversos ──────────────────────────────

  it('debe descifrar correctamente lo que cifró', () => {
    const original = 'mi-clave-sol-123';
    const encrypted = service.encrypt(original);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  // ─── Prueba 3: decrypt lanza error con hash inválido ──────────────────────

  it('debe lanzar error al descifrar un hash con formato inválido (sin ":")', () => {
    expect(() => service.decrypt('formatoinvalidosindoblepunto')).toThrow();
  });

  // ─── Prueba 4: ENCRYPTION_KEY con longitud incorrecta ─────────────────────

  it('debe lanzar error si ENCRYPTION_KEY no tiene 32 caracteres', () => {
    process.env.ENCRYPTION_KEY = 'clave-corta';
    expect(() => new EncryptionService()).toThrow(
      'ENCRYPTION_KEY debe estar definida en las variables de entorno y tener exactamente 32 caracteres.',
    );
    // Restaurar para no afectar otros tests
    process.env.ENCRYPTION_KEY = 'cb7a556721efeaa43fb244de5b95a6a1';
  });

  // ─── Prueba 5: IV aleatorio → mismos textos, distintos cifrados ───────────

  it('dos cifrados del mismo texto deben ser distintos (IV aleatorio)', () => {
    const texto = 'texto-repetido';
    const enc1 = service.encrypt(texto);
    const enc2 = service.encrypt(texto);
    expect(enc1).not.toBe(enc2);
    // Pero ambos descifran al valor original
    expect(service.decrypt(enc1)).toBe(texto);
    expect(service.decrypt(enc2)).toBe(texto);
  });
});
