import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createRoomDto: CreateRoomDto, images?: Express.Multer.File[]) {
    const room = await this.prisma.room.create({
      data: {
        ...createRoomDto,
      },
    });

    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map((image) => this.cloudinaryService.uploadImage(image)),
      );

      await this.prisma.roomImage.createMany({
        data: uploadedImages.map((url) => ({
          url,
          roomId: room.id,
        })),
      });
    }

    return this.prisma.room.findUnique({
      where: {
        id: room.id,
      },
      include: {
        images: true,
      },
    });
  }

  async findAll() {
    return this.prisma.room.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        images: true,
      },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`La salle avec l'id ${id} n'existe pas.`);
    }

    return room;
  }

  async update(
    id: number,
    updateRoomDto: UpdateRoomDto,
    images?: Express.Multer.File[],
  ) {
    const existingRoom = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!existingRoom) {
      throw new NotFoundException(`La salle avec l'id ${id} n'existe pas.`);
    }

    await this.prisma.room.update({
      where: {
        id,
      },
      data: {
        ...updateRoomDto,
      },
    });

    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map((image) => this.cloudinaryService.uploadImage(image)),
      );

      await this.prisma.roomImage.createMany({
        data: uploadedImages.map((url) => ({
          url,
          roomId: id,
        })),
      });
    }

    return this.prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });
  }

  async remove(id: number) {
    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new NotFoundException(`La salle avec l'id ${id} n'existe pas.`);
    }

    return this.prisma.room.delete({
      where: {
        id,
      },
    });
  }
  async removeImage(roomId: number, imageId: number) {
    const image = await this.prisma.roomImage.findFirst({
      where: {
        id: imageId,
        roomId,
      },
    });

    if (!image) {
      throw new NotFoundException(
        `La photo ${imageId} n'existe pas pour la salle ${roomId}.`,
      );
    }

    await this.cloudinaryService.deleteImage(image.url);

    await this.prisma.roomImage.delete({
      where: {
        id: imageId,
      },
    });

    return {
      message: 'Photo supprimée avec succès.',
      imageId,
    };
  }
}
