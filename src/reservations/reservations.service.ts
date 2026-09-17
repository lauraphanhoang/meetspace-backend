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

    if (startDate < new Date()) {
      throw new BadRequestException(
        'Une réservation ne peut pas commencer dans le passé.',
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début.',
      );
    }

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

  async checkAvailability(roomId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début.',
      );
    }

    // Vérifier que la salle existe
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundException("Cette salle n'existe pas.");
    }

    // Chercher une réservation qui chevauche le créneau demandé
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        AND: [
          {
            startDate: {
              lt: end,
            },
          },
          {
            endDate: {
              gt: start,
            },
          },
        ],
      },
    });

    return {
      available: !existingReservation,
    };
  }

  async getRoomAvailability(roomId: number, date: string) {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundException("Cette salle n'existe pas.");
    }

    const reservations = await this.prisma.reservation.findMany({
      where: {
        roomId,
        startDate: {
          lt: endOfDay,
        },
        endDate: {
          gt: startOfDay,
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return reservations;
  }

  async findMyReservations(userId: number) {
    return this.prisma.reservation.findMany({
      where: {
        userId,
      },
      include: {
        room: {
          include: {
            images: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
  async findOne(id: number, userId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        id,
      },
      include: {
        room: {
          include: {
            images: true,
          },
        },
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

    if (startDate < new Date()) {
      throw new BadRequestException(
        'Une réservation ne peut pas commencer dans le passé.',
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début.',
      );
    }

    const roomId = updateReservationDto.roomId ?? reservation.roomId;
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundException("Cette salle n'existe pas.");
    }

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

  async findAll() {
    return this.prisma.reservation.findMany({
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
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOneAdmin(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        id,
      },
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

    if (!reservation) {
      throw new NotFoundException("Cette réservation n'existe pas.");
    }

    return reservation;
  }
}
