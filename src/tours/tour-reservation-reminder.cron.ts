import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ToursService } from './tours.service';

/**
 * Envía el correo de confirmación de asistencia un día antes de la fecha de la reserva,
 * todos los días a las 12:00 (mediodía) en America/Costa_Rica.
 * La lógica de “qué día es mañana” usa {@link ToursService.sendAttendanceRemindersForTomorrow}
 * con `RESERVATION_REMINDER_TIMEZONE` del Config (por defecto la misma zona).
 */
@Injectable()
export class TourReservationReminderCron {
  private readonly logger = new Logger(TourReservationReminderCron.name);

  constructor(private readonly toursService: ToursService) {}

  @Cron('0 0 12 * * *', {
    name: 'tour-reservation-attendance-reminder',
    timeZone: 'America/Costa_Rica',
  })
  async handle(): Promise<void> {
    try {
      const sent = await this.toursService.sendAttendanceRemindersForTomorrow();
      this.logger.log(`Recordatorios de asistencia procesados: ${sent}`);
    } catch (err: unknown) {
      this.logger.error('Fallo el cron de recordatorios de reserva', err);
    }
  }
}
