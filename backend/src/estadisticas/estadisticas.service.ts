import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async obtenerEstadisticas(usuarioId: string) {
    const habitos = await this.prisma.habito.findMany({
      where: {
        usuarioId: usuarioId,
      },
    });

    const registros = await this.prisma.registro.findMany({
      where: {
        usuarioId: usuarioId,
      },
      include: {
        habito: true,
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    const habitosActivos = habitos.filter((habito) => habito.activo);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    const registrosHoy = registros.filter((registro) => {
      const fechaRegistro = new Date(registro.fecha);
      fechaRegistro.setHours(0, 0, 0, 0);

      return fechaRegistro.getTime() === fechaHoy.getTime();
    });

    const completadosHoy = registrosHoy.filter((registro) => registro.completado,).length;
    const cumplimiento =
      habitosActivos.length > 0
        ? Math.round((completadosHoy / habitosActivos.length) * 100)
        : 0;
    const totalRegistros = registros.length;
    const totalCompletados = registros.filter((registro) => registro.completado,).length;
    const cumplimientoGeneral =
      totalRegistros > 0
        ? Math.round((totalCompletados / totalRegistros) * 100)
        : 0;

    return {
      totalHabitos: habitos.length,
      habitosActivos: habitosActivos.length,
      completadosHoy,
      cumplimientoHoy: cumplimiento,
      totalRegistros,
      totalCompletados,
      cumplimientoGeneral,
      registros,
    };
  }
}
