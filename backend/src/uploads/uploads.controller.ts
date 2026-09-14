import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard)
  @Get('*filePath')
  serveFile(@Param('filePath') filePathParam: string, @Res() res: Response) {
    const filename = Array.isArray(filePathParam) ? filePathParam.join('/') : filePathParam || '';
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const safePath = path.resolve(uploadsRoot, filename);

    // Evitar path traversal verificando que la ruta resuelta esté dentro de uploads/
    if (!safePath.startsWith(uploadsRoot) || !fs.existsSync(safePath)) {
      throw new NotFoundException('Archivo PDF no encontrado en el servidor');
    }

    const safeFilename = path.basename(safePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.sendFile(safePath);
  }
}
