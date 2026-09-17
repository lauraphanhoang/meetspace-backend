import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: "L'ancien mot de passe est obligatoire." })
  @IsString({
    message: "L'ancien mot de passe doit être une chaîne de caractères.",
  })
  currentPassword!: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire.' })
  @IsString({
    message: 'Le nouveau mot de passe doit être une chaîne de caractères.',
  })
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(72, {
    message: 'Le nouveau mot de passe ne peut pas dépasser 72 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
  })
  newPassword!: string;
}
