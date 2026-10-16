/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import type { AuthUser } from '../auth/types/auth-user.type';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    create: jest.fn(),
    findMyReservations: jest.fn(),
    findAll: jest.fn(),
    findOneAdmin: jest.fn(),
    checkAvailability: jest.fn(),
    getRoomAvailability: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user: AuthUser = {
    id: 1,
    email: 'laura@test.com',
    role: 'USER',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  // CREATE
  describe('create', () => {
    it('should create a reservation for the connected user', async () => {
      const dto: CreateReservationDto = {
        roomId: 1,
        startDate: '2026-11-10T09:00:00.000Z',
        endDate: '2026-11-10T10:00:00.000Z',
      };

      const expected = { id: 10, userId: user.id, ...dto };
      mockReservationsService.create.mockResolvedValue(expected);

      const result = await controller.create(user, dto);

      expect(mockReservationsService.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toEqual(expected);
    });
  });

  // FIND MY RESERVATIONS
  describe('findMyReservations', () => {
    it('should return the connected user reservations', async () => {
      const expected = [{ id: 10, userId: user.id }];
      mockReservationsService.findMyReservations.mockResolvedValue(expected);

      const result = await controller.findMyReservations(user);

      expect(mockReservationsService.findMyReservations).toHaveBeenCalledWith(
        user.id,
      );
      expect(result).toEqual(expected);
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return all reservations', async () => {
      const expected = [{ id: 10 }, { id: 11 }];
      mockReservationsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(mockReservationsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  // FIND ONE ADMIN
  describe('findOneAdmin', () => {
    it('should return a reservation for the admin view', async () => {
      const expected = { id: 10, userId: 2, roomId: 1 };
      mockReservationsService.findOneAdmin.mockResolvedValue(expected);

      const result = await controller.findOneAdmin(10);

      expect(mockReservationsService.findOneAdmin).toHaveBeenCalledWith(10);
      expect(result).toEqual(expected);
    });
  });

  // CHECK AVAILABILITY
  describe('checkAvailability', () => {
    it('should check availability using the supplied parameters', async () => {
      const expected = { available: true };
      mockReservationsService.checkAvailability.mockResolvedValue(expected);

      const result = await controller.checkAvailability(
        1,
        '2026-11-10T09:00:00.000Z',
        '2026-11-10T10:00:00.000Z',
      );

      expect(mockReservationsService.checkAvailability).toHaveBeenCalledWith(
        1,
        '2026-11-10T09:00:00.000Z',
        '2026-11-10T10:00:00.000Z',
      );
      expect(result).toEqual(expected);
    });
  });

  // ROOM AVAILABILITY FOR A DAY
  describe('getRoomAvailability', () => {
    it('should return the reservations for a room on a given day', async () => {
      const expected = [{ id: 10, roomId: 1 }];
      mockReservationsService.getRoomAvailability.mockResolvedValue(expected);

      const result = await controller.getRoomAvailability(1, '2026-11-10');

      expect(mockReservationsService.getRoomAvailability).toHaveBeenCalledWith(
        1,
        '2026-11-10',
      );
      expect(result).toEqual(expected);
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should retrieve a reservation for the connected user', async () => {
      const expected = { id: 10, userId: user.id };
      mockReservationsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(10, user);

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(10, user.id);
      expect(result).toEqual(expected);
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update a reservation for the connected user', async () => {
      const dto: UpdateReservationDto = {
        startDate: '2026-11-10T11:00:00.000Z',
        endDate: '2026-11-10T12:00:00.000Z',
      };

      const expected = { id: 10, userId: user.id, ...dto };
      mockReservationsService.update.mockResolvedValue(expected);

      const result = await controller.update(10, user, dto);

      expect(mockReservationsService.update).toHaveBeenCalledWith(
        10,
        user.id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  // REMOVE
  describe('remove', () => {
    it('should remove a reservation for the connected user', async () => {
      const expected = {
        message: 'Réservation supprimée avec succès.',
      };
      mockReservationsService.remove.mockResolvedValue(expected);

      const result = await controller.remove(10, user);

      expect(mockReservationsService.remove).toHaveBeenCalledWith(10, user.id);
      expect(result).toEqual(expected);
    });
  });
});
