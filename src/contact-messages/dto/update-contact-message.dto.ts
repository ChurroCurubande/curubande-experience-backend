import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto extends PartialType(
  CreateContactMessageDto,
) {
  @IsOptional()
  @IsBoolean({ message: 'El estado de lectura debe ser booleano' })
  is_read?: boolean;
}
