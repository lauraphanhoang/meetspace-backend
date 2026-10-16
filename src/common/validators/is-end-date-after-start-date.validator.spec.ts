/// <reference types="jest" />

import { validate } from 'class-validator';
import { IsEndDateAfterStartDate } from './is-end-date-after-start-date.validator';

class TestReservation {
  startDate!: string;

  @IsEndDateAfterStartDate('startDate')
  endDate!: string;
}

describe('IsEndDateAfterStartDate', () => {
  it('should accept an end date after the start date', async () => {
    const reservation = new TestReservation();
    reservation.startDate = '2026-10-15T09:00:00.000Z';
    reservation.endDate = '2026-10-15T10:00:00.000Z';

    const errors = await validate(reservation);

    expect(errors).toHaveLength(0);
  });

  it('should reject an end date before the start date', async () => {
    const reservation = new TestReservation();
    reservation.startDate = '2026-10-15T10:00:00.000Z';
    reservation.endDate = '2026-10-15T09:00:00.000Z';

    const errors = await validate(reservation);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('endDate');
  });

  it('should reject identical start and end dates', async () => {
    const reservation = new TestReservation();
    reservation.startDate = '2026-10-15T10:00:00.000Z';
    reservation.endDate = '2026-10-15T10:00:00.000Z';

    const errors = await validate(reservation);

    expect(errors).toHaveLength(1);
  });

  it('should return the default validation message', async () => {
    const reservation = new TestReservation();
    reservation.startDate = '2026-10-15T10:00:00.000Z';
    reservation.endDate = '2026-10-15T09:00:00.000Z';

    const errors = await validate(reservation);

    expect(errors[0].constraints).toEqual({
      isEndDateAfterStartDate: 'endDate doit être après la date de début.',
    });
  });
});
