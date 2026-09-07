"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { editarHabitoSchema } from "@/lib/validations/editar-habito.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Errores = {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  frecuencia?: string;
  prioridad?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
};

type Habito = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  frecuencia?: string;
  prioridad?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  activo?: boolean;
};

function formatearValor(valor: string) {
  if (!valor) return "";

  return valor
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\p{L}/u, (letra) => letra.toUpperCase());
}

function normalizarTexto(valor: string) {
  return valor
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\p{L}/u, (letra) => letra.toUpperCase());
}

function normalizarFecha(valor?: string | null) {
  if (!valor) return "";
  const fecha = dayjs(valor);

  if (!fecha.isValid()) return "";
  return fecha.format("YYYY-MM-DD");
}

export default function EditarHabitoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const fechaHoy = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const cargarHabito = async () => {
      try {
        setCargando(true);
        setErrorGeneral("");

        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const respuesta = await fetch(`${API_URL}/habitos/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(
            typeof datos.message === "string"
              ? datos.message
              : "No se pudo cargar el hábito",
          );
        }

        const habito: Habito = datos;
        setNombre(habito.nombre || "");
        setDescripcion(habito.descripcion || "");
        setCategoria(habito.categoria ? habito.categoria.toLowerCase() : "");
        setFrecuencia(habito.frecuencia ? habito.frecuencia.toLowerCase() : "");
        setPrioridad(habito.prioridad ? habito.prioridad.toLowerCase() : "");
        setFechaInicio(normalizarFecha(habito.fechaInicio));
        setFechaFinalizacion(normalizarFecha(habito.fechaFinalizacion));
        setActivo(habito.activo !== false);
      } catch (error) {
        console.error("Error al cargar hábito:", error);
        setErrorGeneral(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el hábito.",
        );
      } finally {
        setCargando(false);
      }
    };
    if (id) {
      cargarHabito();
    }
  }, [id, router]);

  const cambiarFechaInicio = (fecha: Dayjs | null) => {
    const nuevaFecha = fecha ? fecha.format("YYYY-MM-DD") : "";
    setFechaInicio(nuevaFecha);
    setErrores((prev) => ({
      ...prev,
      fechaInicio: undefined,
      fechaFinalizacion: undefined,
    }));
    if (
      fechaFinalizacion &&
      nuevaFecha &&
      dayjs(fechaFinalizacion).isBefore(dayjs(nuevaFecha), "day")
    ) {
      setFechaFinalizacion("");
    }
  };

  const cambiarFechaFinalizacion = (fecha: Dayjs | null) => {
    const nuevaFecha = fecha ? fecha.format("YYYY-MM-DD") : "";
    setFechaFinalizacion(nuevaFecha);
    setErrores((prev) => ({
      ...prev,
      fechaFinalizacion: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrores({});
    setErrorGeneral("");
    setMensajeExito("");

    const datosFormulario = {
      nombre: normalizarTexto(nombre),
      descripcion: descripcion.trim(),
      categoria: categoria.toLowerCase().trim(),
      frecuencia: frecuencia.toLowerCase().trim(),
      prioridad: prioridad.toLowerCase().trim(),
      fechaInicio,
      fechaFinalizacion: fechaFinalizacion || undefined,
      activo,
    };

    const validacion = editarHabitoSchema.safeParse(datosFormulario);

    if (!validacion.success) {
      const nuevosErrores: Errores = {};
      validacion.error.issues.forEach((error) => {
        const campo = error.path[0];

        if (typeof campo === "string") {
          nuevosErrores[campo as keyof Errores] = error.message;
        }
      });

      setErrores(nuevosErrores);
      return;
    }

    try {
      setGuardando(true);

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const respuesta = await fetch(`${API_URL}/habitos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validacion.data),
      });

      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        throw new Error(
          datos && typeof datos.message === "string"
            ? datos.message
            : "No se pudieron guardar los cambios.",
        );
      }

      setMensajeExito("Hábito actualizado correctamente.");
      setTimeout(() => {
        router.push("/habitos");
      }, 900);
    } catch (error) {
      console.error("Error al actualizar hábito:", error);
      setErrorGeneral(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          backgroundColor: "background.default",
        }}
      >
        <AppSidebar active="habitos" />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <AppHeader />

          <Box
            sx={{
              minHeight: "calc(100vh - 90px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">Cargando hábito...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          backgroundColor: "background.default",
        }}
      >
        <AppSidebar active="habitos" />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <AppHeader />

          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
                md: 4,
              },
              py: {
                xs: 2,
                md: 3,
              },
              maxWidth: 1500,
              mx: "auto",
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 30,
                    sm: 34,
                    md: 38,
                  },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Editar hábito
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  color: "text.secondary",
                }}
              >
                Modifica los detalles de tu hábito.
              </Typography>
            </Box>

            <Card
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 3,
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                      },
                      gap: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          component="label"
                          htmlFor="nombre"
                          sx={{
                            display: "block",
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Nombre del hábito *
                        </Typography>

                        <TextField
                          id="nombre"
                          fullWidth
                          size="small"
                          value={nombre}
                          onChange={(event) => {
                            setNombre(event.target.value);
                            setErrores((prev) => ({
                              ...prev,
                              nombre: undefined,
                            }));
                          }}
                          error={Boolean(errores.nombre)}
                          helperText={errores.nombre}
                        />
                      </Box>

                      <Box>
                        <Typography
                          component="label"
                          htmlFor="descripcion"
                          sx={{
                            display: "block",
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Descripción
                        </Typography>

                        <TextField
                          id="descripcion"
                          fullWidth
                          multiline
                          rows={4}
                          value={descripcion}
                          onChange={(event) => {
                            setDescripcion(event.target.value);
                            setErrores((prev) => ({
                              ...prev,
                              descripcion: undefined,
                            }));
                          }}
                          error={Boolean(errores.descripcion)}
                          helperText={errores.descripcion}
                        />
                      </Box>

                      <Box>
                        <Typography
                          component="label"
                          htmlFor="categoria"
                          sx={{
                            display: "block",
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Categoría *
                        </Typography>

                        <FormControl
                          fullWidth
                          size="small"
                          error={Boolean(errores.categoria)}
                        >
                          <Select
                            id="categoria"
                            value={categoria}
                            onChange={(event) => {
                              setCategoria(event.target.value);
                              setErrores((prev) => ({
                                ...prev,
                                categoria: undefined,
                              }));
                            }}
                            displayEmpty
                            renderValue={(valor) =>
                              valor
                                ? formatearValor(valor)
                                : "Selecciona una categoría"
                            }
                          >
                            <MenuItem value="">
                              Selecciona una categoria
                            </MenuItem>
                            <MenuItem value="salud">Salud</MenuItem>
                            <MenuItem value="estudio">Estudio</MenuItem>
                            <MenuItem value="bienestar">Bienestar</MenuItem>
                            <MenuItem value="desarrollo personal">
                              Desarrollo personal
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {errores.categoria && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ ml: 1.5 }}
                          >
                            {errores.categoria}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          component="label"
                          htmlFor="frecuencia"
                          sx={{
                            display: "block",
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Frecuencia *
                        </Typography>

                        <FormControl
                          fullWidth
                          size="small"
                          error={Boolean(errores.frecuencia)}
                        >
                          <Select
                            id="frecuencia"
                            value={frecuencia}
                            onChange={(event) => {
                              setFrecuencia(event.target.value);

                              setErrores((prev) => ({
                                ...prev,
                                frecuencia: undefined,
                              }));
                            }}
                            renderValue={(valor) => formatearValor(valor)}
                          >
                            <MenuItem value="">
                              Selecciona una frecuencia
                            </MenuItem>
                            <MenuItem value="diario">Diario</MenuItem>
                            <MenuItem value="semanal">Semanal</MenuItem>
                            <MenuItem value="personalizada">
                              Personalizada
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {errores.frecuencia && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ ml: 1.5 }}
                          >
                            {errores.frecuencia}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography
                          component="label"
                          htmlFor="prioridad"
                          sx={{
                            display: "block",
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Prioridad *
                        </Typography>

                        <FormControl
                          fullWidth
                          size="small"
                          error={Boolean(errores.prioridad)}
                        >
                          <Select
                            id="prioridad"
                            value={prioridad}
                            onChange={(event) => {
                              setPrioridad(event.target.value);

                              setErrores((prev) => ({
                                ...prev,
                                prioridad: undefined,
                              }));
                            }}
                            displayEmpty
                            renderValue={(valor) =>
                              valor
                                ? formatearValor(valor)
                                : "Selecciona una prioridad"
                            }
                          >
                            <MenuItem value="">
                              Selecciona una prioridad
                            </MenuItem>
                            <MenuItem value="alta">Alta</MenuItem>
                            <MenuItem value="media">Media</MenuItem>
                            <MenuItem value="baja">Baja</MenuItem>
                          </Select>
                        </FormControl>

                        {errores.prioridad && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ ml: 1.5 }}
                          >
                            {errores.prioridad}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Fecha de inicio *
                        </Typography>

                        <DatePicker
                          value={fechaInicio ? dayjs(fechaInicio) : null}
                          onChange={cambiarFechaInicio}
                          minDate={dayjs(fechaHoy)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: Boolean(errores.fechaInicio),
                              helperText: errores.fechaInicio,
                              slotProps: {
                                htmlInput: {
                                  readOnly: true,
                                },
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            mb: 0.7,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Fecha de finalización{" "}
                          <Box
                            component="span"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 400,
                            }}
                          >
                            (opcional)
                          </Box>
                        </Typography>

                        <DatePicker
                          value={
                            fechaFinalizacion ? dayjs(fechaFinalizacion) : null
                          }
                          onChange={cambiarFechaFinalizacion}
                          minDate={dayjs(fechaInicio || fechaHoy)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: Boolean(errores.fechaFinalizacion),
                              helperText: errores.fechaFinalizacion,
                              slotProps: {
                                htmlInput: {
                                  readOnly: true,
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {errorGeneral && (
                    <Alert severity="error">{errorGeneral}</Alert>
                  )}

                  {mensajeExito && (
                    <Alert severity="success">{mensajeExito}</Alert>
                  )}

                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      pt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                        }}
                      >
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setActivo((prev) => !prev)}
                          aria-label={
                            activo ? "Desactivar hábito" : "Activar hábito"
                          }
                          sx={{
                            width: 42,
                            height: 24,
                            p: 0,
                            border: 0,
                            borderRadius: 12,
                            backgroundColor: activo
                              ? "primary.main"
                              : "action.disabledBackground",
                            position: "relative",
                            cursor: "pointer",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 3,
                              left: activo ? 21 : 3,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              backgroundColor: "white",
                              boxShadow: 1,
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            Hábito activo
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            El hábito estará disponible para seguimiento.
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.2,
                        }}
                      >
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() => router.push("/habitos")}
                          disabled={guardando}
                          sx={{
                            minWidth: 120,
                            py: 1.1,
                          }}
                        >
                          Cancelar
                        </Button>

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={guardando}
                          sx={{
                            minWidth: 180,
                            py: 1.1,
                          }}
                        >
                          {guardando ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
