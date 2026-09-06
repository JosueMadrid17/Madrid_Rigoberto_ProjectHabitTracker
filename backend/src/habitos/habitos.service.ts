import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';

@Injectable()
export class HabitosService {
  constructor(private prisma: PrismaService) {}

  async crearHabito(data: CrearHabitoDto, usuarioId: string) {
    return this.prisma.habito.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        frecuencia: data.frecuencia,
        usuarioId: usuarioId,
      },
    });
  }

  async obtenerHabitos(usuarioId: string) {
    return this.prisma.habito.findMany({
      where: {
        usuarioId: usuarioId,
      },
    });
  }

  async obtenerHabito(id: string, usuarioId: string) {
    const habito = await this.prisma.habito.findFirst({
      where: {
        id: id,
        usuarioId: usuarioId,
      },
    });

    if (!habito) {
      throw new NotFoundException('Hábito no encontrado');
    }

    return habito;
  }

  async actualizarHabito(
    id: string,
    data: ActualizarHabitoDto,
    usuarioId: string,
  ) {
    const habito = await this.prisma.habito.findFirst({
      where: {
        id: id,
        usuarioId: usuarioId,
      },
    });

    if (!habito) {
      throw new NotFoundException('Hábito no encontrado');
    }

    return this.prisma.habito.update({
      where: {
        id: id,
      },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        frecuencia: data.frecuencia,
      },
    });
  }

  async eliminarHabito(id: string, usuarioId: string) {
    const habito = await this.prisma.habito.findFirst({
      where: {
        id: id,
        usuarioId: usuarioId,
      },
    });

    if (!habito) {
      throw new NotFoundException('Hábito no encontrado');
    }

    await this.prisma.habito.delete({
      where: {
        id: id,
      },
    });

    return {
      mensaje: 'Hábito eliminado correctamente',
    };
  }
}
