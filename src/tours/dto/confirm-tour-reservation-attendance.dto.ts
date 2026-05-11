import { IsUUID } from 'class-validator';

export class ConfirmTourReservationAttendanceDto {
  @IsUUID('4')
  token!: string;
}
