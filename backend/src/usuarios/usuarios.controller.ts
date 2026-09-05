import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

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
}
