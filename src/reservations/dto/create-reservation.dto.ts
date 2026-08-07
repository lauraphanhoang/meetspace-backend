import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

import { IsEndDateAfterStartDate } from '../../common/validators/is-end-date-after-start-date.validator';

export class CreateReservationDto {
  @ApiProperty({
    example: 1,
    description: 'Identifiant de la salle à réserver',
  })
  @IsNotEmpty({ message: 'La salle est obligatoire.' })
  @IsInt({ message: 'L’identifiant de la salle doit être un entier.' })
  @Min(1, { message: 'L’identifiant de la salle est invalide.' })
  roomId!: number;

  @ApiProperty({
    example: '2026-09-01T09:00:00.000Z',
    description: 'Date et heure de début de la réservation (format ISO 8601)',
  })
  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  @IsDateString({}, { message: 'La date de début est invalide.' })
  startDate!: string;

  @ApiProperty({
    example: '2026-09-01T17:00:00.000Z',
    description:
      'Date et heure de fin de la réservation (doit être postérieure à la date de début)',
  })
  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  @IsDateString({}, { message: 'La date de fin est invalide.' })
  @IsEndDateAfterStartDate('startDate', {
    message: 'La date de fin doit être après la date de début.',
  })
  endDate!: string;
}
