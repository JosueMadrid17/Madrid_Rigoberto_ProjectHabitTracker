"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { registroSchema } from "@/lib/validations/registro.schema";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [errores, setErrores] = useState<{
    nombre?: string;
    correo?: string;
    password?: string;
    confirmarPassword?: string;
  }>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrores({});

    const resultado = registroSchema.safeParse({
      nombre,
      correo,
      password,
      confirmarPassword,
    });

    if (!resultado.success) {
      const nuevosErrores: {
        nombre?: string;
        correo?: string;
        password?: string;
        confirmarPassword?: string;
      } = {};

      resultado.error.issues.forEach((error) => {
        const campo = error.path[0];

        if (
          campo === "nombre" ||
          campo === "correo" ||
          campo === "password" ||
          campo === "confirmarPassword"
        ) {
          nuevosErrores[campo] = error.message;
        }
      });

      setErrores(nuevosErrores);
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: resultado.data.nombre,
          correo: resultado.data.correo,
          password: resultado.data.password,
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrores({
          correo:
            typeof datos.message === "string"
              ? datos.message
              : "No se pudo crear la cuenta.",
        });
        return;
      }

      console.log("Registro correcto:", datos);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      setErrores({
        correo: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 470,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 28, sm: 32 },
                fontWeight: 700,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              Crear Cuenta
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Regístrate para comenzar a usar Habit Tracker
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  component="label"
                  htmlFor="nombre"
                  variant="body2"
                  sx={{
                    display: "block",
                    mb: 0.8,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Nombre completo
                </Typography>

                <TextField
                  id="nombre"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  error={Boolean(errores.nombre)}
                  helperText={errores.nombre}
                  placeholder="Ingresa tu nombre"
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  htmlFor="correo"
                  variant="body2"
                  sx={{
                    display: "block",
                    mb: 0.8,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Correo electrónico
                </Typography>

                <TextField
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  error={Boolean(errores.correo)}
                  helperText={errores.correo}
                  placeholder="Ingresa tu correo"
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  htmlFor="password"
                  variant="body2"
                  sx={{
                    display: "block",
                    mb: 0.8,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Contraseña
                </Typography>

                <TextField
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={Boolean(errores.password)}
                  helperText={errores.password}
                  placeholder="Ingresa tu contraseña"
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            edge="end"
                            aria-label={
                              mostrarPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {mostrarPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  htmlFor="confirmarPassword"
                  variant="body2"
                  sx={{
                    display: "block",
                    mb: 0.8,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Confirmar contraseña
                </Typography>

                <TextField
                  id="confirmarPassword"
                  type={mostrarConfirmacion ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(event) => setConfirmarPassword(event.target.value)}
                  error={Boolean(errores.confirmarPassword)}
                  helperText={errores.confirmarPassword}
                  placeholder="Confirma tu contraseña"
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setMostrarConfirmacion(!mostrarConfirmacion)
                            }
                            edge="end"
                            aria-label={
                              mostrarConfirmacion
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {mostrarConfirmacion ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  mt: 0.5,
                  py: 1.2,
                  fontSize: "15px",
                }}
              >
                Crear Cuenta
              </Button>

              <Box
                sx={{
                  textAlign: "center",
                  pt: 0.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  ¿Ya tienes una cuenta?{" "}
                </Typography>

                <Link
                  href="/login"
                  style={{
                    color: "#16A34A",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Inicia sesión
                </Link>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
