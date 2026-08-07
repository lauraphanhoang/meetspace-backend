import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'laura@example.com',
    description: "Adresse e-mail de l'utilisateur",
  })
  @IsNotEmpty({ message: "L'adresse email est obligatoire." })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email!: string;

  @ApiProperty({
    example: 'MotDePasse123!',
    description: 'Mot de passe du compte',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  password!: string;
}
