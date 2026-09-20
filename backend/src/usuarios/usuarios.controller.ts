import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  obtenerUsuarios() {
    return this.usuariosService.obtenerUsuarios();
  }

  @Post()
  crearUsuario(@Body() data: CrearUsuarioDto) {
    return this.usuariosService.crearUsuario(data);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  obtenerPerfil(@Request() req) {
    return this.usuariosService.obtenerPerfil(req.user.id);
  }
}
