"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart as BarChartIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  Checklist as ChecklistIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  List,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
  prioridad?: string | null;
  meta?: number | null;
  unidad?: string | null;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;
};

type Registro = {
  id: string;
  fecha: string;
  completado: boolean;
  valor?: number | null;
  habitoId: string;
};

type Periodo = "semanal" | "mensual";

type DiaGrafica = {
  etiqueta: string;
  porcentaje: number;
};

const obtenerFechaLocal = (fecha = new Date()) => {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

const obtenerClaveFecha = (fecha: string) => {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha.split("T")[0];
  }

  return obtenerFechaLocal(valor);
};

const capitalizar = (texto?: string | null) => {
  if (!texto) {
    return "Sin categoría";
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

const formatearValor = (valor: number) => {
  if (Number.isInteger(valor)) {
    return String(valor);
  }

  return valor.toFixed(2).replace(/\.?0+$/, "");
};

const obtenerInicioSemana = (fecha: Date) => {
  const resultado = new Date(fecha);
  const dia = resultado.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;

  resultado.setDate(resultado.getDate() + diferencia);
  resultado.setHours(0, 0, 0, 0);

  return resultado;
};

const obtenerPorcentajeDia = (
  fecha: Date,
  habitos: Habito[],
  registros: Registro[],
) => {
  if (habitos.length === 0) {
    return 0;
  }

  const clave = obtenerFechaLocal(fecha);

  const completados = habitos.filter((habito) =>
    registros.some(
      (registro) =>
        registro.habitoId === habito.id &&
        obtenerClaveFecha(registro.fecha) === clave &&
        registro.completado,
    ),
  ).length;

  return Math.round((completados / habitos.length) * 100);
};

export default function DashboardPage() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("semanal");
  const [habitoSeleccionado, setHabitoSeleccionado] = useState<Habito | null>(
    null,
  );
  const [valorProgreso, setValorProgreso] = useState("");
  const [errorProgreso, setErrorProgreso] = useState("");
  const cargarDatos = async () => {
    try {
      const token = Session.obtenerToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [respuestaHabitos, respuestaRegistros] = await Promise.all([
        fetch(`${API_URL}/habitos`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_URL}/registros`, {
          method: "GET",
          headers,
        }),
      ]);

      if (
        respuestaHabitos.status === 401 ||
        respuestaRegistros.status === 401
      ) {
        Session.cerrarSesion();
        window.location.href = "/login";
        return;
      }

      if (!respuestaHabitos.ok) {
        throw new Error("No se pudieron obtener los hábitos");
      }

      if (!respuestaRegistros.ok) {
        throw new Error("No se pudieron obtener los registros");
      }

      const datosHabitos = await respuestaHabitos.json();
      const datosRegistros = await respuestaRegistros.json();

      setHabitos(Array.isArray(datosHabitos) ? datosHabitos : []);
      setRegistros(Array.isArray(datosRegistros) ? datosRegistros : []);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      setHabitos([]);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const hoy = useMemo(() => new Date(), []);
  const claveHoy = obtenerFechaLocal(hoy);
  const habitosActivos = useMemo(
    () => habitos.filter((habito) => habito.activo !== false),
    [habitos],
  );
  const registrosDeHoy = useMemo(
    () =>
      registros.filter(
        (registro) => obtenerClaveFecha(registro.fecha) === claveHoy,
      ),
    [registros, claveHoy],
  );

  const obtenerRegistroDeHoy = (habitoId: string) => {
    return registrosDeHoy.find((registro) => registro.habitoId === habitoId);
  };

  const habitosCompletadosHoy = useMemo(
    () =>
      habitosActivos.filter((habito) => {
        const registro = obtenerRegistroDeHoy(habito.id);
        return registro?.completado === true;
      }),
    [habitosActivos, registrosDeHoy],
  );

  const completadosHoy = habitosCompletadosHoy.length;
  const cumplimientoHoy =
    habitosActivos.length > 0
      ? Math.round((completadosHoy / habitosActivos.length) * 100)
      : 0;
  const calcularRacha = () => {
    if (habitosActivos.length === 0) {
      return 0;
    }
    let racha = 0;
    const fecha = new Date();

    while (true) {
      const porcentaje = obtenerPorcentajeDia(fecha, habitosActivos, registros);

      if (porcentaje < 100) {
        break;
      }
      racha++;
      fecha.setDate(fecha.getDate() - 1);
      if (racha >= 365) {
        break;
      }
    }
    return racha;
  };

  const rachaActual = useMemo(
    () => calcularRacha(),
    [habitosActivos, registros],
  );

  const diasGrafica = useMemo<DiaGrafica[]>(() => {
    if (periodo === "semanal") {
      const inicio = obtenerInicioSemana(new Date());
      const etiquetas = ["L", "M", "X", "J", "V", "S", "D"];
      return etiquetas.map((etiqueta, indice) => {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + indice);
        return {
          etiqueta,
          porcentaje: obtenerPorcentajeDia(fecha, habitosActivos, registros),
        };
      });
    }

    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const cantidadSemanas = Math.ceil(
      (primerDia.getDay() + ultimoDia.getDate()) / 7,
    );
    const resultado: DiaGrafica[] = [];

    for (let semana = 0; semana < cantidadSemanas; semana++) {
      const inicio = new Date(año, mes, 1 + semana * 7);
      if (inicio > ultimoDia) {
        break;
      }

      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);

      if (fin > ultimoDia) {
        fin.setTime(ultimoDia.getTime());
      }

      let total = 0;
      let cantidad = 0;

      const fecha = new Date(inicio);

      while (fecha <= fin) {
        total += obtenerPorcentajeDia(fecha, habitosActivos, registros);
        cantidad++;
        fecha.setDate(fecha.getDate() + 1);
      }

      resultado.push({
        etiqueta: `S${semana + 1}`,
        porcentaje: cantidad > 0 ? Math.round(total / cantidad) : 0,
      });
    }

    return resultado;
  }, [periodo, habitosActivos, registros, hoy]);

  const abrirProgreso = (habito: Habito) => {
    const registro = obtenerRegistroDeHoy(habito.id);
    setHabitoSeleccionado(habito);
    setValorProgreso(
      registro?.valor !== undefined && registro?.valor !== null
        ? String(registro.valor)
        : "0",
    );
    setErrorProgreso("");
  };

  const cerrarProgreso = () => {
    if (guardando) {
      return;
    }
    setHabitoSeleccionado(null);
    setValorProgreso("");
    setErrorProgreso("");
  };

  const guardarProgreso = async () => {
    if (!habitoSeleccionado) {
      return;
    }

    const valor = Number(valorProgreso);
    const meta = Number(habitoSeleccionado.meta ?? 0);

    if (!Number.isFinite(valor) || valor < 0) {
      setErrorProgreso("Ingresa una cantidad válida");
      return;
    }

    if (meta <= 0) {
      setErrorProgreso("Este hábito no tiene una meta válida");
      return;
    }

    try {
      setGuardando(true);

      const token = Session.obtenerToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const registro = obtenerRegistroDeHoy(habitoSeleccionado.id);
      const completado = valor >= meta;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let respuesta: Response;

      if (registro) {
        respuesta = await fetch(`${API_URL}/registros/${registro.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            valor,
            completado,
          }),
        });
      } else {
        respuesta = await fetch(
          `${API_URL}/registros/${habitoSeleccionado.id}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              valor,
              completado,
            }),
          },
        );
      }

      if (respuesta.status === 401) {
        Session.cerrarSesion();
        window.location.href = "/login";
        return;
      }

      if (!respuesta.ok) {
        throw new Error("No se pudo guardar el progreso");
      }

      await cargarDatos();
      cerrarProgreso();
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      setErrorProgreso("No se pudo guardar el progreso");
    } finally {
      setGuardando(false);
    }
  };

  const toggleCompletado = async (habito: Habito) => {
    const registro = obtenerRegistroDeHoy(habito.id);
    const meta = Number(habito.meta ?? 0);
    if (!meta) {
      return;
    }
    const nuevoValor =
      registro?.completado === true
        ? Math.min(Number(registro.valor ?? 0), Math.max(meta - 0.01, 0))
        : meta;

    setHabitoSeleccionado(habito);
    setValorProgreso(String(nuevoValor));
    setErrorProgreso("");

    try {
      setGuardando(true);

      const token = Session.obtenerToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let respuesta: Response;

      if (registro) {
        respuesta = await fetch(`${API_URL}/registros/${registro.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            valor: nuevoValor,
            completado: nuevoValor >= meta,
          }),
        });
      } else {
        respuesta = await fetch(`${API_URL}/registros/${habito.id}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            valor: meta,
            completado: true,
          }),
        });
      }

      if (respuesta.status === 401) {
        Session.cerrarSesion();
        window.location.href = "/login";
        return;
      }

      if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el hábito");
      }

      await cargarDatos();
    } catch (error) {
      console.error("Error al actualizar hábito:", error);
    } finally {
      setGuardando(false);
      setHabitoSeleccionado(null);
    }
  };

  const porcentajeSeleccionado = useMemo(() => {
    if (!habitoSeleccionado) {
      return 0;
    }

    const meta = Number(habitoSeleccionado.meta ?? 0);
    const valor = Number(valorProgreso);
    if (!meta || !Number.isFinite(valor)) {
      return 0;
    }
    return Math.min(Math.round((valor / meta) * 100), 100);
  }, [habitoSeleccionado, valorProgreso]);

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
          height: "100vh",
          overflow: "hidden",
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
            height: "calc(100vh - 96px)",
            overflow: "hidden",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
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

            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
              Aquí tienes un resumen de tu progreso.
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
              flexShrink: 0,
            }}
          >
            <Card
              sx={{
                minHeight: 118,
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
                    sx={{ fontSize: 14, mb: 0.3 }}
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
                minHeight: 118,
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
                de {habitosActivos.length} hábitos
              </Typography>
            </Card>

            <Card
              sx={{
                minHeight: 118,
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
                {cargando ? "..." : rachaActual}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                días consecutivos
              </Typography>
            </Card>

            <Card
              sx={{
                minHeight: 118,
                p: { xs: 2, md: 2.25 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
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
                    {cargando ? "..." : `${cumplimientoHoy}%`}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    de hoy
                  </Typography>
                </Box>

                {!cargando && (
                  <CircularProgress
                    variant="determinate"
                    value={cumplimientoHoy}
                    size={52}
                    thickness={5}
                    sx={{
                      color: "primary.main",
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
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
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <Card
              sx={{
                height: "100%",
                minHeight: 0,
                p: { xs: 2, md: 2.25 },
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
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

                <ToggleButtonGroup
                  exclusive
                  value={periodo}
                  onChange={(_, nuevoPeriodo) => {
                    if (nuevoPeriodo) {
                      setPeriodo(nuevoPeriodo);
                    }
                  }}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      px: 1.5,
                    },
                  }}
                >
                  <ToggleButton value="semanal">Semanal</ToggleButton>

                  <ToggleButton value="mensual">Mensual</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Divider />

              <Box
                sx={{
                  height: 275,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: { xs: 1, sm: 2 },
                  pt: 3,
                  pb: 1,
                }}
              >
                {diasGrafica.map((dia) => (
                  <Box
                    key={dia.etiqueta}
                    sx={{
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.75,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {dia.porcentaje}%
                    </Typography>

                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 42,
                        height: 205,
                        borderRadius: "6px 6px 2px 2px",
                        bgcolor: "rgba(22, 163, 74, 0.08)",
                        display: "flex",
                        alignItems: "flex-end",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: `${dia.porcentaje}%`,
                          minHeight: dia.porcentaje > 0 ? 4 : 0,
                          bgcolor: "primary.main",
                          borderRadius: "6px 6px 2px 2px",
                          transition: "height 0.3s ease",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {dia.etiqueta}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {!cargando && habitosActivos.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    fontSize: 13,
                    mt: -2,
                  }}
                >
                  Crea un hábito para comenzar a ver tu progreso.
                </Typography>
              )}
            </Card>

            <Card
              sx={{
                height: "100%",
                minHeight: 0,
                p: { xs: 2, md: 2.25 },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxSizing: "border-box",
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
                  overflowX: "hidden",
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
                {cargando ? (
                  <Box
                    sx={{
                      minHeight: 220,
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
                      minHeight: 220,
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
                  <List
                    disablePadding
                    sx={{
                      pr: 0.5,
                    }}
                  >
                    {habitosActivos.map((habito, index) => {
                      const registro = obtenerRegistroDeHoy(habito.id);
                      const meta = Number(habito.meta ?? 0);
                      const valor = Number(registro?.valor ?? 0);
                      const porcentajeHabito =
                        meta > 0
                          ? Math.min(Math.round((valor / meta) * 100), 100)
                          : 0;
                      const completado = registro?.completado === true;

                      return (
                        <Box key={habito.id}>
                          <Box
                            sx={{
                              py: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => toggleCompletado(habito)}
                                disabled={guardando}
                                aria-label={
                                  completado
                                    ? "Marcar como pendiente"
                                    : "Marcar como completado"
                                }
                                sx={{
                                  color: completado
                                    ? "primary.main"
                                    : "text.secondary",
                                  p: 0.5,
                                }}
                              >
                                {completado ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <CheckCircleOutlineIcon />
                                )}
                              </IconButton>

                              <Box
                                sx={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
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
                                  {capitalizar(habito.categoria)}
                                </Typography>
                              </Box>

                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={
                                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                                }
                                onClick={() => abrirProgreso(habito)}
                                sx={{
                                  minWidth: 0,
                                  textTransform: "none",
                                  fontSize: 11,
                                  px: 1,
                                  flexShrink: 0,
                                }}
                              >
                                Progreso
                              </Button>
                            </Box>

                            <Box
                              sx={{
                                ml: 5,
                                mt: 0.75,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 0.4,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "text.secondary",
                                  }}
                                >
                                  {formatearValor(valor)} /{" "}
                                  {formatearValor(meta)} {habito.unidad || ""}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: completado
                                      ? "primary.main"
                                      : "text.secondary",
                                  }}
                                >
                                  {porcentajeHabito}%
                                </Typography>
                              </Box>

                              <LinearProgress
                                variant="determinate"
                                value={porcentajeHabito}
                                sx={{
                                  height: 6,
                                  borderRadius: 4,
                                  bgcolor: "#E8F5ED",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 4,
                                    bgcolor: "#22A559",
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                          {index < habitosActivos.length - 1 && <Divider />}
                        </Box>
                      );
                    })}
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
                  mt: 1,
                  height: 42,
                  flexShrink: 0,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                + Agregar hábito
              </Button>
            </Card>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={Boolean(habitoSeleccionado)}
        onClose={cerrarProgreso}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              Progreso del hábito
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: 13,
                mt: 0.25,
              }}
            >
              {habitoSeleccionado?.nombre}
            </Typography>
          </Box>

          <IconButton
            onClick={cerrarProgreso}
            disabled={guardando}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Progreso actual
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                  }}
                >
                  {porcentajeSeleccionado}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={porcentajeSeleccionado}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "#E8F5ED",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    bgcolor: "#22A559",
                  },
                }}
              />
            </Box>

            <TextField
              label={`Cantidad alcanzada${
                habitoSeleccionado?.unidad
                  ? ` (${habitoSeleccionado.unidad})`
                  : ""
              }`}
              type="number"
              value={valorProgreso}
              onChange={(event) => {
                setValorProgreso(event.target.value);
                setErrorProgreso("");
              }}
              error={Boolean(errorProgreso)}
              helperText={
                errorProgreso ||
                `Meta: ${formatearValor(
                  Number(habitoSeleccionado?.meta ?? 0),
                )} ${habitoSeleccionado?.unidad || ""}`
              }
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: "any",
                },
              }}
            />

            {habitoSeleccionado?.unidad && (
              <TextField
                select
                label="Unidad"
                value={habitoSeleccionado.unidad}
                fullWidth
                disabled
              >
                <MenuItem value={habitoSeleccionado.unidad}>
                  {habitoSeleccionado.unidad}
                </MenuItem>
              </TextField>
            )}

            {porcentajeSeleccionado >= 100 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(22, 163, 74, 0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  ¡Meta completada! El hábito se marcará como completado.
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={cerrarProgreso}
            variant="outlined"
            disabled={guardando}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            onClick={guardarProgreso}
            variant="contained"
            disabled={guardando}
            sx={{ textTransform: "none" }}
          >
            {guardando ? "Guardando..." : "Guardar progreso"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
