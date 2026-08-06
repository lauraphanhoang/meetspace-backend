import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsInt({ message: 'L’identifiant de la salle doit être un entier.' })
  @Min(1, { message: 'L’identifiant de la salle est invalide.' })
  roomId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La date de début est invalide.' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La date de fin est invalide.' })
  endDate?: string;
}
