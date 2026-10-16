/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockPrismaService = {
    room: {
      findUnique: jest.fn(),
    },
    reservation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  // ==========================================
  // CREATE
  // ==========================================

  describe('create', () => {
    const userId = 1;
    const roomId = 2;

    const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    startDate.setSeconds(0, 0);

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const dto = {
      roomId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    it('should create a reservation when the slot is available', async () => {
      const expectedReservation = {
        id: 10,
        userId,
        roomId,
        startDate,
        endDate,
      };

      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.reservation.create.mockResolvedValue(
        expectedReservation,
      );

      const result = await service.create(userId, dto);

      expect(result).toEqual(expectedReservation);
      expect(mockPrismaService.reservation.create).toHaveBeenCalledWith({
        data: {
          userId,
          roomId,
          startDate,
          endDate,
        },
      });
    });

    it('should reject a reservation starting in the past', async () => {
      const pastDto = {
        ...dto,
        startDate: new Date(Date.now() - 60_000).toISOString(),
      };

      await expect(service.create(userId, pastDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockPrismaService.room.findUnique).not.toHaveBeenCalled();
    });

    it('should reject an end date before the start date', async () => {
      const invalidDto = {
        ...dto,
        endDate: new Date(startDate.getTime() - 60_000).toISOString(),
      };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject a reservation when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.reservation.findFirst).not.toHaveBeenCalled();
    });

    it('should reject a reservation when the slot is already booked', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: 20,
        roomId,
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockPrismaService.reservation.create).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // UPDATE
  // ==========================================

  describe('update', () => {
    const userId = 1;
    const reservationId = 10;
    const roomId = 2;

    const startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    startDate.setSeconds(0, 0);

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const existingReservation = {
      id: reservationId,
      userId,
      roomId,
      startDate,
      endDate,
    };

    const dto = {
      startDate: new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(),
      endDate: new Date(endDate.getTime() + 60 * 60 * 1000).toISOString(),
    };

    it('should update a reservation when the new slot is available', async () => {
      const expectedReservation = {
        ...existingReservation,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.reservation.update.mockResolvedValue(
        expectedReservation,
      );

      const result = await service.update(reservationId, userId, dto);

      expect(result).toEqual(expectedReservation);
      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: {
          roomId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
        },
      });
    });

    it('should reject updating a reservation that does not exist', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(service.update(reservationId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should reject updating another user’s reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue({
        ...existingReservation,
        userId: 99,
      });

      await expect(service.update(reservationId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should reject updating a reservation when the new slot conflicts', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: 20,
        roomId,
      });

      await expect(service.update(reservationId, userId, dto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    // ==========================================
    // FIND ONE
    // ==========================================

    describe('findOne', () => {
      const userId = 1;
      const reservationId = 10;

      const reservation = {
        id: reservationId,
        userId,
        roomId: 2,
        startDate: new Date('2027-01-10T09:00:00.000Z'),
        endDate: new Date('2027-01-10T10:00:00.000Z'),
        room: {
          id: 2,
          name: 'Salle A',
          images: [],
        },
      };

      it('should return a reservation belonging to the user', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue(reservation);

        const result = await service.findOne(reservationId, userId);

        expect(result).toEqual(reservation);
        expect(mockPrismaService.reservation.findUnique).toHaveBeenCalledWith({
          where: { id: reservationId },
          include: { room: { include: { images: true } } },
        });
      });

      it('should throw NotFoundException when the reservation does not exist', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue(null);

        await expect(service.findOne(reservationId, userId)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should prevent a user from accessing another user’s reservation', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue({
          ...reservation,
          userId: 99,
        });

        await expect(service.findOne(reservationId, userId)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    // ==========================================
    // REMOVE
    // ==========================================

    describe('remove', () => {
      const userId = 1;
      const reservationId = 10;

      const reservation = {
        id: reservationId,
        userId,
        roomId: 2,
        startDate: new Date('2027-01-10T09:00:00.000Z'),
        endDate: new Date('2027-01-10T10:00:00.000Z'),
        room: {
          id: 2,
          name: 'Salle A',
          images: [],
        },
      };

      it('should delete a reservation belonging to the user', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue(reservation);
        mockPrismaService.reservation.delete.mockResolvedValue(reservation);

        const result = await service.remove(reservationId, userId);

        expect(result).toEqual(reservation);
        expect(mockPrismaService.reservation.delete).toHaveBeenCalledWith({
          where: { id: reservationId },
        });
      });

      it('should not delete a reservation that does not exist', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue(null);

        await expect(service.remove(reservationId, userId)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockPrismaService.reservation.delete).not.toHaveBeenCalled();
      });

      it('should prevent a user from deleting another user’s reservation', async () => {
        mockPrismaService.reservation.findUnique.mockResolvedValue({
          ...reservation,
          userId: 99,
        });

        await expect(service.remove(reservationId, userId)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockPrismaService.reservation.delete).not.toHaveBeenCalled();
      });
    });
  });

  // ==========================================
  // CHECK AVAILABILITY
  // ==========================================

  describe('checkAvailability', () => {
    const roomId = 2;
    const startDate = '2027-01-10T09:00:00.000Z';
    const endDate = '2027-01-10T10:00:00.000Z';

    it('should return available when no reservation conflicts', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);

      const result = await service.checkAvailability(
        roomId,
        startDate,
        endDate,
      );

      expect(result).toEqual({ available: true });
    });

    it('should return unavailable when a reservation conflicts', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: 20,
        roomId,
      });

      const result = await service.checkAvailability(
        roomId,
        startDate,
        endDate,
      );

      expect(result).toEqual({ available: false });
    });

    it('should reject when the end date is before the start date', async () => {
      await expect(
        service.checkAvailability(roomId, endDate, startDate),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.room.findUnique).not.toHaveBeenCalled();
    });

    it('should reject when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(
        service.checkAvailability(roomId, startDate, endDate),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.reservation.findFirst).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // GET ROOM AVAILABILITY
  // ==========================================

  describe('getRoomAvailability', () => {
    const roomId = 2;
    const date = '2027-01-10';

    it('should return reservations for the requested room and date', async () => {
      const expectedReservations = [
        {
          startDate: new Date('2027-01-10T09:00:00.000Z'),
          endDate: new Date('2027-01-10T10:00:00.000Z'),
        },
      ];

      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findMany.mockResolvedValue(
        expectedReservations,
      );

      const result = await service.getRoomAvailability(roomId, date);

      expect(result).toEqual(expectedReservations);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalledWith({
        where: {
          roomId,
          startDate: { lt: new Date(`${date}T23:59:59`) },
          endDate: { gt: new Date(`${date}T00:00:00`) },
        },
        select: { startDate: true, endDate: true },
        orderBy: { startDate: 'asc' },
      });
    });

    it('should reject when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.getRoomAvailability(roomId, date)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.reservation.findMany).not.toHaveBeenCalled();
    });

    it('should return an empty array when there are no reservations', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      const result = await service.getRoomAvailability(roomId, date);

      expect(result).toEqual([]);
    });
  });
  describe('findMyReservations', () => {
    it('should return the user reservations with rooms and images, ordered by start date descending', async () => {
      const userId = 1;
      const expectedReservations = [
        {
          id: 10,
          userId,
          roomId: 2,
          startDate: new Date('2027-01-12T09:00:00.000Z'),
          endDate: new Date('2027-01-12T10:00:00.000Z'),
          room: {
            id: 2,
            name: 'Salle A',
            images: [],
          },
        },
      ];

      mockPrismaService.reservation.findMany.mockResolvedValue(
        expectedReservations,
      );

      const result = await service.findMyReservations(userId);

      expect(result).toEqual(expectedReservations);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          room: {
            include: {
              images: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should return an empty array when the user has no reservations', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      const result = await service.findMyReservations(1);

      expect(result).toEqual([]);
    });
  });
  describe('findAll', () => {
    it('should return all reservations with user and room details', async () => {
      const expectedReservations = [
        {
          id: 10,
          userId: 1,
          roomId: 2,
          startDate: new Date('2027-01-12T09:00:00.000Z'),
          endDate: new Date('2027-01-12T10:00:00.000Z'),
          user: {
            id: 1,
            firstname: 'Laura',
            lastname: 'Martin',
            email: 'laura@example.com',
          },
          room: {
            id: 2,
            name: 'Salle A',
            images: [],
          },
        },
      ];

      mockPrismaService.reservation.findMany.mockResolvedValue(
        expectedReservations,
      );

      const result = await service.findAll();

      expect(result).toEqual(expectedReservations);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          room: {
            include: {
              images: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should return an empty array when there are no reservations', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
  describe('findOneAdmin', () => {
    it('should return a reservation with user and room details', async () => {
      const expectedReservation = {
        id: 10,
        userId: 1,
        roomId: 2,
        startDate: new Date('2027-01-12T09:00:00.000Z'),
        endDate: new Date('2027-01-12T10:00:00.000Z'),
        user: {
          id: 1,
          firstname: 'Laura',
          lastname: 'Martin',
          email: 'laura@example.com',
        },
        room: {
          id: 2,
          name: 'Salle A',
          images: [],
        },
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        expectedReservation,
      );

      const result = await service.findOneAdmin(10);

      expect(result).toEqual(expectedReservation);
      expect(mockPrismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          room: {
            include: {
              images: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when the reservation does not exist', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(service.findOneAdmin(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('update additional cases', () => {
    const reservationId = 10;
    const userId = 1;
    const roomId = 2;

    const startDate = new Date('2027-01-12T09:00:00.000Z');
    const endDate = new Date('2027-01-12T10:00:00.000Z');

    const existingReservation = {
      id: reservationId,
      userId,
      roomId,
      startDate,
      endDate,
    };

    beforeEach(() => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        existingReservation,
      );
      mockPrismaService.room.findUnique.mockResolvedValue({ id: roomId });
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.reservation.update.mockResolvedValue(
        existingReservation,
      );
    });

    it('should reject an update when the start date is in the past', async () => {
      await expect(
        service.update(reservationId, userId, {
          startDate: '2020-01-01T09:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should reject an update when the end date is before the start date', async () => {
      await expect(
        service.update(reservationId, userId, {
          startDate: '2027-01-12T11:00:00.000Z',
          endDate: '2027-01-12T10:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should reject an update when the new room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(
        service.update(reservationId, userId, {
          roomId: 99,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should preserve existing dates when only the room changes', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({ id: 3 });

      await service.update(reservationId, userId, {
        roomId: 3,
      });

      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: {
          roomId: 3,
          startDate,
          endDate,
        },
      });
    });

    it('should preserve the existing end date when only the start date changes', async () => {
      const newStartDate = '2027-01-12T08:00:00.000Z';

      await service.update(reservationId, userId, {
        startDate: newStartDate,
      });

      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: {
          roomId,
          startDate: new Date(newStartDate),
          endDate,
        },
      });
    });
  });
});
