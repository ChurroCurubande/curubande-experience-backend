import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsNotEmpty({ message: 'El nombre de usuario o correo electrónico es obligatorio' })
  @IsString({ message: 'El nombre de usuario o correo electrónico debe ser una cadena de texto' })
  usernameOrEmail: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}
