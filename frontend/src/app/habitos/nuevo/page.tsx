"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { Session } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};

const hoy = obtenerFechaLocal();
const categorias = ["Salud", "Estudio", "Bienestar", "Personal"];
const frecuencias = ["Diario", "Semanal", "Personalizada"];
const prioridades = ["Baja", "Media", "Alta"];
const unidades = [
  "litros",
  "ml",
  "km",
  "metros",
  "minutos",
  "horas",
  "repeticiones",
  "páginas",
  "veces",
];

export default function NuevoHabitoPage() {
  const router = useRouter();
  const fechaInicioRef = useRef<HTMLInputElement>(null);
  const fechaFinalizacionRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [frecuencia, setFrecuencia] = useState("Diario");
  const [prioridad, setPrioridad] = useState("Media");
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");
  const [meta, setMeta] = useState("");
  const [unidad, setUnidad] = useState("");
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<{
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    frecuencia?: string;
    prioridad?: string;
    fechaInicio?: string;
    meta?: string;
    unidad?: string;
  }>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);
  const validarFormulario = () => {
    const nuevosErrores: typeof errores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    }

    if (!categoria) {
      nuevosErrores.categoria = "Selecciona una categoría";
    }

    if (!frecuencia) {
      nuevosErrores.frecuencia = "Selecciona una frecuencia";
    }

    if (!prioridad) {
      nuevosErrores.prioridad = "Selecciona una prioridad";
    }

    if (!fechaInicio) {
      nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria";
    }

    if (fechaInicio < hoy) {
      nuevosErrores.fechaInicio =
        "La fecha de inicio no puede ser anterior a hoy";
    }

    if (fechaFinalizacion && fechaFinalizacion < fechaInicio) {
      nuevosErrores.fechaInicio =
        "La fecha de inicio no puede ser posterior a la fecha de finalización";
    }

    if (!meta.trim()) {
      nuevosErrores.meta = "La meta es obligatoria";
    } else {
      const metaNumero = Number(meta);

      if (!Number.isFinite(metaNumero) || metaNumero < 0) {
        nuevosErrores.meta = "Ingresa una meta válida";
      }
    }

    if (!unidad) {
      nuevosErrores.unidad = "Selecciona una unidad";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorGeneral("");

    if (!validarFormulario()) {
      return;
    }

    const token = Session.obtenerToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setGuardando(true);
      const respuesta = await fetch(`${API_URL}/habitos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          categoria,
          frecuencia,
          prioridad,
          fechaInicio,
          ...(fechaFinalizacion ? { fechaFinalizacion } : {}),
          activo,
          meta: Number(meta),
          unidad,
        }),
      });

      const datos = await respuesta.json().catch(() => null);

      if (respuesta.status === 401) {
        Session.cerrarSesion();
        router.push("/login");
        return;
      }

      if (!respuesta.ok) {
        setErrorGeneral(
          datos && typeof datos.message === "string"
            ? datos.message
            : "No se pudo crear el hábito.",
        );
        return;
      }
      router.push("/habitos");
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar active="habitos" />

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
            minHeight: 0,
            height: "calc(100vh - 80px)",
            overflow: "hidden",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, md: 2 },
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: 27, md: 30 },
                fontWeight: 700,
                mb: 0.2,
              }}
            >
              Crear hábito
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: 14,
                mb: 1.5,
              }}
            >
              Define los detalles de tu nuevo hábito.
            </Typography>

            <Card
              sx={{
                p: { xs: 1.2, sm: 1.8, md: 2.3 },
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={1.2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1.2fr 0.8fr",
                      },
                      gap: 3,
                    }}
                  >
                    <Stack spacing={1.2}>
                      <FormControl fullWidth>
                        <Typography
                          component="label"
                          htmlFor="nombre"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Nombre del hábito *
                        </Typography>

                        <TextField
                          id="nombre"
                          value={nombre}
                          onChange={(event) => {
                            setNombre(event.target.value);

                            if (errores.nombre) {
                              setErrores((prev) => ({
                                ...prev,
                                nombre: undefined,
                              }));
                            }
                          }}
                          error={Boolean(errores.nombre)}
                          helperText={errores.nombre}
                          placeholder="Ej. Leer 20 minutos"
                          fullWidth
                        />
                      </FormControl>

                      <FormControl fullWidth>
                        <Typography
                          component="label"
                          htmlFor="descripcion"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Descripción *
                        </Typography>

                        <TextField
                          id="descripcion"
                          value={descripcion}
                          onChange={(event) => {
                            setDescripcion(event.target.value);

                            if (errores.descripcion) {
                              setErrores((prev) => ({
                                ...prev,
                                descripcion: undefined,
                              }));
                            }
                          }}
                          error={Boolean(errores.descripcion)}
                          helperText={errores.descripcion}
                          placeholder="Describe tu hábito..."
                          multiline
                          minRows={2}
                          fullWidth
                        />
                      </FormControl>

                      <FormControl fullWidth error={Boolean(errores.categoria)}>
                        <Typography
                          component="label"
                          htmlFor="categoria"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Categoría *
                        </Typography>

                        <Select
                          id="categoria"
                          value={categoria}
                          displayEmpty
                          MenuProps={{
                            disableScrollLock: true,
                          }}
                          onChange={(event) => {
                            setCategoria(event.target.value);

                            if (errores.categoria) {
                              setErrores((prev) => ({
                                ...prev,
                                categoria: undefined,
                              }));
                            }
                          }}
                        >
                          <MenuItem value="" disabled>
                            Selecciona una categoría
                          </MenuItem>

                          {categorias.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>

                        {errores.categoria && (
                          <Typography
                            sx={{
                              mt: 0.5,
                              ml: 1.5,
                              fontSize: 12,
                              color: "error.main",
                            }}
                          >
                            {errores.categoria}
                          </Typography>
                        )}
                      </FormControl>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth error={Boolean(errores.meta)}>
                          <Typography
                            component="label"
                            htmlFor="meta"
                            sx={{
                              mb: 0.8,
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            Meta *
                          </Typography>

                          <TextField
                            id="meta"
                            type="number"
                            value={meta}
                            onChange={(event) => {
                              setMeta(event.target.value);

                              if (errores.meta) {
                                setErrores((prev) => ({
                                  ...prev,
                                  meta: undefined,
                                }));
                              }
                            }}
                            error={Boolean(errores.meta)}
                            helperText={
                              errores.meta || "Cantidad que quieres alcanzar"
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                                step: "any",
                              },
                            }}
                            placeholder="Ej. 5"
                            fullWidth
                          />
                        </FormControl>

                        <FormControl fullWidth error={Boolean(errores.unidad)}>
                          <Typography
                            component="label"
                            htmlFor="unidad"
                            sx={{
                              mb: 0.8,
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            Unidad *
                          </Typography>

                          <Select
                            id="unidad"
                            value={unidad}
                            displayEmpty
                            MenuProps={{
                              disableScrollLock: true,
                            }}
                            onChange={(event) => {
                              setUnidad(event.target.value);

                              if (errores.unidad) {
                                setErrores((prev) => ({
                                  ...prev,
                                  unidad: undefined,
                                }));
                              }
                            }}
                          >
                            <MenuItem value="" disabled>
                              Selecciona una unidad
                            </MenuItem>

                            {unidades.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </Select>

                          {errores.unidad && (
                            <Typography
                              sx={{
                                mt: 0.5,
                                ml: 1.5,
                                fontSize: 12,
                                color: "error.main",
                              }}
                            >
                              {errores.unidad}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                    </Stack>

                    <Stack spacing={1.2}>
                      <FormControl
                        fullWidth
                        error={Boolean(errores.frecuencia)}
                      >
                        <Typography
                          component="label"
                          htmlFor="frecuencia"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Frecuencia *
                        </Typography>

                        <Select
                          id="frecuencia"
                          value={frecuencia}
                          MenuProps={{
                            disableScrollLock: true,
                          }}
                          onChange={(event) => {
                            setFrecuencia(event.target.value);

                            if (errores.frecuencia) {
                              setErrores((prev) => ({
                                ...prev,
                                frecuencia: undefined,
                              }));
                            }
                          }}
                        >
                          {frecuencias.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth error={Boolean(errores.prioridad)}>
                        <Typography
                          component="label"
                          htmlFor="prioridad"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Prioridad *
                        </Typography>

                        <Select
                          id="prioridad"
                          value={prioridad}
                          MenuProps={{
                            disableScrollLock: true,
                          }}
                          onChange={(event) => {
                            setPrioridad(event.target.value);

                            if (errores.prioridad) {
                              setErrores((prev) => ({
                                ...prev,
                                prioridad: undefined,
                              }));
                            }
                          }}
                        >
                          {prioridades.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <Typography
                          component="label"
                          htmlFor="fechaInicio"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Fecha de inicio *
                        </Typography>

                        <TextField
                          id="fechaInicio"
                          type="date"
                          value={fechaInicio}
                          onChange={(event) => {
                            setFechaInicio(event.target.value);

                            if (errores.fechaInicio) {
                              setErrores((prev) => ({
                                ...prev,
                                fechaInicio: undefined,
                              }));
                            }
                          }}
                          error={Boolean(errores.fechaInicio)}
                          helperText={errores.fechaInicio}
                          fullWidth
                          inputRef={fechaInicioRef}
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                            htmlInput: {
                              min: hoy,
                            },
                            input: {
                              endAdornment: (
                                <CalendarMonthIcon
                                  sx={{
                                    color: "text.secondary",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    fechaInicioRef.current?.showPicker?.();
                                  }}
                                />
                              ),
                            },
                          }}
                        />
                      </FormControl>

                      <FormControl fullWidth>
                        <Typography
                          component="label"
                          htmlFor="fechaFinalizacion"
                          sx={{
                            mb: 0.8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Fecha de finalización{" "}
                          <Typography
                            component="span"
                            color="text.secondary"
                            sx={{ fontSize: 13 }}
                          >
                            (opcional)
                          </Typography>
                        </Typography>

                        <TextField
                          id="fechaFinalizacion"
                          type="date"
                          value={fechaFinalizacion}
                          onChange={(event) =>
                            setFechaFinalizacion(event.target.value)
                          }
                          fullWidth
                          inputRef={fechaFinalizacionRef}
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                            htmlInput: {
                              min: fechaInicio || hoy,
                            },
                            input: {
                              endAdornment: (
                                <CalendarMonthIcon
                                  sx={{
                                    color: "text.secondary",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    fechaFinalizacionRef.current?.showPicker?.();
                                  }}
                                />
                              ),
                            },
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      pt: 1.5,
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
                        gap: 1.5,
                      }}
                    >
                      <Switch
                        checked={activo}
                        onChange={(event) => setActivo(event.target.checked)}
                        color="primary"
                      />

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Hábito activo
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          El hábito estará disponible para seguimiento.
                        </Typography>
                      </Box>
                    </Box>

                    {errorGeneral && (
                      <Alert
                        severity="error"
                        sx={{
                          flex: 1,
                          minWidth: 250,
                        }}
                      >
                        {errorGeneral}
                      </Alert>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => router.push("/habitos")}
                        disabled={guardando}
                        sx={{
                          px: 3,
                        }}
                      >
                        Volver
                      </Button>

                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => router.push("/habitos")}
                        disabled={guardando}
                        sx={{
                          px: 3,
                        }}
                      >
                        Cancelar
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={guardando}
                        sx={{
                          px: 3,
                        }}
                      >
                        {guardando ? "Creando..." : "Crear hábito"}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
