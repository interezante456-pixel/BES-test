import { Test, TestingModule } from '@nestjs/testing';
import { SunatScraperService } from './sunat-scraper.service';
import { PrismaService } from '../../prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { MailService } from '../../mail/mail.service';
import { TelegramService } from '../../mail/telegram.service';
import { WhatsappService } from '../../mail/whatsapp.service';
import { PdfParserService } from '../shared/pdf-parser.service';
import { BrowserService } from '../shared/browser.service';

describe('SunatScraperService', () => {
  let service: SunatScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SunatScraperService,
        {
          provide: PrismaService,
          useValue: {
            empresa: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            notificacion: {
              findMany: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendUrgentAlert: jest.fn(),
            sendPdfFailureSummary: jest.fn(),
          },
        },
        {
          provide: TelegramService,
          useValue: {
            sendAlertToEmpresa: jest.fn(),
          },
        },
        {
          provide: WhatsappService,
          useValue: {
            sendAlert: jest.fn(),
          },
        },
        {
          provide: PdfParserService,
          useValue: {
            parsePdfBuffer: jest.fn(),
            parsePdfFile: jest.fn(),
            extractFromText: jest.fn(),
          },
        },
        {
          provide: BrowserService,
          useValue: {
            launchIsolated: jest.fn(),
            launchSimple: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SunatScraperService>(SunatScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
