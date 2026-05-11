import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { UpdateTourReservationStatusDto } from './dto/update-tour-reservation-status.dto';
import { ToursService } from './tours.service';

function buildConfirmHtml(message: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirmación de asistencia</title><style>body{font-family:Arial,sans-serif;background:#f4f9f6;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}.card{background:#fff;border-radius:12px;padding:40px 32px;max-width:480px;width:90%;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,.08)}h1{color:#2d6a4f;font-size:22px;margin:16px 0 12px}p{color:#555;font-size:15px;line-height:1.6;margin:0}.icon{font-size:52px}</style></head><body><div class="card"><div class="icon">✅</div><h1>¡Asistencia confirmada!</h1><p>${message}</p></div></body></html>`;
}

function buildConfirmErrorHtml(): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Enlace inválido</title><style>body{font-family:Arial,sans-serif;background:#f4f9f6;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}.card{background:#fff;border-radius:12px;padding:40px 32px;max-width:480px;width:90%;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,.08)}h1{color:#c0392b;font-size:22px;margin:16px 0 12px}p{color:#555;font-size:15px;line-height:1.6;margin:0}.icon{font-size:52px}</style></head><body><div class="card"><div class="icon">❌</div><h1>Enlace inválido</h1><p>Este enlace ya no es válido o ha expirado.</p></div></body></html>`;
}

/**
 * Rutas de reservas bajo `/tours/...`. El listado vive en un controlador aparte
 * registrado antes que {@link ToursController} para evitar colisiones con `/:id`.
 */
@ApiTags('tours')
@ApiCookieAuth('access_token')
@Controller('tours')
export class ToursReservationsController {
  constructor(private readonly toursService: ToursService) {}

  @Get('reservations')
  findAllReservations() {
    return this.toursService.findAllReservations();
  }

  @Public()
  @Get('reservations/confirm-attendance')
  async confirmAttendance(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.toursService.confirmAttendanceByToken(token);
      res.type('text/html').send(buildConfirmHtml(result.message));
    } catch {
      res.status(400).type('text/html').send(buildConfirmErrorHtml());
    }
  }

  /**
   * Dispara el mismo envío que el cron de mediodía: correos de confirmación de asistencia
   * para reservas con fecha = mañana (zona configurada), pendientes y sin recordatorio previo.
   */
  @Post('reservations/attendance-reminders/run')
  @ApiOperation({
    summary: 'Ejecutar recordatorios de asistencia manualmente',
    description:
      'Equivalente al job diario: envía los correos pendientes para mañana. Requiere autenticación.',
  })
  runAttendanceReminders() {
    return this.toursService.sendAttendanceRemindersForTomorrow().then((sent) => ({
      sent,
    }));
  }

  @Patch('reservations/:reservationId')
  updateReservationStatus(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: UpdateTourReservationStatusDto,
  ) {
    return this.toursService.updateReservationStatus(reservationId, dto);
  }
}
