"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart as BarChartIcon,
  CheckCircleOutlined,
  Checklist,
  DoneAll,
  EventNote,
  Percent,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  LinearProgress,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { Session } from "@/lib/session";

const API_URL = "http://localhost:3001";

type Habito = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  frecuencia?: string | null;
  activo?: boolean;
};

type Registro = {
  id: string;
  fecha: string;
  completado: boolean;
  habitoId: string;
  habito?: Habito | null;
};

type Estadisticas = {
  totalHabitos: number;
  habitosActivos: number;
  completadosHoy: number;
  cumplimientoHoy: number;
  totalRegistros: number;
  totalCompletados: number;
  cumplimientoGeneral: number;
  registros: Registro[];
};

const capitalizar = (texto?: string | null) => {
  if (!texto) {
    return "Sin categoría";
  }
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const token = Session.obtenerToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const respuesta = await fetch(`${API_URL}/estadisticas`, {
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
          throw new Error("No se pudieron obtener las estadísticas");
        }

        const datos = await respuesta.json();

        setEstadisticas(datos);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const registrosPorHabito = useMemo(() => {
    if (!estadisticas?.registros) {
      return [];
    }

    const agrupados = new Map<
      string,
      {
        habito: Habito;
        total: number;
        completados: number;
        porcentaje: number;
      }
    >();

    estadisticas.registros.forEach((registro) => {
      if (!registro.habito) {
        return;
      }

      const existente = agrupados.get(registro.habitoId);

      if (existente) {
        existente.total += 1;

        if (registro.completado) {
          existente.completados += 1;
        }

        existente.porcentaje =
          existente.total > 0
            ? Math.round((existente.completados / existente.total) * 100)
            : 0;

        return;
      }

      agrupados.set(registro.habitoId, {
        habito: registro.habito,
        total: 1,
        completados: registro.completado ? 1 : 0,
        porcentaje: registro.completado ? 100 : 0,
      });
    });

    return Array.from(agrupados.values()).sort(
      (a, b) => b.porcentaje - a.porcentaje,
    );
  }, [estadisticas]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar active="estadisticas" />

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
            height: { md: "calc(100vh - 82px)" },
            overflowY: { xs: "auto", md: "auto" },
            boxSizing: "border-box",

            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-track": {
              background: "#E8F5ED",
              borderRadius: "10px",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#22A559",
              borderRadius: "10px",
            },
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
              Estadísticas
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: 14,
              }}
            >
              Consulta el resumen de tus hábitos y registros.
            </Typography>
          </Box>

          {cargando ? (
            <Box
              sx={{
                minHeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Card
              sx={{
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography
                color="error"
                sx={{
                  fontWeight: 600,
                }}
              >
                {error}
              </Typography>
            </Card>
          ) : estadisticas ? (
            <>
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
                    minHeight: 130,
                    p: { xs: 2, md: 2.25 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        bgcolor: "rgba(22, 163, 74, 0.10)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Checklist />
                    </Box>

                    <Box>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        Total de hábitos
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 30,
                          fontWeight: 700,
                          lineHeight: 1.1,
                          mt: 0.4,
                        }}
                      >
                        {estadisticas.totalHabitos}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 12,
                          mt: 0.4,
                        }}
                      >
                        todos los hábitos
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card
                  sx={{
                    minHeight: 130,
                    p: { xs: 2, md: 2.25 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        bgcolor: "rgba(22, 163, 74, 0.10)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DoneAll />
                    </Box>

                    <Box>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        Hábitos activos
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 30,
                          fontWeight: 700,
                          lineHeight: 1.1,
                          mt: 0.4,
                        }}
                      >
                        {estadisticas.habitosActivos}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 12,
                          mt: 0.4,
                        }}
                      >
                        en seguimiento
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card
                  sx={{
                    minHeight: 130,
                    p: { xs: 2, md: 2.25 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        bgcolor: "rgba(22, 163, 74, 0.10)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleOutlined />
                    </Box>

                    <Box>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        Completados hoy
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 30,
                          fontWeight: 700,
                          lineHeight: 1.1,
                          mt: 0.4,
                        }}
                      >
                        {estadisticas.completadosHoy}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 12,
                          mt: 0.4,
                        }}
                      >
                        hábitos completados
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card
                  sx={{
                    minHeight: 130,
                    p: { xs: 2, md: 2.25 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        bgcolor: "rgba(22, 163, 74, 0.10)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Percent />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        Cumplimiento hoy
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 30,
                          fontWeight: 700,
                          lineHeight: 1.1,
                          mt: 0.4,
                        }}
                      >
                        {estadisticas.cumplimientoHoy}%
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 12,
                          mt: 0.4,
                        }}
                      >
                        de hábitos activos
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "1fr 1fr",
                  },
                  gap: { xs: 1.5, md: 2 },
                  mb: { xs: 1.5, md: 2 },
                }}
              >
                <Card
                  sx={{
                    p: { xs: 2, md: 2.5 },
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
                    <TrendingUp
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      Cumplimiento general
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 130,
                        height: 130,
                        flexShrink: 0,
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={130}
                        thickness={4}
                        sx={{
                          color: "#E8F5ED",
                          position: "absolute",
                        }}
                      />

                      <CircularProgress
                        variant="determinate"
                        value={estadisticas.cumplimientoGeneral}
                        size={130}
                        thickness={4}
                        sx={{
                          color: "primary.main",
                          position: "absolute",
                        }}
                      />

                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 28,
                            fontWeight: 700,
                          }}
                        >
                          {estadisticas.cumplimientoGeneral}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 600,
                          mb: 0.7,
                        }}
                      >
                        Registros completados
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                          mb: 1.5,
                        }}
                      >
                        {estadisticas.totalCompletados} de{" "}
                        {estadisticas.totalRegistros} registros
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={estadisticas.cumplimientoGeneral}
                        sx={{
                          width: { xs: 150, sm: 220 },
                          height: 7,
                          borderRadius: 5,
                          bgcolor: "#E8F5ED",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 5,
                            bgcolor: "#22A559",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Card>

                <Card
                  sx={{
                    p: { xs: 2, md: 2.5 },
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
                    <EventNote
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      Resumen de registros
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        Total de registros
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {estadisticas.totalRegistros}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        Registros completados
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "primary.main",
                        }}
                      >
                        {estadisticas.totalCompletados}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        Cumplimiento general
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {estadisticas.cumplimientoGeneral}%
                      </Typography>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        Cumplimiento de hoy
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {estadisticas.cumplimientoHoy}%
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>

              <Card
                sx={{
                  p: { xs: 2, md: 2.5 },
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
                  <BarChartIcon
                    sx={{
                      color: "primary.main",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Registros por hábito
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {registrosPorHabito.length === 0 ? (
                  <Box
                    sx={{
                      py: 5,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: 14,
                      }}
                    >
                      Todavía no hay registros para mostrar.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      maxHeight: 300,
                      overflowY: "auto",
                      pr: 0.5,
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#E8F5ED",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#22A559",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    {registrosPorHabito.map((item) => (
                      <Box
                        key={item.habito.id}
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 15,
                                fontWeight: 700,
                              }}
                            >
                              {item.habito.nombre}
                            </Typography>

                            <Typography
                              color="text.secondary"
                              sx={{
                                fontSize: 12,
                                mt: 0.2,
                              }}
                            >
                              {capitalizar(item.habito.categoria)}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color:
                                item.porcentaje > 0
                                  ? "primary.main"
                                  : "text.secondary",
                              flexShrink: 0,
                            }}
                          >
                            {item.porcentaje}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={item.porcentaje}
                          sx={{
                            height: 6,
                            borderRadius: 5,
                            bgcolor: "#E8F5ED",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                              bgcolor: "#22A559",
                            },
                          }}
                        />

                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: 11,
                            mt: 0.6,
                          }}
                        >
                          {item.completados} de {item.total} registros
                          completados
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
