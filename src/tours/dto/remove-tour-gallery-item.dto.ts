import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveTourGalleryItemDto {
  @IsNotEmpty({ message: 'La ruta del archivo es obligatoria' })
  @IsString({ message: 'La ruta del archivo debe ser texto' })
  @ApiProperty({ example: 'landing/tours-gallery/123-foto.jpg' })
  path: string;
}
