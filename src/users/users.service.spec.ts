/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';

import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockUser = {
    id: 1,
    firstname: 'Laura',
    lastname: 'Phan-Hoang',
    email: 'laura@test.com',
    role: Role.USER,
    avatarUrl: null,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user with the expected fields', async () => {
      const dto = {
        firstname: 'Laura',
        lastname: 'Phan-Hoang',
        email: 'laura@test.com',
        password: 'hashed-password',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: dto,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('laura@test.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'laura@test.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when the email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by ID without exposing the password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithReservations', () => {
    it('should return a user with reservation history and room details', async () => {
      const userWithReservations = {
        ...mockUser,
        reservations: [
          {
            id: 10,
            startDate: new Date('2026-11-10T09:00:00.000Z'),
            endDate: new Date('2026-11-10T10:00:00.000Z'),
            createdAt: new Date('2026-10-01T10:00:00.000Z'),
            room: {
              id: 2,
              name: 'Salle B',
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithReservations);

      const result = await service.findByIdWithReservations(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          reservations: {
            orderBy: { startDate: 'desc' },
            select: {
              id: true,
              startDate: true,
              endDate: true,
              createdAt: true,
              room: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(userWithReservations);
    });

    it('should return null when the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByIdWithReservations(999);

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithPassword', () => {
    it('should find a user by ID including the password field returned by Prisma', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashed-password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);

      const result = await service.findByIdWithPassword(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(userWithPassword);
    });
  });

  describe('update', () => {
    it('should update a user and return the selected fields', async () => {
      const data = {
        firstname: 'Laura',
        lastname: 'Hoang',
      };

      const updatedUser = {
        ...mockUser,
        ...data,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, data);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should allow clearing the avatar URL', async () => {
      const data = { avatarUrl: null };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: null,
      });

      const result = await service.update(1, data);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data }),
      );
      expect(result.avatarUrl).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users with their reservation counts', async () => {
      const users = [
        {
          ...mockUser,
          _count: { reservations: 3 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              reservations: true,
            },
          },
        },
      });
      expect(result).toEqual(users);
    });

    it('should return an empty array when there are no users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
