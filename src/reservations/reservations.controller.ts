import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { Role } from '@prisma/client';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiCreatedResponse({
    description: 'Réservation créée avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les données sont invalides.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(user.id, createReservationDto);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lister mes réservations' })
  @ApiOkResponse({
    description: 'Liste des réservations récupérée.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  findMyReservations(@CurrentUser() user: AuthUser) {
    return this.reservationsService.findMyReservations(user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister toutes les réservations (ADMIN)' })
  @ApiOkResponse({
    description: 'Liste des réservations récupérée.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  findAll() {
    return this.reservationsService.findAll();
  }
  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOneAdmin(id);
  }

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier la disponibilité d’une salle' })
  @ApiOkResponse({
    description: 'Disponibilité de la salle vérifiée.',
  })
  @ApiBadRequestResponse({
    description: 'Les dates sont invalides.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiNotFoundResponse({
    description: 'Salle introuvable.',
  })
  checkAvailability(
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reservationsService.checkAvailability(
      roomId,
      startDate,
      endDate,
    );
  }

  @Get('availability/day')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les réservations d’une salle pour une journée',
  })
  @ApiOkResponse({
    description: 'Réservations de la salle récupérées.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiNotFoundResponse({
    description: 'Salle introuvable.',
  })
  getRoomAvailability(
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getRoomAvailability(roomId, date);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Récupérer une réservation par son identifiant',
  })
  @ApiOkResponse({
    description: 'Réservation trouvée.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiNotFoundResponse({
    description: 'Réservation introuvable.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modifier une réservation' })
  @ApiOkResponse({
    description: 'Réservation modifiée avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les données sont invalides.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiNotFoundResponse({
    description: 'Réservation introuvable.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, user.id, updateReservationDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Supprimer une réservation',
  })
  @ApiOkResponse({
    description: 'Réservation supprimée avec succès.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiNotFoundResponse({
    description: 'Réservation introuvable.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.reservationsService.remove(id, user.id);
  }
}
