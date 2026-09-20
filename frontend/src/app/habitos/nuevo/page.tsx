"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControlLabel,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { habitoSchema } from "@/lib/validations/habito.schema";
import { Session } from "@/lib/session";

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

function capitalizar(texto: string) {
  if (!texto) return "";

  return texto
    .trim()
    .toLowerCase()
    .replace(/^\p{L}/u, (letra) => letra.toUpperCase());
}

export default function NuevoHabitoPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [frecuencia, setFrecuencia] = useState("diario");
  const [prioridad, setPrioridad] = useState("media");
  const [fechaInicio, setFechaInicio] = useState(dayjs().format("YYYY-MM-DD"));
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);
  const fechaHoy = dayjs();
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

    const datosFormulario = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim(),
      frecuencia: frecuencia.trim(),
      prioridad: prioridad.trim(),
      fechaInicio,
      fechaFinalizacion: fechaFinalizacion || undefined,
      activo,
    };

    const resultado = habitoSchema.safeParse(datosFormulario);

    if (!resultado.success) {
      const nuevosErrores: Errores = {};

      resultado.error.issues.forEach((error) => {
        const campo = error.path[0];

        if (typeof campo === "string") {
          nuevosErrores[campo as keyof Errores] = error.message;
        }
      });

      setErrores(nuevosErrores);
      return;
    }

    const fechaInicioSeleccionada = dayjs(resultado.data.fechaInicio);
    if (fechaInicioSeleccionada.isBefore(fechaHoy, "day")) {
      setErrores({
        fechaInicio: "La fecha de inicio no puede ser anterior a hoy.",
      });
      return;
    }

    if (resultado.data.fechaFinalizacion) {
      const fechaFinal = dayjs(resultado.data.fechaFinalizacion);
      if (fechaFinal.isBefore(fechaInicioSeleccionada, "day")) {
        setErrores({
          fechaFinalizacion:
            "La fecha de finalización no puede ser anterior a la fecha de inicio.",
        });
        return;
      }
    }

    try {
      setGuardando(true);

      const token = Session.obtenerToken();

      if (!token) {
        setErrorGeneral("Tu sesión ha expirado. Inicia sesión nuevamente.");
        return;
      }

      const datosParaBackend = {
        nombre: capitalizar(resultado.data.nombre),
        descripcion: resultado.data.descripcion,
        categoria: resultado.data.categoria
          ? capitalizar(resultado.data.categoria)
          : undefined,
        frecuencia: capitalizar(resultado.data.frecuencia),
        prioridad: capitalizar(resultado.data.prioridad),
        fechaInicio: resultado.data.fechaInicio,
        fechaFinalizacion: resultado.data.fechaFinalizacion || undefined,
        activo: resultado.data.activo,
      };

      const respuesta = await fetch(`${API_URL}/habitos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosParaBackend),
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setErrorGeneral(
          datos && typeof datos.message === "string"
            ? datos.message
            : "No se pudo crear el hábito.",
        );
        return;
      }

      window.location.href = "/habitos";
    } catch (error) {
      console.error("Error al crear hábito:", error);

      setErrorGeneral(
        "No se pudo conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          bgcolor: "background.default",
        }}
      >
        <AppSidebar active="habitos" />

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
              maxWidth: 1250,
              mx: "auto",
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.5 },
            }}
          >
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: 25, md: 28 },
                  lineHeight: 1.15,
                  mb: 0.4,
                }}
              >
                Crear hábito
              </Typography>

              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                Define los detalles de tu nuevo hábito.
              </Typography>
            </Box>

            <Card
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                p: { xs: 2, md: 2.5 },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: { xs: 2, md: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      component="label"
                      htmlFor="nombre"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
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
                      placeholder="Ej. Leer 20 minutos"
                    />
                  </Box>

                  <Box>
                    <Typography
                      component="label"
                      htmlFor="descripcion"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      Descripción
                    </Typography>

                    <TextField
                      id="descripcion"
                      fullWidth
                      multiline
                      rows={3.5}
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
                      placeholder="Describe tu hábito..."
                    />
                  </Box>

                  <Box>
                    <Typography
                      component="label"
                      htmlFor="categoria"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
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
                        IconComponent={KeyboardArrowDown}
                        renderValue={(valor) =>
                          valor
                            ? capitalizar(valor)
                            : "Selecciona una categoría"
                        }
                      >
                        <MenuItem value="">Selecciona una categoría</MenuItem>
                        <MenuItem value="salud">Salud</MenuItem>
                        <MenuItem value="bienestar">Bienestar</MenuItem>
                        <MenuItem value="desarrollo">
                          Desarrollo personal
                        </MenuItem>
                        <MenuItem value="estudio">Estudio</MenuItem>
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
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      component="label"
                      htmlFor="frecuencia"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
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
                        IconComponent={KeyboardArrowDown}
                        renderValue={(valor) => capitalizar(valor)}
                      >
                        <MenuItem value="">Selecciona una frecuencia</MenuItem>
                        <MenuItem value="diario">Diario</MenuItem>
                        <MenuItem value="semanal">Semanal</MenuItem>
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
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
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
                        IconComponent={KeyboardArrowDown}
                        renderValue={(valor) => capitalizar(valor)}
                      >
                        <MenuItem value="">Selecciona una prioridad</MenuItem>
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
                      component="label"
                      htmlFor="fechaInicio"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      Fecha de inicio *
                    </Typography>

                    <DatePicker
                      value={fechaInicio ? dayjs(fechaInicio) : null}
                      onChange={cambiarFechaInicio}
                      minDate={fechaHoy}
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
                      component="label"
                      htmlFor="fechaFin"
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        mb: 0.5,
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
                      minDate={fechaInicio ? dayjs(fechaInicio) : fechaHoy}
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
                </Box>
              </Box>

              {errorGeneral && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorGeneral}
                </Alert>
              )}

              <Box
                sx={{
                  mt: 1.75,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                  gap: 2,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(event) => setActivo(event.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Hábito activo
                      </Typography>

                      <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                        El hábito estará disponible para seguimiento.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    ml: 0,
                    mr: 0,
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    width: {
                      xs: "100%",
                      sm: "auto",
                    },
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    component={Link}
                    href="/habitos"
                    variant="outlined"
                    color="primary"
                    disabled={guardando}
                    sx={{
                      minWidth: 90,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={guardando}
                    sx={{
                      minWidth: 110,
                    }}
                  >
                    {guardando ? "Creando..." : "Crear hábito"}
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
