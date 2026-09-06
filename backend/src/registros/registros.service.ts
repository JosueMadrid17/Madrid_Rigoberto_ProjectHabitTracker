import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRegistroDto } from './dto/crear-registro.dto';
import { ActualizarRegistroDto } from './dto/actualizar-registro.dto';

@Injectable()
export class RegistrosService {
  constructor(private prisma: PrismaService) {}

  async crearRegistro(
    habitoId: string,
    data: CrearRegistroDto,
    usuarioId: string,
  ) {
    const habito = await this.prisma.habito.findFirst({
      where: {
        id: habitoId,
        usuarioId: usuarioId,
      },
    });

    if (!habito) {
      throw new NotFoundException('Hábito no encontrado');
    }

    return this.prisma.registro.create({
      data: {
        completado: data.completado ?? false,
        habitoId: habitoId,
        usuarioId: usuarioId,
      },
    });
  }

  async obtenerRegistros(usuarioId: string) {
    return this.prisma.registro.findMany({
      where: {
        habito: {
          usuarioId: usuarioId,
        },
      },
    });
  }

  async obtenerRegistro(id: string, usuarioId: string) {
    const registro = await this.prisma.registro.findFirst({
      where: {
        id: id,
        habito: {
          usuarioId: usuarioId,
        },
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    return registro;
  }

  async actualizarRegistro(
    id: string,
    data: ActualizarRegistroDto,
    usuarioId: string,
  ) {
    const registro = await this.prisma.registro.findFirst({
      where: {
        id: id,
        habito: {
          usuarioId: usuarioId,
        },
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.prisma.registro.update({
      where: {
        id: id,
      },
      data: {
        ...(data.completado !== undefined && {
          completado: data.completado,
        }),
      },
    });
  }

  async eliminarRegistro(id: string, usuarioId: string) {
    const registro = await this.prisma.registro.findFirst({
      where: {
        id: id,
        habito: {
          usuarioId: usuarioId,
        },
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    await this.prisma.registro.delete({
      where: {
        id: id,
      },
    });

    return {
      mensaje: 'Registro eliminado correctamente',
    };
  }
}
