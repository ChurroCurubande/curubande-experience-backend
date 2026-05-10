import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsNotEmpty, Length } from 'class-validator';
import { trimString } from '../../common/utils/trim-string.util';

export class CreateTourReservationDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'María González', description: 'Nombre completo' })
  name: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(5, 100, {
    message: 'El correo electrónico debe tener entre 5 y 100 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'cliente@correo.com' })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Length(8, 30, {
    message: 'El teléfono debe tener entre 8 y 30 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: '+506 8888-8888' })
  phone: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha debe ser válida (formato ISO, ej. 2026-06-15)' },
  )
  @ApiProperty({ example: '2026-06-15', description: 'Fecha deseada del tour' })
  date: string;
}
