"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { Session } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  fechaRegistro: string;
};

function formatearFecha(fecha: string) {
  if (!fecha) return "";
  const fechaFormateada = new Date(fecha);

  if (Number.isNaN(fechaFormateada.getTime())) {
    return fecha;
  }

  return fechaFormateada.toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setErrorGeneral("");

        const token = Session.obtenerToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const respuesta = await fetch(`${API_URL}/usuarios/perfil`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json().catch(() => null);

        if (respuesta.status === 401) {
          Session.cerrarSesion();
          window.location.href = "/login";
          return;
        }

        if (!respuesta.ok) {
          throw new Error(
            datos && typeof datos.message === "string"
              ? datos.message
              : "No se pudo cargar la información del perfil.",
          );
        }

        setUsuario(datos);
      } catch (error) {
        console.error("Error al cargar perfil:", error);

        setErrorGeneral(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la información del perfil.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar active="perfil" />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppHeader />

        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: 28, md: 34 },
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Mi perfil
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: 14,
                mb: 3,
              }}
            >
              Consulta la información de tu cuenta.
            </Typography>

            {cargando ? (
              <Card
                sx={{
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress color="primary" />
              </Card>
            ) : errorGeneral ? (
              <Alert severity="error">{errorGeneral}</Alert>
            ) : usuario ? (
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                }}
              >
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      pb: 3,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        bgcolor: "rgba(22, 163, 74, 0.10)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <PersonOutlineIcon sx={{ fontSize: 38 }} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {usuario.nombre}
                      </Typography>

                      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                        Información de tu cuenta
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                      },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <PersonOutlineIcon color="primary" />

                      <Box>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: 12,
                            mb: 0.4,
                          }}
                        >
                          Nombre
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 600,
                          }}
                        >
                          {usuario.nombre}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <EmailOutlinedIcon color="primary" />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: 12,
                            mb: 0.4,
                          }}
                        >
                          Correo electrónico
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 600,
                            wordBreak: "break-word",
                          }}
                        >
                          {usuario.correo}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        gridColumn: {
                          xs: "auto",
                          md: "1 / -1",
                        },
                      }}
                    >
                      <CalendarTodayOutlinedIcon color="primary" />

                      <Box>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: 12,
                            mb: 0.4,
                          }}
                        >
                          Fecha de registro
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {formatearFecha(usuario.fechaRegistro)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Card>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
