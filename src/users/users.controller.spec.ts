/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findByIdWithReservations: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expected = [
        {
          id: 1,
          firstname: 'Laura',
          lastname: 'Phan-Hoang',
          email: 'laura@test.com',
          role: 'ADMIN',
        },
        {
          id: 2,
          firstname: 'Marie',
          lastname: 'Dupont',
          email: 'marie@test.com',
          role: 'USER',
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it('should propagate errors from the service', async () => {
      const error = new Error(
        'Erreur lors de la récupération des utilisateurs',
      );

      mockUsersService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should return a user with their reservations', async () => {
      const expected = {
        id: 1,
        firstname: 'Laura',
        lastname: 'Phan-Hoang',
        email: 'laura@test.com',
        role: 'ADMIN',
        reservations: [
          {
            id: 10,
            roomId: 2,
          },
        ],
      };

      mockUsersService.findByIdWithReservations.mockResolvedValue(expected);

      const result = await controller.findById(1);

      expect(mockUsersService.findByIdWithReservations).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Utilisateur introuvable');

      mockUsersService.findByIdWithReservations.mockRejectedValue(error);

      await expect(controller.findById(999)).rejects.toThrow(error);
    });
  });
});
