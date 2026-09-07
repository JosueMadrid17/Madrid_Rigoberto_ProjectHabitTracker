import { PersonOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

export default function AppHeader() {
  return (
    <Box
      sx={{
        height: 76,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: {
          xs: 2,
          md: 3,
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          ¡Hola, Usuario!
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color: "text.secondary",
            mt: 0.3,
          }}
        >
          Aquí tienes un resumen de tu progreso.
        </Typography>
      </Box>

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "#DCFCE7",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PersonOutlined sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  );
}
