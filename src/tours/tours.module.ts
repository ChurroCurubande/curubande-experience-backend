import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { TourClick } from './entities/tour-click.entity';
import { TourReservation } from './entities/tour-reservation.entity';
import { Tour } from './entities/tour.entity';
import { ToursController } from './tours.controller';
import { ToursReservationsController } from './tours-reservations.controller';
import { TourReservationReminderCron } from './tour-reservation-reminder.cron';
import { ToursService } from './tours.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour, TourClick, TourReservation]),
    MailModule,
  ],
  controllers: [ToursReservationsController, ToursController],
  providers: [ToursService, TourReservationReminderCron],
})
export class ToursModule {}
