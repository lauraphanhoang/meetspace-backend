import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Salle A',
    description: 'Nom de la salle',
  })
  @IsNotEmpty({ message: 'Le nom de la salle est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  name!: string;

  @ApiProperty({
    example: 30,
    description: 'Capacité maximale de la salle',
  })
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
  location!: string;

  @ApiPropertyOptional({
    example: 'Projecteur, Wi-Fi',
    description: 'Équipements disponibles dans la salle',
  })
  @IsOptional()
  @IsString({
    message: 'Les équipements doivent être une chaîne de caractères.',
  })
  equipment?: string;
}
