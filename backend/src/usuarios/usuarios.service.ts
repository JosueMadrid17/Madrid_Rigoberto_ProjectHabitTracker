import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async obtenerUsuarios() {
    return this.prisma.usuario.findMany();
  }

  async crearUsuario(data: CrearUsuarioDto) {
    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        correo: data.correo,
        password: data.password,
      },
    });
  }
}
