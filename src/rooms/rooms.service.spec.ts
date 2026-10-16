/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateRoomDto } from './dto/create-room.dto';

describe('RoomsService', () => {
  let service: RoomsService;

  const mockPrismaService = {
    room: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    roomImage: {
      createMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  // ==========================================
  // CREATE
  // ==========================================

  describe('create', () => {
    const roomDto: CreateRoomDto = {
      name: 'Salle A',
      capacity: 10,
      location: 'Paris',
    };

    it('should create a room without images', async () => {
      const createdRoom = { id: 1, ...roomDto };
      const expectedRoom = { ...createdRoom, images: [] };

      mockPrismaService.room.create.mockResolvedValue(createdRoom);
      mockPrismaService.room.findUnique.mockResolvedValue(expectedRoom);

      const result = await service.create(roomDto);

      expect(mockPrismaService.room.create).toHaveBeenCalledWith({
        data: roomDto,
      });
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { images: true },
      });
      expect(result).toEqual(expectedRoom);
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should create a room and upload its images', async () => {
      const createdRoom = { id: 1, ...roomDto };
      const expectedRoom = {
        ...createdRoom,
        images: [
          { id: 11, url: 'https://example.com/image1.jpg', roomId: 1 },
          { id: 12, url: 'https://example.com/image2.jpg', roomId: 1 },
        ],
      };

      const images = [
        { originalname: 'image1.jpg' } as Express.Multer.File,
        { originalname: 'image2.jpg' } as Express.Multer.File,
      ];

      mockPrismaService.room.create.mockResolvedValue(createdRoom);
      mockCloudinaryService.uploadImage
        .mockResolvedValueOnce('https://example.com/image1.jpg')
        .mockResolvedValueOnce('https://example.com/image2.jpg');
      mockPrismaService.roomImage.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.room.findUnique.mockResolvedValue(expectedRoom);

      const result = await service.create(roomDto, images);

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.roomImage.createMany).toHaveBeenCalledWith({
        data: [
          { url: 'https://example.com/image1.jpg', roomId: 1 },
          { url: 'https://example.com/image2.jpg', roomId: 1 },
        ],
      });
      expect(result).toEqual(expectedRoom);
    });
  });

  // ==========================================
  // FIND ALL
  // ==========================================

  describe('findAll', () => {
    it('should return all rooms ordered by id', async () => {
      const rooms = [
        { id: 1, name: 'Salle A', images: [] },
        { id: 2, name: 'Salle B', images: [] },
      ];

      mockPrismaService.room.findMany.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(result).toEqual(rooms);
      expect(mockPrismaService.room.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        include: { images: true },
      });
    });

    it('should return an empty array when no rooms exist', async () => {
      mockPrismaService.room.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // FIND ONE
  // ==========================================

  describe('findOne', () => {
    it('should return a room with its images', async () => {
      const room = {
        id: 1,
        name: 'Salle A',
        images: [{ id: 11, url: 'https://example.com/image.jpg' }],
      };

      mockPrismaService.room.findUnique.mockResolvedValue(room);

      const result = await service.findOne(1);

      expect(result).toEqual(room);
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { images: true },
      });
    });

    it('should throw NotFoundException when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // UPDATE
  // ==========================================

  describe('update', () => {
    const roomDto: CreateRoomDto = {
      name: 'Salle B',
      capacity: 12,
      location: 'Lyon',
    };

    it('should update an existing room without adding images', async () => {
      const existingRoom = { id: 1, name: 'Salle A' };
      const updatedRoom = { id: 1, ...roomDto, images: [] };

      mockPrismaService.room.findUnique
        .mockResolvedValueOnce(existingRoom)
        .mockResolvedValueOnce(updatedRoom);
      mockPrismaService.room.update.mockResolvedValue(updatedRoom);

      const result = await service.update(1, roomDto);

      expect(mockPrismaService.room.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: roomDto,
      });
      expect(result).toEqual(updatedRoom);
    });

    it('should throw NotFoundException when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.update(999, roomDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.room.update).not.toHaveBeenCalled();
    });

    it('should upload and attach new images when updating a room', async () => {
      const existingRoom = { id: 1, name: 'Salle A' };
      const updatedRoom = { id: 1, ...roomDto, images: [] };
      const images = [{ originalname: 'new-image.jpg' } as Express.Multer.File];

      mockPrismaService.room.findUnique
        .mockResolvedValueOnce(existingRoom)
        .mockResolvedValueOnce(updatedRoom);
      mockPrismaService.room.update.mockResolvedValue(updatedRoom);
      mockCloudinaryService.uploadImage.mockResolvedValue(
        'https://example.com/new-image.jpg',
      );
      mockPrismaService.roomImage.createMany.mockResolvedValue({ count: 1 });

      const result = await service.update(1, roomDto, images);

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(images[0]);
      expect(mockPrismaService.roomImage.createMany).toHaveBeenCalledWith({
        data: [{ url: 'https://example.com/new-image.jpg', roomId: 1 }],
      });
      expect(result).toEqual(updatedRoom);
    });
  });

  // ==========================================
  // REMOVE
  // ==========================================

  describe('remove', () => {
    it('should delete an existing room', async () => {
      const room = { id: 1, name: 'Salle A' };

      mockPrismaService.room.findUnique.mockResolvedValue(room);
      mockPrismaService.room.delete.mockResolvedValue(room);

      const result = await service.remove(1);

      expect(result).toEqual(room);
      expect(mockPrismaService.room.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when the room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.room.delete).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  describe('removeImage', () => {
    it('should delete an image from Cloudinary and the database', async () => {
      const image = {
        id: 11,
        roomId: 1,
        url: 'https://example.com/image.jpg',
      };

      mockPrismaService.roomImage.findFirst.mockResolvedValue(image);
      mockCloudinaryService.deleteImage.mockResolvedValue(undefined);
      mockPrismaService.roomImage.delete.mockResolvedValue(image);

      const result = await service.removeImage(1, 11);

      expect(mockPrismaService.roomImage.findFirst).toHaveBeenCalledWith({
        where: { id: 11, roomId: 1 },
      });
      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(image.url);
      expect(mockPrismaService.roomImage.delete).toHaveBeenCalledWith({
        where: { id: 11 },
      });
      expect(result).toEqual({
        message: 'Photo supprimée avec succès.',
        imageId: 11,
      });
    });

    it('should throw NotFoundException when the image does not belong to the room or does not exist', async () => {
      mockPrismaService.roomImage.findFirst.mockResolvedValue(null);

      await expect(service.removeImage(1, 999)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(mockPrismaService.roomImage.delete).not.toHaveBeenCalled();
    });
  });
});
