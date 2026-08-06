import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createReservationDto: CreateReservationDto) {
    const startDate = new Date(createReservationDto.startDate);
    const endDate = new Date(createReservationDto.endDate);

    const room = await this.prisma.room.findUnique({
      where: {
        id: createReservationDto.roomId,
      },
    });

    if (!room) {
      throw new NotFoundException("Cette salle n'existe pas.");
    }

    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        roomId: createReservationDto.roomId,
        AND: [
          {
            startDate: {
              lt: endDate,
            },
          },
          {
            endDate: {
              gt: startDate,
            },
          },
        ],
      },
    });

    if (existingReservation) {
      throw new ConflictException('Cette salle est déjà réservée à ces dates.');
    }

    return this.prisma.reservation.create({
      data: {
        userId,
        roomId: createReservationDto.roomId,
        startDate,
        endDate,
      },
    });
  }
  async findMyReservations(userId: number) {
    return this.prisma.reservation.findMany({
      where: {
        userId,
      },
      include: {
        room: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }
  async findOne(id: number, userId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        id,
      },
      include: {
        room: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Cette réservation n’existe pas.');
    }

    if (reservation.userId !== userId) {
      throw new NotFoundException('Cette réservation n’existe pas.');
    }

    return reservation;
  }

  async remove(id: number, userId: number) {
    const reservation = await this.findOne(id, userId);

    return this.prisma.reservation.delete({
      where: {
        id: reservation.id,
      },
    });
  }
  async update(
    id: number,
    userId: number,
    updateReservationDto: UpdateReservationDto,
  ) {
    const reservation = await this.findOne(id, userId);

    const startDate = updateReservationDto.startDate
      ? new Date(updateReservationDto.startDate)
      : reservation.startDate;

    const endDate = updateReservationDto.endDate
      ? new Date(updateReservationDto.endDate)
      : reservation.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début.',
      );
    }

    const roomId = updateReservationDto.roomId ?? reservation.roomId;

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        id: {
          not: id,
        },
        AND: [
          {
            startDate: {
              lt: endDate,
            },
          },
          {
            endDate: {
              gt: startDate,
            },
          },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException('Cette salle est déjà réservée à ces dates.');
    }

    return this.prisma.reservation.update({
      where: {
        id,
      },
      data: {
        roomId,
        startDate,
        endDate,
      },
    });
  }
}
