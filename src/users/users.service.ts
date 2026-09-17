import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,

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
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },

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
  }

  async findByIdWithReservations(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,

        reservations: {
          orderBy: {
            startDate: 'desc',
          },

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
  }

  async findByIdWithPassword(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      password?: string;
      avatarUrl?: string | null;
    },
  ) {
    return this.prisma.user.update({
      where: {
        id,
      },

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
  }

  async findAll() {
    return this.prisma.user.findMany({
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
  }
}
