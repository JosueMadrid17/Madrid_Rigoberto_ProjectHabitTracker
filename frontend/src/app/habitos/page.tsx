"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Add,
  DeleteOutlined,
  Edit,
  ExpandMore,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Snackbar,
  Switch,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { Session } from "@/lib/session";

type Habito = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  frecuencia?: string;
  prioridad?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  activo: boolean;
  racha?: number;
  cumplimiento?: number;
};

const API_URL = "http://localhost:3001";

function getCategoriaStyle(categoria: string) {
  const categoriaNormalizada = categoria.toLowerCase();

  if (categoriaNormalizada === "salud") {
    return {
      backgroundColor: "#DCFCE7",
      color: "#15803D",
    };
  }

  if (categoriaNormalizada === "estudio") {
    return {
      backgroundColor: "#DBEAFE",
      color: "#2563EB",
    };
  }

  return {
    backgroundColor: "#F3E8FF",
    color: "#7C3AED",
  };
}

function capitalizar(texto?: string) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export default function HabitosPage() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [habitoEliminar, setHabitoEliminar] = useState<Habito | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [snackbar, setSnackbar] = useState({
    abierto: false,
    mensaje: "",
    tipo: "success" as "success" | "error",
  });

  useEffect(() => {
    const cargarHabitos = async () => {
      try {
        setCargando(true);
        setErrorGeneral("");

        const token = Session.obtenerToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const respuesta = await fetch(`${API_URL}/habitos`, {
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
              : "No se pudieron cargar los hábitos",
          );
        }

        setHabitos(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error al cargar hábitos:", error);

        setErrorGeneral(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los hábitos.",
        );
      } finally {
        setCargando(false);
      }
    };
    cargarHabitos();
  }, []);

  const habitosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return habitos;
    }

    return habitos.filter((habito) => {
      return (
        habito.nombre.toLowerCase().includes(texto) ||
        habito.descripcion?.toLowerCase().includes(texto) ||
        habito.categoria?.toLowerCase().includes(texto)
      );
    });
  }, [habitos, busqueda]);

  const handleEliminar = async () => {
    if (!habitoEliminar) return;

    try {
      setEliminando(true);

      const token = Session.obtenerToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const respuesta = await fetch(`${API_URL}/habitos/${habitoEliminar.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        throw new Error(
          datos && typeof datos.message === "string"
            ? datos.message
            : "No se pudo eliminar el hábito.",
        );
      }

      setHabitos((habitosActuales) =>
        habitosActuales.filter((habito) => habito.id !== habitoEliminar.id),
      );

      setHabitoEliminar(null);
      setSnackbar({
        abierto: true,
        mensaje: "Hábito eliminado correctamente.",
        tipo: "success",
      });
    } catch (error) {
      console.error("Error al eliminar hábito:", error);
      setSnackbar({
        abierto: true,
        mensaje:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el hábito.",
        tipo: "error",
      });
    } finally {
      setEliminando(false);
    }
  };

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
          height: "100vh",
          overflow: "hidden",
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
            maxWidth: 1400,
            mx: "auto",
            height: "calc(100vh - 90px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 25,
                    sm: 28,
                    md: 30,
                  },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Mis hábitos
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 13,
                    sm: 14,
                  },
                  color: "text.secondary",
                  mt: 0.6,
                }}
              >
                Administra tus hábitos, edita o elimina los que ya no necesites.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/habitos/nuevo"
              variant="contained"
              startIcon={<Add />}
              sx={{
                fontSize: {
                  xs: 12,
                  sm: 14,
                },
                px: {
                  xs: 1.5,
                  sm: 2.5,
                },
                py: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              Crear hábito
            </Button>
          </Box>

          <Card
            sx={{
              p: {
                xs: 1.5,
                sm: 2,
                md: 2.5,
              },
              borderRadius: 2,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
                flexWrap: "wrap",
                flexShrink: 0,
              }}
            >
              <OutlinedInput
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                size="small"
                placeholder="Buscar hábito..."
                startAdornment={
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        fontSize: 21,
                        color: "text.secondary",
                      }}
                    />
                  </InputAdornment>
                }
                sx={{
                  width: {
                    xs: "100%",
                    sm: 200,
                  },
                  height: 40,
                  fontSize: 13,
                }}
              />

              <Button
                variant="outlined"
                endIcon={<ExpandMore />}
                sx={{
                  height: 40,
                  minWidth: 155,
                  fontSize: 12,
                  justifyContent: "space-between",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                Todas las categorías
              </Button>

              <Button
                variant="outlined"
                endIcon={<ExpandMore />}
                sx={{
                  height: 40,
                  minWidth: 130,
                  fontSize: 12,
                  justifyContent: "space-between",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                Todos los estados
              </Button>

              <Button
                variant="outlined"
                endIcon={<ExpandMore />}
                sx={{
                  height: 40,
                  minWidth: 120,
                  fontSize: 12,
                  justifyContent: "space-between",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                Más recientes
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(250px, 2fr) 110px 95px 100px 105px 80px 100px",
                minWidth: 840,
                alignItems: "center",
                px: 1.5,
                py: 1.2,
                backgroundColor: "#F8FAFC",
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              {[
                "HÁBITO",
                "CATEGORÍA",
                "FRECUENCIA",
                "RACHA ACTUAL",
                "CUMPLIMIENTO",
                "ESTADO",
                "ACCIONES",
              ].map((titulo) => (
                <Typography
                  key={titulo}
                  sx={{
                    fontSize: {
                      xs: 10,
                      sm: 11,
                    },
                    fontWeight: 700,
                    color: "text.secondary",
                    textAlign: titulo === "HÁBITO" ? "left" : "center",
                  }}
                >
                  {titulo}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "auto",

                "&::-webkit-scrollbar": {
                  width: 8,
                  height: 8,
                },

                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#CBD5E1",
                  borderRadius: 4,
                },
              }}
            >
              {cargando && (
                <Box
                  sx={{
                    minHeight: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    Cargando hábitos...
                  </Typography>
                </Box>
              )}

              {!cargando && errorGeneral && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{errorGeneral}</Alert>
                </Box>
              )}

              {!cargando && !errorGeneral && habitosFiltrados.length === 0 && (
                <Box
                  sx={{
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {busqueda
                      ? "No encontramos hábitos"
                      : "Todavía no tienes hábitos"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  >
                    {busqueda
                      ? "Prueba con otro término de búsqueda."
                      : "Crea tu primer hábito para comenzar a llevar tu progreso."}
                  </Typography>

                  {!busqueda && (
                    <Button
                      component={Link}
                      href="/habitos/nuevo"
                      variant="contained"
                      startIcon={<Add />}
                      sx={{
                        mt: 1,
                        fontSize: 13,
                      }}
                    >
                      Crear hábito
                    </Button>
                  )}
                </Box>
              )}

              {!cargando &&
                !errorGeneral &&
                habitosFiltrados.map((habito) => (
                  <Box
                    key={habito.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(250px, 2fr) 110px 95px 100px 105px 80px 100px",
                      minWidth: 840,
                      minHeight: 72,
                      alignItems: "center",
                      px: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.3,
                        pr: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: "#DCFCE7",
                          flexShrink: 0,
                        }}
                      />

                      <Box>
                        <Typography
                          sx={{
                            fontSize: {
                              xs: 13,
                              sm: 14,
                            },
                            fontWeight: 700,
                            lineHeight: 1.3,
                          }}
                        >
                          {habito.nombre}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: {
                              xs: 10,
                              sm: 11,
                            },
                            color: "text.secondary",
                            mt: 0.3,
                          }}
                        >
                          {habito.descripcion || "Sin descripción"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                      {habito.categoria ? (
                        <Chip
                          label={capitalizar(habito.categoria)}
                          size="small"
                          sx={{
                            height: 23,
                            fontSize: 10,
                            fontWeight: 600,
                            ...getCategoriaStyle(habito.categoria),
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          —
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12,
                        textAlign: "center",
                      }}
                    >
                      {capitalizar(habito.frecuencia) || "—"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "primary.main",
                        textAlign: "center",
                      }}
                    >
                      {habito.racha !== undefined
                        ? `${habito.racha} días`
                        : "—"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "primary.main",
                        textAlign: "center",
                      }}
                    >
                      {habito.cumplimiento !== undefined
                        ? `${habito.cumplimiento}%`
                        : "—"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Switch
                        checked={Boolean(habito.activo)}
                        size="small"
                        color="primary"
                        readOnly
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.3,
                      }}
                    >
                      <IconButton
                        component={Link}
                        href={`/habitos/editar/${habito.id}`}
                        size="small"
                        aria-label={`Editar ${habito.nombre}`}
                      >
                        <Edit
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      </IconButton>

                      <IconButton
                        size="small"
                        aria-label={`Eliminar ${habito.nombre}`}
                        onClick={() => setHabitoEliminar(habito)}
                      >
                        <DeleteOutlined
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Card>
        </Box>
      </Box>

      <Dialog
        open={Boolean(habitoEliminar)}
        onClose={() => {
          if (!eliminando) {
            setHabitoEliminar(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          ¿Eliminar hábito?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong>{habitoEliminar?.nombre}</strong>?
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setHabitoEliminar(null)}
            variant="outlined"
            disabled={eliminando}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleEliminar}
            variant="contained"
            color="error"
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.abierto}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            abierto: false,
          }))
        }
        message={snackbar.mensaje}
      />
    </Box>
  );
}
