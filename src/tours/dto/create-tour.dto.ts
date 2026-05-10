import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { trimString } from '../../common/utils/trim-string.util';

function parseActivities(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => trimString(item)).filter(Boolean);
  }

  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => trimString(item)).filter(Boolean);
    }
  } catch {
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export class CreateTourDto {
  @IsNotEmpty({ message: 'El nombre del tour es obligatorio' })
  @Length(2, 120, {
    message: 'El nombre del tour debe tener entre 2 y 120 caracteres',
  })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: 'Catarata La Leona' })
  name: string;

  @IsArray({ message: 'Las actividades deben ser una lista' })
  @ArrayNotEmpty({ message: 'Agrega al menos una actividad' })
  @IsString({ each: true, message: 'Cada actividad debe ser texto' })
  @Transform(({ value }) => parseActivities(value))
  @ApiProperty({ example: ['Senderismo', 'Natacion', 'Fotografia'] })
  activities: string[];

  @IsNotEmpty({ message: 'La duración es obligatoria' })
  @Length(2, 80, { message: 'La duración debe tener entre 2 y 80 caracteres' })
  @Transform(({ value }) => trimString(value))
  @ApiProperty({ example: '3-4 horas' })
  duration: string;

  @IsInt({ message: 'El número de personas debe ser entero' })
  @Min(1, { message: 'El número de personas debe ser mayor a 0' })
  @Type(() => Number)
  @ApiProperty({ example: 10 })
  number_of_people: number;
}
