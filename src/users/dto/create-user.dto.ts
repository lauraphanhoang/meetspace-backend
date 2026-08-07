import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Laura',
    description: "Prénom de l'utilisateur",
  })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le prénom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le prénom ne peut pas dépasser 50 caractères.',
  })
  readonly firstname!: string;

  @ApiProperty({
    example: 'PHAN-HOANG',
    description: "Nom de famille de l'utilisateur",
  })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le nom ne peut pas dépasser 50 caractères.',
  })
  readonly lastname!: string;

  @ApiProperty({
    example: 'laura@example.com',
    description: "Adresse e-mail de l'utilisateur",
  })
  @IsNotEmpty({ message: "L'adresse email est obligatoire." })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  readonly email!: string;

  @ApiProperty({
    example: 'MotDePasse123!',
    description:
      'Mot de passe (8 à 72 caractères, avec au moins une majuscule, une minuscule et un chiffre)',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(72, {
    message: 'Le mot de passe ne peut pas dépasser 72 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
  })
  readonly password!: string;
}
