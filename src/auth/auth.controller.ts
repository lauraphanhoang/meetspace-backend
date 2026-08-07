import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './types/auth-user.type';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  @ApiCreatedResponse({
    description: 'Compte créé avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Les données fournies sont invalides.',
  })
  @ApiConflictResponse({
    description: 'Un utilisateur avec cette adresse e-mail existe déjà.',
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  @ApiOkResponse({
    description: 'Connexion réussie.',
  })
  @ApiUnauthorizedResponse({
    description: 'Email ou mot de passe incorrect.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer le profil de l'utilisateur connecté",
  })
  @ApiOkResponse({
    description: 'Profil récupéré avec succès.',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié.',
  })
  getProfile(@CurrentUser() user: AuthUser) {
    return user;
  }
}
