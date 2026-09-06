import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { CrearRegistroDto } from './dto/crear-registro.dto';
import { ActualizarRegistroDto } from './dto/actualizar-registro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('registros')
@UseGuards(JwtAuthGuard)
export class RegistrosController {
  constructor(private registrosService: RegistrosService) {}

  @Post(':habitoId')
  crearRegistro(
    @Param('habitoId') habitoId: string,
    @Body() data: CrearRegistroDto,
    @Request() req,
  ) {
    return this.registrosService.crearRegistro(habitoId, data, req.user.id);
  }

  @Get()
  obtenerRegistros(@Request() req) {
    return this.registrosService.obtenerRegistros(req.user.id);
  }

  @Get(':id')
  obtenerRegistro(@Param('id') id: string, @Request() req) {
    return this.registrosService.obtenerRegistro(id, req.user.id);
  }

  @Patch(':id')
  actualizarRegistro(
    @Param('id') id: string,
    @Body() data: ActualizarRegistroDto,
    @Request() req,
  ) {
    return this.registrosService.actualizarRegistro(id, data, req.user.id);
  }

  @Delete(':id')
  eliminarRegistro(@Param('id') id: string, @Request() req) {
    return this.registrosService.eliminarRegistro(id, req.user.id);
  }
}
