"use client";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart,
  Checklist,
  Dashboard,
  Logout,
  PersonOutlined,
} from "@mui/icons-material";
import { Box, Divider, List, ListItemButton, Typography } from "@mui/material";

interface AppSidebarProps {
  active?: "dashboard" | "habitos" | "estadisticas" | "perfil";
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Dashboard fontSize="small" />,
    key: "dashboard",
  },
  {
    label: "Mis Hábitos",
    href: "/habitos",
    icon: <Checklist fontSize="small" />,
    key: "habitos",
  },
  {
    label: "Estadísticas",
    href: "/estadisticas",
    icon: <BarChart fontSize="small" />,
    key: "estadisticas",
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: <PersonOutlined fontSize="small" />,
    key: "perfil",
  },
] as const;

export default function AppSidebar({ active }: AppSidebarProps) {
  return (
    <Box
      sx={{
        width: 180,
        minWidth: 180,
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: 76,
          px: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Image
          src="/LogoProyecto.png"
          alt="Habit Tracker"
          width={135}
          height={34}
          priority
          style={{
            width: "135px",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>

      <Divider />

      <List
        disablePadding
        sx={{
          px: 1.2,
          pt: 1.5,
        }}
      >
        {menuItems.map((item) => {
          const isActive = active === item.key;

          return (
            <ListItemButton
              key={item.key}
              component={Link}
              href={item.href}
              sx={{
                minHeight: 42,
                borderRadius: 1.5,
                mb: 0.5,
                px: 1.3,
                color: isActive ? "primary.main" : "text.primary",
                backgroundColor: isActive ? "#F0FDF4" : "transparent",
                "&:hover": {
                  backgroundColor: "#F0FDF4",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  width: "100%",
                }}
              >
                {item.icon}

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, mt: 1.5 }}>
        <Divider />
      </Box>

      <List
        disablePadding
        sx={{
          px: 1.2,
          pt: 1.5,
        }}
      >
        <ListItemButton
          sx={{
            minHeight: 42,
            borderRadius: 1.5,
            px: 1.3,
            "&:hover": {
              backgroundColor: "#FEF2F2",
              color: "#EF4444",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              width: "100%",
            }}
          >
            <Logout fontSize="small" />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Cerrar Sesión
            </Typography>
          </Box>
        </ListItemButton>
      </List>
    </Box>
  );
}
