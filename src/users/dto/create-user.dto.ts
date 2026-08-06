import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le prénom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le prénom ne peut pas dépasser 50 caractères.',
  })
  readonly firstname!: string;

  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  })
  @MaxLength(50, {
    message: 'Le nom ne peut pas dépasser 50 caractères.',
  })
  readonly lastname!: string;

  @IsNotEmpty({ message: "L'adresse email est obligatoire." })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  readonly email!: string;

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
