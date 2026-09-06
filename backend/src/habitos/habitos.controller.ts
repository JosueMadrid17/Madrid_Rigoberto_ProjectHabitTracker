import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { HabitosService } from './habitos.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('habitos')
@UseGuards(JwtAuthGuard)
export class HabitosController {
  constructor(private habitosService: HabitosService) {}

  @Post()
  crearHabito(@Body() data: CrearHabitoDto, @Request() req) {
    return this.habitosService.crearHabito(data, req.user.id);
  }

  @Get()
  obtenerHabitos(@Request() req) {
    return this.habitosService.obtenerHabitos(req.user.id);
  }

  @Get(':id')
  obtenerHabito(@Param('id') id: string, @Request() req) {
    return this.habitosService.obtenerHabito(id, req.user.id);
  }

  @Patch(':id')
  actualizarHabito(
    @Param('id') id: string,
    @Body() data: ActualizarHabitoDto,
    @Request() req,
  ) {
    return this.habitosService.actualizarHabito(id, data, req.user.id);
  }

  @Delete(':id')
  eliminarHabito(@Param('id') id: string, @Request() req) {
    return this.habitosService.eliminarHabito(id, req.user.id);
  }
}
