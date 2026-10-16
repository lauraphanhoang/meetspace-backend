/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

describe('RoomsController', () => {
  let controller: RoomsController;

  const mockRoomsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    removeImage: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  // CREATE
  describe('create', () => {
    it('should create a room without images', async () => {
      const dto: CreateRoomDto = {
        name: 'Salle A',
        capacity: 10,
        location: 'Paris',
      };

      const expected = { id: 1, ...dto, images: [] };
      mockRoomsService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, []);

      expect(mockRoomsService.create).toHaveBeenCalledWith(dto, []);
      expect(result).toEqual(expected);
    });

    it('should create a room with images', async () => {
      const dto: CreateRoomDto = {
        name: 'Salle A',
        capacity: 10,
        location: 'Paris',
      };

      const images = [
        {
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
      ];

      const expected = { id: 1, ...dto, images: [] };
      mockRoomsService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, images);

      expect(mockRoomsService.create).toHaveBeenCalledWith(dto, images);
      expect(result).toEqual(expected);
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return all rooms', async () => {
      const expected = [
        { id: 1, name: 'Salle A' },
        { id: 2, name: 'Salle B' },
      ];

      mockRoomsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(mockRoomsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should return a room by ID', async () => {
      const expected = { id: 1, name: 'Salle A' };
      mockRoomsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(1);

      expect(mockRoomsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update a room without new images', async () => {
      const dto: UpdateRoomDto = {
        name: 'Salle A rénovée',
        capacity: 12,
      };

      const expected = {
        id: 1,
        name: 'Salle A rénovée',
        capacity: 12,
      };

      mockRoomsService.update.mockResolvedValue(expected);

      const result = await controller.update(1, dto);

      expect(mockRoomsService.update).toHaveBeenCalledWith(1, dto, undefined);
      expect(result).toEqual(expected);
    });

    it('should update a room with new images', async () => {
      const dto: UpdateRoomDto = {
        name: 'Salle A rénovée',
      };

      const images = [
        {
          originalname: 'nouvelle-photo.jpg',
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
      ];

      const expected = { id: 1, name: 'Salle A rénovée' };
      mockRoomsService.update.mockResolvedValue(expected);

      const result = await controller.update(1, dto, images);

      expect(mockRoomsService.update).toHaveBeenCalledWith(1, dto, images);
      expect(result).toEqual(expected);
    });
  });

  // REMOVE IMAGE
  describe('removeImage', () => {
    it('should remove an image from a room', async () => {
      const expected = {
        message: 'Photo supprimée avec succès.',
        imageId: 11,
      };

      mockRoomsService.removeImage.mockResolvedValue(expected);

      const result = await controller.removeImage(1, 11);

      expect(mockRoomsService.removeImage).toHaveBeenCalledWith(1, 11);
      expect(result).toEqual(expected);
    });
  });

  // REMOVE
  describe('remove', () => {
    it('should remove a room by ID', async () => {
      const expected = { id: 1, name: 'Salle A' };
      mockRoomsService.remove.mockResolvedValue(expected);

      const result = await controller.remove(1);

      expect(mockRoomsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });
});
