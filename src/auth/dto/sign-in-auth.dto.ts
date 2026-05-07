import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
