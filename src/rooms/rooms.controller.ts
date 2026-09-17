import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { memoryStorage } from 'multer';

import { FilesInterceptor } from '@nestjs/platform-express';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Les fichiers doivent être des images JPEG, PNG ou WebP.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Salle A',
        },
        capacity: {
          type: 'number',
          example: 20,
        },
        location: {
          type: 'string',
          example: 'Paris',
        },
        equipment: {
          type: 'string',
          example: 'Wi-Fi, écran',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  create(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.roomsService.create(createRoomDto, images);
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
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Les fichiers doivent être des images JPEG, PNG ou WebP.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Salle A',
        },
        capacity: {
          type: 'number',
          example: 20,
        },
        location: {
          type: 'string',
          example: 'Paris',
        },
        equipment: {
          type: 'string',
          example: 'Wi-Fi, écran',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.roomsService.update(id, updateRoomDto, images);
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
