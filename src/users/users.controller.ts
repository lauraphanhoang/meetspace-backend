import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { Role } from '@prisma/client';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lister tous les utilisateurs (ADMIN)',
  })
  @ApiOkResponse({
    description: 'Liste des utilisateurs récupérée.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer un utilisateur par son identifiant (ADMIN)',
  })
  @ApiOkResponse({
    description: 'Utilisateur trouvé avec son historique de réservations.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  @ApiForbiddenResponse({
    description: 'Accès réservé aux administrateurs.',
  })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findByIdWithReservations(id);
  }
}
