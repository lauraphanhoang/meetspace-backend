import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createReservationDto: CreateReservationDto) {
    const startDate = new Date(createReservationDto.startDate);
    const endDate = new Date(createReservationDto.endDate);

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
}
