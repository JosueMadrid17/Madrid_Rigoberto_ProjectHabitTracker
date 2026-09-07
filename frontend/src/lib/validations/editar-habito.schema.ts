import { z } from "zod";

export const editarHabitoSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
    categoria: z.string().min(1, "La categoría es obligatoria"),
    frecuencia: z.string().min(1, "La frecuencia es obligatoria"),
    prioridad: z.string().min(1, "La prioridad es obligatoria"),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFinalizacion: z.string().optional(),
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(`${data.fechaInicio}T00:00:00`);

    if (fechaInicio < hoy) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaInicio"],
        message: "La fecha de inicio no puede ser anterior a hoy",
      });
    }

    if (data.fechaFinalizacion) {
      const fechaFinalizacion = new Date(`${data.fechaFinalizacion}T00:00:00`);

      if (fechaFinalizacion < hoy) {
        ctx.addIssue({
          code: "custom",
          path: ["fechaFinalizacion"],
          message: "La fecha de finalización no puede ser anterior a hoy",
        });
      }

      if (fechaFinalizacion < fechaInicio) {
        ctx.addIssue({
          code: "custom",
          path: ["fechaFinalizacion"],
          message:
            "La fecha de finalización no puede ser anterior a la fecha de inicio",
        });
      }
    }
  });

export type EditarHabitoFormData = z.infer<typeof editarHabitoSchema>;
