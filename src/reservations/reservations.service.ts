import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createReservationDto: CreateReservationDto) {
    return this.prisma.reservation.create({
      data: {
        userId,
        roomId: createReservationDto.roomId,
        startDate: new Date(createReservationDto.startDate),
        endDate: new Date(createReservationDto.endDate),
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
