# Blog API — Backend

REST API para un blog sencillo con autenticación JWT, gestión de usuarios y publicación de comentarios.

## Tecnologías

- **Node.js** con **Express**
- **TypeScript**
- **Prisma ORM** + **SQLite**
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **Zod** para validación de entradas
- **Helmet** para cabeceras de seguridad
- **CORS** configurado
- **express-rate-limit** en login y register
- **Jest** + **Supertest** para pruebas

## Requisitos previos

- Node.js 20+
- npm 9+

## Construcción (Instalación)

```bash
npm install
```

## Variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

| Variable            | Descripción                         | Ejemplo                        |
|---------------------|-------------------------------------|--------------------------------|
| `NODE_ENV`          | Entorno de ejecución                | `development`                  |
| `PORT`              | Puerto del servidor                 | `3000`                         |
| `DATABASE_URL`      | Ruta de la base de datos SQLite     | `file:./dev.db`                |
| `JWT_SECRET`        | Clave secreta para firmar tokens    | `tu-clave-secreta`             |
| `JWT_EXPIRES_IN`    | Tiempo de expiración del token      | `1h`                           |
| `BCRYPT_SALT_ROUNDS`| Rounds de bcrypt                    | `12`                           |
| `CORS_ORIGIN`       | Origen permitido para CORS          | `http://localhost:5173`        |

## Ejecución (Desarrollo y Pruebas)

```bash
# Generar cliente Prisma
npm run db:generate

# Crear y migrar la base de datos
npm run db:migrate

# Iniciar servidor en modo desarrollo
npm run dev
```

El servidor quedará en `http://localhost:3000`.

Para pruebas unitarias:
```bash
npm test
```

## Compilación (Producción)

```bash
npm run build
npm start
```

## Docker

```bash
# Construir imagen
docker build -t blog-backend .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e JWT_SECRET=tu-clave-secreta \
  -e DATABASE_URL=file:./prod.db \
  blog-backend
```

## Endpoints

### Autenticación

| Método | Ruta               | Auth | Descripción                    |
|--------|--------------------|------|--------------------------------|
| POST   | `/login`           | No   | Iniciar sesión                 |
| POST   | `/register`        | No   | Crear cuenta                   |
| GET    | `/me`              | Si   | Obtener perfil propio          |
| PUT    | `/change-password` | Si   | Cambiar contraseña             |

### Feed

| Método | Ruta    | Auth | Descripción              |
|--------|---------|------|--------------------------|
| GET    | `/feed` | Si   | Listar comentarios       |
| POST   | `/feed` | Si   | Publicar comentario      |

### Detalle de respuestas

#### POST /login
**Body:** `{ "username": "...", "password": "..." }`

- `200` — `{ token_type, expiration, access_token }`
- `400` — Datos faltantes o inválidos
- `401` — Credenciales incorrectas

#### POST /register
**Body:** `{ "name", "email", "username", "password", "avatar" }`

- `201` — `{ message, redirect }`
- `400` — Datos inválidos o faltantes

#### GET /me
**Header:** `Authorization: Bearer <token>`

- `200` — `{ user: { id, name, email, username, avatar, createdAt } }`
- `400` — Header de autorización ausente
- `401` — Token inválido o expirado

#### PUT /change-password
**Header:** `Authorization: Bearer <token>`
**Body:** `{ "current_password": "...", "new_password": "..." }`

- `200` — `{ message }`
- `400` — Datos inválidos
- `401` — Contraseña actual incorrecta o token inválido
- `403` — Header de autorización ausente

#### GET /feed
**Header:** `Authorization: Bearer <token>`

- `200` — `{ comments: [...] }`
- `401` — Token inválido
- `403` — Header de autorización ausente

#### POST /feed
**Header:** `Authorization: Bearer <token>`
**Body:** `{ "content": "..." }`

- `200` — `{ message, comment }`
- `400` — Contenido inválido
- `401` — Token inválido
- `403` — Header de autorización ausente

## Arquitectura

```
src/
  config/       Variables de entorno y cliente de base de datos
  controllers/  Manejo de request y response
  middlewares/  Autenticación, validación y errores
  routes/       Definición de rutas
  schemas/      Validaciones con Zod
  services/     Lógica de negocio
  utils/        JWT, hashing y respuestas estandarizadas
```

La arquitectura sigue el patrón **Controller → Service → Repository (Prisma)**, separando claramente las responsabilidades y facilitando las pruebas unitarias e integración.

## Git Flow sugerido

```
main          Código en producción
develop       Rama de integración
feature/auth  Endpoints de autenticación
feature/feed  Endpoints del feed
feature/tests Pruebas automatizadas
```

Para ver el historial de ramas en forma de grafo:

```bash
git log --oneline --graph --all
```

## Uso de inteligencia artificial

Durante el desarrollo se utilizó inteligencia artificial como apoyo para estructurar el proyecto, revisar buenas prácticas de seguridad, generar casos de prueba base y mejorar la documentación técnica. El código fue revisado, adaptado, probado y ajustado manualmente antes de su entrega.
