import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { trimString } from '../../common/utils/trim-string.util';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Length(3, 30, {
    message: 'El nombre de usuario debe tener entre 3 y 30 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'curubande' })
  username: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(5, 100, {
    message: 'El correo electrónico debe tener entre 5 y 100 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @Length(8, 200, {
    message: 'La contraseña debe tener entre 8 y 200 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'StrongPassword123!' })
  password: string;
}
