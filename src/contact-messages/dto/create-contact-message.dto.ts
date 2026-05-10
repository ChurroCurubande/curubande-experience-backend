import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { trimString } from '../../common/utils/trim-string.util';

export class CreateContactMessageDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'Juan Perez' })
  name: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(5, 100, {
    message: 'El correo electrónico debe tener entre 5 y 100 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'cliente@correo.com' })
  email: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @Length(5, 2000, {
    message: 'El mensaje debe tener entre 5 y 2000 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'Quiero mas informacion sobre los tours.' })
  message: string;
}
