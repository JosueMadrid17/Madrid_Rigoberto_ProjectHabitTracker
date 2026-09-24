# Habit Tracker

Sistema web para crear, administrar y dar seguimiento a hábitos y metas personales. El proyecto integra un frontend en Next.js, una API REST en NestJS y persistencia de datos en MongoDB mediante Prisma.

## Descripción

Habit Tracker permite que un usuario se registre, inicie sesión y gestione sus hábitos desde una interfaz web. Cada hábito puede incluir información como categoría, frecuencia, prioridad, fechas, meta y unidad de medida.

El sistema también permite registrar el progreso diario de cada hábito, determinar automáticamente cuándo una meta ha sido completada y mostrar información de seguimiento mediante un dashboard y una pantalla de estadísticas.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Consulta de perfil del usuario autenticado.
- Creación de hábitos.
- Edición de hábitos.
- Eliminación de hábitos.
- Activación y desactivación de hábitos.
- Definición de:
  - nombre;
  - descripción;
  - categoría;
  - frecuencia;
  - prioridad;
  - fecha de inicio;
  - fecha de finalización opcional;
  - meta;
  - unidad de medida.
- Búsqueda de hábitos.
- Filtro por categoría.
- Filtro por estado activo o inactivo.
- Ordenamiento de hábitos.
- Registro de progreso individual.
- Marcado automático de un hábito como completado al alcanzar su meta.
- Visualización del progreso mediante barras.
- Dashboard con:
  - hábitos activos;
  - hábitos completados hoy;
  - racha actual;
  - porcentaje de cumplimiento;
  - progreso semanal;
  - progreso mensual;
  - hábitos del día.
- Estadísticas generales basadas en registros reales.
- Validación de formularios.
- Confirmaciones para acciones críticas.
- Manejo de estados de carga y errores.

## Tecnologías utilizadas

### Frontend

- Next.js
- React
- TypeScript
- Material UI
- Material Icons
- Zod
- Fetch API

### Backend

- NestJS
- TypeScript
- Prisma
- MongoDB
- JWT
- class-validator
- class-transformer

### Herramientas

- Git
- GitHub
- Visual Studio Code
- Postman
- MongoDB Compass

## Arquitectura

El proyecto utiliza una arquitectura cliente-servidor.

```text
┌──────────────────────────────┐
│          Navegador           │
│                              │
│   Next.js + Material UI      │
│          Frontend            │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               │ Authorization: Bearer JWT
               ▼
┌──────────────────────────────┐
│        API REST NestJS       │
│                              │
│ Auth                         │
│ Usuarios                     │
│ Hábitos                      │
│ Registros                    │
│ Estadísticas                 │
└──────────────┬───────────────┘
               │
               │ Prisma ORM
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│ Usuario                      │
│ Habito                       │
│ Registro                     │
└──────────────────────────────┘
```

El frontend consume la API REST mediante peticiones HTTP. Las rutas protegidas envían el token JWT en el encabezado `Authorization`. El backend valida el token mediante guards y utiliza Prisma para acceder a MongoDB.

## Estructura del proyecto

```text
Habit-Tracker/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   └── guards/
│   │   │
│   │   ├── habitos/
│   │   │   └── dto/
│   │   │
│   │   ├── registros/
│   │   │   └── dto/
│   │   │
│   │   ├── usuarios/
│   │   │   └── dto/
│   │   │
│   │   ├── estadisticas/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── estadisticas/
│   │   │   ├── habitos/
│   │   │   │   ├── editar/[id]/
│   │   │   │   └── nuevo/
│   │   │   ├── login/
│   │   │   ├── perfil/
│   │   │   └── registro/
│   │   │
│   │   ├── components/
│   │   │   └── layout/
│   │   │
│   │   ├── lib/
│   │   │   └── validations/
│   │   │
│   │   └── theme/
│   │
│   └── public/
│
└── README.md
```

## Modelo de datos

### Usuario

Almacena la información principal de la cuenta.

Campos principales:

- `id`
- `nombre`
- `correo`
- `password`
- `fechaRegistro`

Relaciones:

- un usuario puede tener varios hábitos;
- un usuario puede tener varios registros.

### Habito

Representa un hábito creado por un usuario.

Campos principales:

- `id`
- `nombre`
- `descripcion`
- `categoria`
- `frecuencia`
- `prioridad`
- `fechaInicio`
- `fechaFinalizacion`
- `meta`
- `unidad`
- `activo`
- `usuarioId`

Relaciones:

- pertenece a un usuario;
- puede tener varios registros.

### Registro

Representa el progreso de un hábito en una fecha determinada.

Campos principales:

- `id`
- `fecha`
- `valor`
- `completado`
- `habitoId`
- `usuarioId`

Relaciones:

- pertenece a un hábito;
- pertenece a un usuario.

Cuando se elimina un hábito, sus registros asociados se eliminan antes de eliminar el hábito para mantener la integridad de las relaciones.

## Requisitos previos

Antes de ejecutar el proyecto se necesita:

- Node.js instalado.
- npm instalado.
- pnpm instalado para el backend.
- MongoDB disponible localmente o mediante MongoDB Atlas.
- Git.

Para instalar pnpm, si todavía no está disponible:

```bash
npm install -g pnpm
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/JosueMadrid17/Madrid_Rigoberto_ProjectHabitTracker.git
cd Madrid_Rigoberto_ProjectHabitTracker
```

## Configuración del backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
pnpm install
```

Crear un archivo `.env` dentro de `backend`.

Ejemplo:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/habittracker"
JWT_SECRET="cambiar_por_una_clave_segura"
```

Si se utiliza MongoDB Atlas, `DATABASE_URL` debe contener la cadena de conexión correspondiente.

Generar Prisma Client:

```bash
pnpm exec prisma generate
```

Ejecutar el backend en modo desarrollo:

```bash
pnpm run start:dev
```

La API utilizada actualmente por el frontend se encuentra en:

```text
http://localhost:3001
```

## Configuración del frontend

Desde la raíz del repositorio:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Si se utiliza una variable de entorno para la URL de la API, crear `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Ejecutar el frontend:

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

## Ejecución del proyecto

Para trabajar localmente se deben mantener dos terminales abiertas.

### Terminal 1 - Backend

```bash
cd backend
pnpm run start:dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

MongoDB también debe estar disponible durante la ejecución.

## Navegación del frontend

Rutas principales:

```text
/login
/registro
/dashboard
/habitos
/habitos/nuevo
/habitos/editar/[id]
/estadisticas
/perfil
```

Las pantallas privadas requieren una sesión autenticada.

## API REST

La API está organizada por módulos.

### Autenticación

```text
POST /auth/register
POST /auth/login
```

Permite registrar usuarios y obtener un JWT al iniciar sesión.

### Hábitos

```text
GET    /habitos
POST   /habitos
GET    /habitos/:id
PATCH  /habitos/:id
DELETE /habitos/:id
```

Las operaciones se realizan únicamente sobre los hábitos del usuario autenticado.

### Registros

```text
POST   /registros/:habitoId
GET    /registros
GET    /registros/:id
PATCH  /registros/:id
DELETE /registros/:id
```

Los registros permiten guardar el valor alcanzado y el estado de cumplimiento de cada hábito.

### Estadísticas

```text
GET /estadisticas
```

Devuelve información general basada en los hábitos y registros del usuario autenticado, como cantidades y porcentajes de cumplimiento.

## Autenticación

Después del inicio de sesión, el frontend almacena el token de sesión y lo envía en las peticiones protegidas:

```http
Authorization: Bearer <token>
```

El backend utiliza `JwtAuthGuard` para validar el acceso.

Los servicios también verifican el `usuarioId`, evitando que un usuario consulte, modifique o elimine información perteneciente a otro usuario.

## Seguimiento de hábitos

Cada hábito posee una `meta` y una `unidad`.

Ejemplos:

```text
Caminar       10 km
Tomar agua     2 litros
Leer          30 minutos
Estudiar       4 horas
```

El usuario registra el valor alcanzado desde el Dashboard.

Ejemplo:

```text
Meta:       10 km
Progreso:    7 km
Cumplimiento: 70 %
```

Cuando:

```text
valor >= meta
```

el registro se considera completado automáticamente.

## Dashboard

El Dashboard utiliza datos reales de los hábitos y registros del usuario.

Incluye:

- cantidad de hábitos activos;
- hábitos completados durante el día;
- racha actual;
- porcentaje de cumplimiento;
- gráfico de progreso semanal;
- gráfico de progreso mensual;
- lista de hábitos del día;
- progreso individual de cada hábito.

El progreso semanal se calcula por día y el mensual se agrupa por semanas del mes.

## Estadísticas

La sección de estadísticas consume la información generada por el backend y presenta:

- total de hábitos;
- hábitos activos;
- completados del día;
- cumplimiento del día;
- total de registros;
- total de registros completados;
- cumplimiento general;
- resumen de registros por hábito.

## Filtros de hábitos

La pantalla **Mis hábitos** permite:

- buscar por texto;
- filtrar por categoría;
- filtrar por estado;
- ordenar los resultados;
- activar o desactivar hábitos;
- editar hábitos;
- eliminar hábitos.

## Validaciones

### Frontend

Los formularios utilizan Zod para validar los datos antes de enviarlos a la API.

Se validan, entre otros:

- campos obligatorios;
- longitud mínima del nombre;
- meta válida;
- unidad obligatoria;
- fechas permitidas;
- fecha final no anterior a la fecha inicial.

### Backend

El backend utiliza DTOs y `class-validator` para validar los datos recibidos por la API.

Esto evita depender únicamente de las validaciones del frontend.

## Manejo de errores

El proyecto contempla:

- respuestas de error provenientes del backend;
- validaciones de formularios;
- mensajes de error;
- estados de carga;
- confirmación antes de eliminar;
- control de sesiones no válidas;
- redirección al login cuando no existe un token válido.

## Diseño UX/UI

La interfaz utiliza un sistema visual basado en Material UI.

Paleta principal:

```text
Verde principal:     #16A34A
Verde claro:         #DCFCE7
Fondo:               #F8FAFC
Blanco:              #FFFFFF
Gris secundario:     #64748B
Bordes:              #E2E8F0
```

El diseño mantiene consistencia mediante:

- sidebar;
- header;
- tarjetas;
- formularios;
- botones;
- chips;
- switches;
- barras de progreso;
- diálogos;
- calendarios;
- estados visuales de cumplimiento.

## Seguridad

Las principales medidas implementadas son:

- autenticación JWT;
- protección de endpoints mediante guards;
- asociación de hábitos y registros con el usuario autenticado;
- validación de datos en frontend y backend;
- variables sensibles almacenadas en `.env`;
- contraseñas no expuestas en las respuestas de perfil.

Los archivos `.env` no deben subirse al repositorio.

## Control de versiones

El proyecto utiliza Git y GitHub.

Repositorio:

```text
https://github.com/JosueMadrid17/Madrid_Rigoberto_ProjectHabitTracker
```

El desarrollo se realizó de manera incremental mediante commits separados por funcionalidad y corrección.

## Pruebas

Durante el desarrollo se realizaron pruebas de la API con Postman para comprobar:

- autenticación;
- creación de hábitos;
- consulta de hábitos;
- edición;
- eliminación;
- creación y actualización de registros;
- estadísticas;
- autorización mediante JWT.

También se realizaron pruebas manuales desde el frontend para comprobar la integración completa entre Next.js, NestJS y MongoDB.

## Autor

**Josue Rigoberto Madrid Rivera**

Proyecto desarrollado para la asignatura **Experiencia de Usuario**.

## Estado del proyecto

Proyecto funcional con integración entre frontend, backend y base de datos.

La aplicación permite administrar hábitos, registrar su progreso y visualizar información de seguimiento utilizando datos persistidos en MongoDB.
