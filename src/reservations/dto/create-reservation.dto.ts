import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

import { IsEndDateAfterStartDate } from '../../common/validators/is-end-date-after-start-date.validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'La salle est obligatoire.' })
  @IsInt({ message: 'L’identifiant de la salle doit être un entier.' })
  @Min(1, { message: 'L’identifiant de la salle est invalide.' })
  roomId!: number;

  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  @IsDateString({}, { message: 'La date de début est invalide.' })
  startDate!: string;

  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  @IsDateString({}, { message: 'La date de fin est invalide.' })
  @IsEndDateAfterStartDate('startDate', {
    message: 'La date de fin doit être après la date de début.',
  })
  endDate!: string;
}
