import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard)
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get()
  obtenerEstadisticas(@Request() req) {
    return this.estadisticasService.obtenerEstadisticas(req.user.id);
  }
}
