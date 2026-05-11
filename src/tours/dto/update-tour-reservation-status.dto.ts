import { IsIn } from 'class-validator';
import { TOUR_RESERVATION_STATUSES } from '../constants/tour-reservation-status';

export class UpdateTourReservationStatusDto {
  @IsIn([...TOUR_RESERVATION_STATUSES])
  status!: (typeof TOUR_RESERVATION_STATUSES)[number];
}
