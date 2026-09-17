import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Salle A',
    description: 'Nom de la salle',
  })
  @IsNotEmpty({ message: 'Le nom de la salle est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le nom de la salle doit contenir au moins 2 caractères.',
  })
  @MaxLength(100, {
    message: 'Le nom de la salle ne peut pas dépasser 100 caractères.',
  })
  name!: string;

  @ApiProperty({
    example: 20,
    description: 'Capacité maximale de la salle',
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'La capacité est obligatoire.' })
  @IsInt({ message: 'La capacité doit être un entier.' })
  @Min(1, { message: 'La capacité doit être supérieure à 0.' })
  capacity!: number;

  @ApiProperty({
    example: 'Paris',
    description: 'Emplacement de la salle',
  })
  @IsNotEmpty({ message: "L'emplacement est obligatoire." })
  @IsString({
    message: "L'emplacement doit être une chaîne de caractères.",
  })
  @MinLength(2, {
    message: "L'emplacement doit contenir au moins 2 caractères.",
  })
  @MaxLength(150, {
    message: "L'emplacement ne peut pas dépasser 150 caractères.",
  })
  location!: string;

  @ApiPropertyOptional({
    example: 'Projecteur, Wi-Fi',
    description: 'Équipements disponibles dans la salle',
  })
  @IsOptional()
  @IsString({
    message: 'Les équipements doivent être une chaîne de caractères.',
  })
  @MaxLength(500, {
    message: 'Les équipements ne peuvent pas dépasser 500 caractères.',
  })
  equipment?: string;
}
