"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart as BarChartIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  Checklist as ChecklistIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  List,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { Session } from "@/lib/session";

type Habito = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  frecuencia?: string | null;
  activo?: boolean;
  completado?: boolean;
};

export default function DashboardPage() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHabitos = async () => {
      try {
        const token = Session.obtenerToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const respuesta = await fetch("http://localhost:3001/habitos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (respuesta.status === 401) {
          Session.cerrarSesion();
          window.location.href = "/login";
          return;
        }

        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener los hábitos");
        }

        const datos = await respuesta.json();
        setHabitos(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error al cargar hábitos:", error);
        setHabitos([]);
      } finally {
        setCargando(false);
      }
    };
    cargarHabitos();
  }, []);

  const habitosActivos = habitos.filter((habito) => habito.activo !== false);
  const completadosHoy = habitosActivos.filter(
    (habito) => habito.completado === true,
  ).length;
  const porcentaje =
    habitosActivos.length > 0
      ? Math.round((completadosHoy / habitosActivos.length) * 100)
      : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar active="dashboard" />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          height: { md: "100vh" },
          overflow: { md: "hidden" },
        }}
      >
        <AppHeader />

        <Box
          sx={{
            width: "100%",
            maxWidth: 1250,
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, md: 2.5 },
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 28, md: 32 },
                lineHeight: 1.15,
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Dashboard
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: { xs: 1.5, md: 2 },
              mb: { xs: 1.5, md: 2 },
            }}
          >
            <Card
              sx={{
                height: { md: 118 },
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    bgcolor: "rgba(22, 163, 74, 0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <ChecklistIcon />
                </Box>

                <Box>
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 14,
                      mb: 0.3,
                    }}
                  >
                    Hábitos activos
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 29,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {cargando ? "..." : habitosActivos.length}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 12,
                      mt: 0.4,
                    }}
                  >
                    hábitos
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card
              sx={{
                height: { md: 118 },
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  mb: 1,
                }}
              >
                Completados hoy
              </Typography>

              <Typography
                sx={{
                  fontSize: 29,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {cargando ? "..." : completadosHoy}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                hábitos
              </Typography>
            </Card>

            <Card
              sx={{
                height: { md: 118 },
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  mb: 1,
                }}
              >
                Racha actual
              </Typography>

              <Typography
                sx={{
                  fontSize: 29,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                0
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                días
              </Typography>
            </Card>

            <Card
              sx={{
                height: { md: 118 },
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  mb: 1,
                }}
              >
                Cumplimiento
              </Typography>

              <Typography
                sx={{
                  fontSize: 29,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {cargando ? "..." : `${porcentaje}%`}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                del objetivo
              </Typography>
            </Card>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1.35fr 1fr",
              },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Card
              sx={{
                height: { md: 350 },
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <BarChartIcon color="primary" />

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Progreso
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  height: { md: 285 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: 14,
                  }}
                >
                  Aquí irá el progreso semanal.
                </Typography>
              </Box>
            </Card>

            <Card
              sx={{
                height: { md: 350 },
                p: { xs: 2, md: 2.25 },
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <CalendarTodayOutlinedIcon color="primary" />

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Hábitos de hoy
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  mt: 0,
                  pr: 0.5,
                }}
              >
                {cargando ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : habitosActivos.length === 0 ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 2,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      Aún no tienes hábitos registrados.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {habitosActivos.map((habito, index) => (
                      <Box key={habito.id}>
                        <Box
                          sx={{
                            minHeight: 54,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            py: 0.5,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {habito.nombre}
                            </Typography>

                            <Typography
                              color="text.secondary"
                              sx={{
                                fontSize: 12,
                                mt: 0.2,
                              }}
                            >
                              {habito.categoria || "Sin categoría"}
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            aria-label={
                              habito.completado
                                ? "Hábito completado"
                                : "Marcar hábito como completado"
                            }
                            sx={{
                              color: habito.completado
                                ? "primary.main"
                                : "text.secondary",
                              flexShrink: 0,
                            }}
                          >
                            <CheckCircleOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {index < habitosActivos.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </Box>

              <Button
                component={Link}
                href="/habitos/nuevo"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{
                  mt: 1.25,
                  height: 42,
                  flexShrink: 0,
                }}
              >
                + Agregar hábito
              </Button>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
