import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Le nom de la salle est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  name!: string;

  @IsNotEmpty({ message: 'La capacité est obligatoire.' })
  @IsInt({ message: 'La capacité doit être un entier.' })
  @Min(1, { message: 'La capacité doit être supérieure à 0.' })
  capacity!: number;

  @IsNotEmpty({ message: "L'emplacement est obligatoire." })
  @IsString({
    message: "L'emplacement doit être une chaîne de caractères.",
  })
  location!: string;

  @IsOptional()
  @IsString({
    message: 'Les équipements doivent être une chaîne de caractères.',
  })
  equipment?: string;
}
