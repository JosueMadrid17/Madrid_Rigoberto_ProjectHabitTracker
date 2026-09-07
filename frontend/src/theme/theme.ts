import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16A34A",
      dark: "#15803D",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },

    divider: "#E2E8F0",

    error: {
      main: "#EF4444",
    },
  },

  typography: {
    fontFamily: "Arial, sans-serif",

    h4: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: "11px 16px",
          boxShadow: "none",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },

      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        },
      },
    },
  },
});

export default theme;
