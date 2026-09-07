"use client";
import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { loginSchema } from "@/lib/validations/login.schema";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<{
    correo?: string;
    password?: string;
  }>({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrores({});
    setErrorGeneral("");

    const resultado = loginSchema.safeParse({
      correo,
      password,
    });

    if (!resultado.success) {
      const erroresCampos = resultado.error.flatten().fieldErrors;

      setErrores({
        correo: erroresCampos.correo?.[0],
        password: erroresCampos.password?.[0],
      });
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resultado.data),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorGeneral(
          typeof datos.message === "string"
            ? datos.message
            : "Correo o contraseña incorrectos",
        );
        return;
      }

      localStorage.setItem("access_token", datos.access_token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));
      console.log("Login correcto:", datos);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      setErrorGeneral(
        "No se pudo conectar con el servidor. Intenta nuevamente.",
      );
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
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 470,
          p: {
            xs: 3,
            sm: 5,
          },
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Image
              src="/LogoProyecto.png"
              alt="Habit Tracker"
              width={190}
              height={47}
              priority
            />
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              color="text.primary"
              sx={{
                fontSize: {
                  xs: "28px",
                  sm: "32px",
                },
              }}
            >
              Iniciar Sesión
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <FormControl fullWidth>
                <Typography
                  component="label"
                  htmlFor="correo"
                  variant="body2"
                  sx={{
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
                  onChange={(event) => {
                    setCorreo(event.target.value);
                    if (errores.correo) {
                      setErrores((prev) => ({
                        ...prev,
                        correo: undefined,
                      }));
                    }
                  }}
                  error={Boolean(errores.correo)}
                  helperText={errores.correo}
                  placeholder="Ingresa tu correo"
                  autoComplete="email"
                />
              </FormControl>

              <FormControl fullWidth>
                <Typography
                  component="label"
                  htmlFor="password"
                  variant="body2"
                  sx={{
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
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (errores.password) {
                      setErrores((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  error={Boolean(errores.password)}
                  helperText={errores.password}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            edge="end"
                            onClick={() => setMostrarPassword((prev) => !prev)}
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
              </FormControl>

              {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  mt: 1,
                  py: 1.4,
                  fontSize: "16px",
                }}
              >
                Iniciar sesión
              </Button>

              <Box sx={{ textAlign: "center", pt: 0.5 }}>
                <Typography component="span" color="text.secondary">
                  ¿No tienes una cuenta?{" "}
                </Typography>

                <Link
                  component={NextLink}
                  href="/registro"
                  color="primary"
                  underline="none"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Regístrate
                </Link>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
