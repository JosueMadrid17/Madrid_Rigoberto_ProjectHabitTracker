import { z } from "zod";

export const registroSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    correo: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo válido"),

    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),

    confirmarPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type RegistroFormData = z.infer<typeof registroSchema>;
