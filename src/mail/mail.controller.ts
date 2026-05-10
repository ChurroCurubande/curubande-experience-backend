import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Public } from '../auth/decorators/public.decorator';
import { MailService } from './mail.service';

class TestMailDto {
  @IsEmail()
  @ApiProperty({ example: 'tu@correo.com' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'María' })
  name?: string;
}

@ApiTags('mail')
@ApiCookieAuth('access_token')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('test')
  @ApiOperation({ summary: 'Enviar correo de prueba (Brevo)' })
  async test(@Body() dto: TestMailDto) {
    const res = await this.mailService.sendTestEmail(
      dto.email,
      dto.name?.trim() || 'Cliente',
    );
    return {
      ok: true,
      messageId: (res as { messageId?: string })?.messageId ?? null,
      message: 'Correo enviado correctamente',
    };
  }
}
