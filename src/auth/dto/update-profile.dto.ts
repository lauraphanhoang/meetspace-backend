import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Laura',
    description: "Prénom de l'utilisateur",
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le prénom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le prénom ne peut pas dépasser 50 caractères.',
  })
  firstname?: string;

  @ApiPropertyOptional({
    example: 'PHAN-HOANG',
    description: "Nom de l'utilisateur",
  })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le nom ne peut pas dépasser 50 caractères.',
  })
  lastname?: string;

  @ApiPropertyOptional({
    example: 'laura@example.com',
    description: "Adresse e-mail de l'utilisateur",
  })
  @IsOptional()
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email?: string;
}
