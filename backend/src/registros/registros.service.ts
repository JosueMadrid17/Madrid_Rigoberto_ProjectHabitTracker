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

    const inicioDelDia = new Date();
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date();
    finDelDia.setHours(23, 59, 59, 999);

    const registroExistente = await this.prisma.registro.findFirst({
      where: {
        habitoId: habitoId,
        usuarioId: usuarioId,
        fecha: {
          gte: inicioDelDia,
          lte: finDelDia,
        },
      },
    });

    const valorNuevo = data.valor ?? 0;

    if (registroExistente) {
      const valorAcumulado = registroExistente.valor + valorNuevo;

      const completado =
        habito.meta !== null &&
        habito.meta !== undefined &&
        valorAcumulado >= habito.meta;

      return this.prisma.registro.update({
        where: {
          id: registroExistente.id,
        },
        data: {
          valor: valorAcumulado,
          completado: completado,
        },
      });
    }

    const completado =
      habito.meta !== null &&
      habito.meta !== undefined &&
      valorNuevo >= habito.meta;

    return this.prisma.registro.create({
      data: {
        valor: valorNuevo,
        completado: completado,
        habitoId: habitoId,
        usuarioId: usuarioId,
      },
    });
  }

  async obtenerRegistros(usuarioId: string) {
    return this.prisma.registro.findMany({
      where: {
        usuarioId: usuarioId,
      },
      include: {
        habito: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async obtenerRegistro(id: string, usuarioId: string) {
    const registro = await this.prisma.registro.findFirst({
      where: {
        id: id,
        usuarioId: usuarioId,
      },
      include: {
        habito: true,
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
        usuarioId: usuarioId,
      },
      include: {
        habito: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const valor = data.valor !== undefined ? data.valor : registro.valor;

    const completado =
      registro.habito.meta !== null &&
      registro.habito.meta !== undefined &&
      valor >= registro.habito.meta;

    return this.prisma.registro.update({
      where: {
        id: id,
      },
      data: {
        valor: valor,
        completado:
          data.valor !== undefined
            ? completado
            : (data.completado ?? registro.completado),
      },
    });
  }

  async eliminarRegistro(id: string, usuarioId: string) {
    const registro = await this.prisma.registro.findFirst({
      where: {
        id: id,
        usuarioId: usuarioId,
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
