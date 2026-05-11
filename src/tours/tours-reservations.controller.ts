import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ConfirmTourReservationAttendanceDto } from './dto/confirm-tour-reservation-attendance.dto';
import { UpdateTourReservationStatusDto } from './dto/update-tour-reservation-status.dto';
import { ToursService } from './tours.service';

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
  @Post('reservations/confirm-attendance')
  confirmAttendance(@Body() dto: ConfirmTourReservationAttendanceDto) {
    return this.toursService.confirmAttendanceByToken(dto);
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
