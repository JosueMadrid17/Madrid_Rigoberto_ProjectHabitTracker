"use client";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { Session } from "@/lib/session";

export default function AppHeader() {
  const [nombre, setNombre] = useState("Usuario");

  useEffect(() => {
    const usuario = Session.obtenerUsuario<{ nombre?: string }>();

    if (usuario?.nombre) {
      setNombre(usuario.nombre);
    }
  }, []);

  return (
    <Box
      sx={{
        height: { xs: 76, md: 82 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 18, md: 20 },
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          ¡Hola, {nombre}!
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: 12,
            mt: 0.4,
          }}
        >
          Aquí tienes un resumen de tu progreso.
        </Typography>
      </Box>

      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "rgba(22, 163, 74, 0.10)",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PersonOutlineIcon fontSize="small" />
      </Box>
    </Box>
  );
}
