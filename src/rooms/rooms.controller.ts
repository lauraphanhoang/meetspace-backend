import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

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

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer une salle' })
  @ApiCreatedResponse({
    description: 'Salle créée avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les données sont invalides.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les salles' })
  @ApiOkResponse({
    description: 'Liste des salles récupérée avec succès.',
  })
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer une salle par son identifiant',
  })
  @ApiOkResponse({
    description: 'Salle trouvée.',
  })
  @ApiNotFoundResponse({
    description: 'Salle introuvable.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Modifier une salle' })
  @ApiOkResponse({
    description: 'Salle modifiée avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les données sont invalides.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  @ApiNotFoundResponse({
    description: 'Salle introuvable.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Supprimer une salle' })
  @ApiOkResponse({
    description: 'Salle supprimée avec succès.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  @ApiNotFoundResponse({
    description: 'Salle introuvable.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
