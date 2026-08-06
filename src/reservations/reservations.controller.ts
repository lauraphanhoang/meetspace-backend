import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(req.user.id, createReservationDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyReservations(@Req() req: any) {
    return this.reservationsService.findMyReservations(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservationsService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservationsService.remove(id, req.user.id);
  }
}
