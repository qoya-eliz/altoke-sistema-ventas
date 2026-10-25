# 🛒 ALTOKE POS — Sistema Web de Gestión de Ventas

Sistema web para el Minimarket **ALTOKE S.A.C.** Permite gestionar productos, clientes, categorías y usuarios; registrar ventas, actualizar existencias y generar comprobantes y reportes.

## 📌 Información académica

- **Universidad:** Universidad Tecnológica del Perú (UTP)
- **Carrera:** Ingeniería de Sistemas e Informática
- **Asignatura:** Curso Integrador I: Sistemas – Software
- **Docente:** Robalino Gómez, Hernán
- **Año:** 2026
- **Versión:** 1.1

### Integrantes

- Aguilar Roldan, Sandro Aharon
- Aguilar Vila, Angeles Abril
- Chuquiruna Aguilar, Elsa Elizabeth
- Ramírez Hoyos, Joshua Natanael
- Torres Arevalo, Freddy Joel

## ⚙️ Funcionalidades

- Autenticación mediante JWT y contraseñas protegidas con bcrypt.
- Validación de contraseñas y bloqueo de dos minutos tras tres intentos fallidos.
- Permisos diferenciados para Administrador y Cajero.
- Registro, consulta, edición, inactivación y reactivación de registros.
- Protección de Público General y del último Administrador activo.
- Catálogo de productos y alertas de stock mínimo.
- Punto de venta con cálculo de importes, IGV y vuelto.
- Registro de ventas con descuento de stock y protección contra duplicados.
- Visualización y descarga de boletas y facturas.
- Historial de ventas y reportes con exportación a PDF y Excel.

La eliminación es **lógica**: los registros inactivos permanecen en la base de datos.

## 🔐 Roles

**Administrador**

- Gestiona clientes, productos, categorías y usuarios.
- Consulta ventas, comprobantes, indicadores y reportes.
- Exporta reportes a PDF y Excel.
- No opera el punto de venta en esta versión.

**Cajero**

- Consulta clientes y productos activos.
- Registra clientes desde el punto de venta.
- Prepara y confirma ventas.
- Consulta el historial permitido y obtiene comprobantes.
- No administra usuarios, categorías ni reportes.

Los permisos se verifican en el backend, además de las restricciones de la interfaz.

## 🧰 Tecnologías

- **Frontend:** React, Vite, React Router, Axios, Bootstrap y Bootstrap Icons.
- **Backend:** Node.js, Express, mysql2, bcryptjs, jsonwebtoken y dotenv.
- **Documentos:** PDFKit, ExcelJS y QRCode.
- **Base de datos:** MySQL 8 con motor InnoDB.
- **Control de versiones:** Git y GitHub.

Las versiones de las dependencias están declaradas en los archivos `package.json` y registradas en `package-lock.json`.

## 🏗️ Arquitectura

El backend separa responsabilidades por capas:

```text
Solicitud HTTP → Ruta y middlewares → Controlador → Servicio → Repositorio → MySQL
```

El frontend se organiza por módulos funcionales y utiliza componentes, hooks y contextos compartidos.

```text
altoke-pos/
├── backend/
│   ├── database/           # Tablas e inicialización
│   ├── src/
│   │   ├── config/         # Conexiones y configuración
│   │   ├── controllers/    # Solicitudes y respuestas HTTP
│   │   ├── exports/        # Generación de PDF y Excel
│   │   ├── middlewares/    # Autenticación, permisos y errores
│   │   ├── repositories/   # Consultas SQL
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Reglas del negocio
│   │   ├── utils/          # Funciones auxiliares
│   │   ├── vouchers/       # Clases de boleta y factura
│   │   ├── app.js          # Configuración de Express
│   │   └── server.js       # Inicio del servidor
│   └── package.json
├── frontend/
│   ├── public/             # Recursos públicos
│   ├── src/
│   │   ├── api/            # Comunicación HTTP compartida
│   │   ├── app/            # Rutas de la aplicación
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Sesión y navegación
│   │   ├── hooks/          # Lógica reutilizable
│   │   ├── layouts/        # Cabecera y menú lateral
│   │   ├── modules/        # Funcionalidades del sistema
│   │   ├── styles/         # Estilos visuales
│   │   ├── utils/          # Validaciones y funciones auxiliares
│   │   └── main.jsx        # Inicio de React
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## 📋 Requisitos

- Node.js compatible con Vite 8: 20.19+, 22.12+ o una versión posterior compatible.
- npm.
- MySQL 8.
- Navegador actualizado.
- Laptop o computadora de escritorio.

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/qoya-eliz/altoke-sistema-ventas.git
cd altoke-sistema-ventas
```

Si ya tienes el proyecto local, utiliza su carpeta actual.

### 2. Instalar las dependencias

Desde la carpeta principal:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Configurar el backend

Crea `backend/.env` con los datos de tu instalación:

```dotenv
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=TU_USUARIO_MYSQL
DB_PASSWORD="TU_PASSWORD_MYSQL"
DB_NAME=minimarket_altoke_db

JWT_SECRET="REEMPLAZAR_POR_UN_SECRETO_LARGO_Y_ALEATORIO"
JWT_EXPIRES_IN=8h
```

El archivo `.env` es local y está excluido de Git.

### 4. Inicializar la base de datos

Con MySQL iniciado, ejecuta desde la carpeta principal:

```bash
npm run db:init
```

Archivos utilizados:

- **`init.sql`:** crea la base de datos y sus tablas.
- **`seeds.sql`:** carga los catálogos y Público General.
- **`seed.js`:** ejecuta la inicialización.
- **`seeds-private.sql`:** contiene los datos privados de esta instalación y no se publica en GitHub.

**El repositorio público no incluye cuentas de acceso.** Para reproducir la instalación del equipo, solicita al responsable `seeds-private.sql` y colócalo en `backend/database/` antes de ejecutar la inicialización.

Sin ese archivo, se cargan los datos públicos, pero no se crea un Administrador para ingresar.

Como alternativa, en una instalación nueva puedes ejecutar desde MySQL Workbench, en este orden:

1. `backend/database/init.sql`
2. `backend/database/seeds.sql`
3. `backend/database/seeds-private.sql`, si dispones del archivo privado.

El inicializador conserva los datos existentes y puede omitir la carga cuando detecta registros. No sustituye una migración ni una copia de seguridad.

## 💻 Ejecución local

Desde la carpeta principal, abre dos terminales.

**Terminal 1 — Backend**

```bash
npm run backend:dev
```

**Terminal 2 — Frontend**

```bash
npm run frontend:dev
```

Abre la aplicación en:

[http://127.0.0.1:5174/login](http://127.0.0.1:5174/login)

La API utiliza el puerto `5001`. Vite redirige las solicitudes `/api` al backend local.

Mantén MySQL y ambas terminales en ejecución. Para detener los servidores, utiliza `Ctrl + C`.

### Compilar el frontend

```bash
npm run build:frontend
```

Este comando genera `frontend/dist/`, carpeta excluida de Git y regenerable.

## 🧾 Comprobantes y pagos

- Boleta con serie **B001**.
- Factura con serie **F001**; requiere un cliente con RUC.
- Comprobantes descargables en PDF, con QR de resumen.
- Pie de documento: **“Sin validez tributaria”**.
- Sin integración con SUNAT ni consulta de identidad mediante RENIEC.

El sistema registra pagos en efectivo, Yape, Plin y tarjetas de débito o crédito. No procesa cobros bancarios ni verifica automáticamente transferencias.

## 📎 Consideraciones

- La interfaz está orientada a laptops y computadoras.
- Las credenciales, datos privados y respaldos no deben publicarse.
- Los archivos `.env`, `seeds-private.sql`, `node_modules/` y `dist/` quedan excluidos del repositorio.
- El bloqueo de login se mantiene en memoria y se reinicia al reiniciar el backend.
- Las ventas anuladas pueden consultarse según los permisos; la interfaz no ofrece una acción para anular ventas.
- Exportar un reporte no equivale a respaldar toda la base de datos.