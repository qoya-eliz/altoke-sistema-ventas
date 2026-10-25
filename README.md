# 🛒 Sistema Web de Gestión de Ventas — ALTOKE POS

![Versión](https://img.shields.io/badge/Versión-1.1-751C2C)
![Modalidad](https://img.shields.io/badge/Ejecución-Local-DCA349)
![Universidad](https://img.shields.io/badge/Universidad-UTP-red)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Express](https://img.shields.io/badge/Backend-Express-339933)
![MySQL](https://img.shields.io/badge/Base_de_datos-MySQL-4479A1)

Sistema web desarrollado para el **Minimarket ALTOKE S.A.C.**,
orientado al registro de ventas, consulta de productos y precios,
control de existencias y generación de comprobantes y reportes.

---

## 📌 Información general

- **Universidad:** Universidad Tecnológica del Perú (UTP)
- **Facultad:** Facultad de Ingeniería
- **Carrera:** Ingeniería de Sistemas e Informática
- **Curso:** [Completar con el nombre oficial]
- **Docente:** [Completar con el nombre del docente]
- **Año:** 2026
- **Versión del sistema:** 1.1

## 👥 Integrantes

- Aguilar Roldan, Sandro Aharon
- Aguilar Vila, Angeles Abril
- Chuquiruna Aguilar, Elsa Elizabeth
- Ramírez Hoyos, Joshua Natanael
- Torres Arevalo, Freddy Joel

## 📑 Contenido

- [Propósito](#-propósito)
- [Funcionalidades](#-funcionalidades)
- [Roles y permisos](#-roles-y-permisos)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos](#-requisitos)
- [Instalación y configuración](#-instalación-y-configuración)
- [Ejecución local](#-ejecución-local)
- [Base de datos](#-base-de-datos)
- [Flujo de venta](#-flujo-de-venta)
- [Comprobantes y métodos de pago](#-comprobantes-y-métodos-de-pago)
- [Control de versiones](#-control-de-versiones)
- [Consideraciones](#-consideraciones)

---

## 🎯 Propósito

Agilizar la atención en mostrador mediante la consulta de productos,
el cálculo automático de importes y vuelto, el registro centralizado
de ventas y la actualización de existencias.

ALTOKE POS reemplaza tareas manuales de consulta y registro por
una interfaz web con permisos diferenciados para el Administrador
y el Cajero.

## ⚙️ Funcionalidades

### Acceso y seguridad

- Inicio de sesión mediante usuario y contraseña.
- Dos perfiles: Administrador y Cajero.
- Autenticación mediante tokens JWT.
- Autorización de operaciones en frontend y backend.
- Almacenamiento de contraseñas mediante hash bcrypt.
- Validación de requisitos al crear o cambiar una contraseña:
  - Mínimo ocho caracteres.
  - Al menos una letra mayúscula.
  - Al menos una letra minúscula.
  - Al menos un número.
  - Al menos un símbolo distinto de un espacio.
- Bloqueo temporal de dos minutos después de tres intentos fallidos.
- Protección del último Administrador activo.
- Cierre de sesión.

### Gestión de productos

- Registro de productos con categoría, código, precio y existencias.
- Consulta por nombre o código.
- Filtros por categoría, estado y alerta de stock.
- Actualización de datos.
- Inactivación y reactivación.
- Alertas cuando el stock llega al mínimo o queda por debajo.

### Gestión de clientes

- Registro de clientes con DNI, RUC o CE.
- Búsqueda por documento o nombre.
- Actualización de los datos permitidos.
- Inactivación y reactivación.
- Registro de clientes desde el punto de venta.
- Protección del registro PÚBLICO GENERAL.

### Gestión de categorías

- Registro y consulta de familias de productos.
- Actualización de nombre y descripción.
- Inactivación y reactivación.
- Restricción de inactivación cuando existen productos activos asociados.

### Gestión de usuarios

- Registro de cuentas con uno de los dos roles.
- Generación del nombre de usuario.
- Consulta por nombre, documento, usuario, rol o estado.
- Actualización de datos y contraseña.
- Cambio de rol con confirmación.
- Inactivación y reactivación de cuentas.

### Punto de venta

- Selección del cliente.
- Búsqueda y selección de productos.
- Ajuste de cantidades según existencias.
- Cálculo de subtotal, IGV, total y vuelto.
- Selección de boleta o factura.
- Registro del método de pago.
- Confirmación de la operación.
- Descuento de stock al registrar la venta.
- Protección contra el registro duplicado de una misma operación.

### Historial y reportes

- Consulta de ventas mediante filtros.
- Visualización del detalle y del comprobante.
- Indicadores de ventas completadas.
- Consulta de ventas anuladas por el Administrador.
- Exportación de reportes a PDF y Excel.
- Descarga de comprobantes en PDF.

## 🔐 Roles y permisos

### Administrador

Responsable del mantenimiento de la información del sistema:

- Administra clientes, productos, categorías y usuarios.
- Gestiona roles y estados de las cuentas.
- Consulta reportes e indicadores.
- Revisa ventas y comprobantes.
- Exporta reportes.

En esta versión, el Administrador no opera la pantalla de punto de venta.

### Cajero

Responsable de la atención y registro de ventas:

- Consulta clientes activos.
- Registra clientes desde el punto de venta.
- Consulta el catálogo de productos activos.
- Prepara y confirma ventas.
- Obtiene los comprobantes.
- Consulta el historial de ventas completadas permitido.

No puede administrar usuarios, categorías ni reportes.

> Los permisos también se comprueban en el backend.
> Ocultar un botón no sustituye la autorización de una operación.

## 🧰 Tecnologías utilizadas

### Frontend

- **React:** interfaces basadas en componentes.
- **Vite:** servidor de desarrollo y compilación.
- **React Router:** navegación y rutas protegidas.
- **Axios:** solicitudes HTTP a la API.
- **Bootstrap:** estilos y distribución de la interfaz.
- **Bootstrap Icons:** iconos de la aplicación.

### Backend

- **Node.js:** entorno de ejecución.
- **Express:** servidor y API REST.
- **mysql2:** comunicación con MySQL.
- **bcryptjs:** generación y comparación de hashes.
- **jsonwebtoken:** creación y verificación de tokens JWT.
- **dotenv:** lectura de variables de entorno.
- **PDFKit:** generación de documentos PDF.
- **ExcelJS:** exportación de reportes a Excel.
- **QRCode:** generación de códigos QR.
- **CORS:** configuración de acceso entre orígenes.
- **Morgan:** registro de solicitudes HTTP.

### Base de datos

- **MySQL 8:** almacenamiento relacional.
- **InnoDB:** motor de las tablas.

Las dependencias y sus versiones declaradas se encuentran
en los archivos `package.json` de cada aplicación.
Los archivos `package-lock.json` registran las versiones resueltas.

## 🏗️ Arquitectura

### Backend por capas

```text
Solicitud HTTP
      ↓
Ruta y middlewares
      ↓
Controlador
      ↓
Servicio
      ↓
Repositorio
      ↓
MySQL
```

- **Rutas:** definen los endpoints de la API.
- **Middlewares:** comprueban autenticación y autorización.
- **Controladores:** reciben las solicitudes y generan las respuestas.
- **Servicios:** aplican las reglas del negocio.
- **Repositorios:** ejecutan las consultas SQL.
- **MySQL:** almacena la información.

La separación del acceso a datos mediante repositorios corresponde
al enfoque DAO/Repository utilizado en el proyecto.

### Frontend por módulos y componentes

Las funcionalidades se agrupan en módulos:

- Autenticación.
- Clientes.
- Productos.
- Categorías.
- Usuarios.
- Ventas.

Los módulos utilizan componentes, hooks, contextos y utilidades
compartidas para evitar repetir comportamientos comunes.

### Comunicación

```text
Usuario
   ↓
Interfaz React
   ↓
Axios
   ↓
API REST de Express
   ↓
Servicios y repositorios
   ↓
MySQL
```

La API utiliza principalmente:

- **GET:** consultas.
- **POST:** autenticación y creación de registros.
- **PUT:** actualización de datos y estados.

La inactivación se realiza actualizando el estado del registro.
No se ofrece eliminación física desde las pantallas administrativas.

## 📁 Estructura del proyecto

Estructura resumida de las carpetas principales:

```text
altoke-pos/
├── backend/
│   ├── database/
│   │   ├── init.sql
│   │   ├── seeds.sql
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── exports/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── modules/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── package.json
└── README.md
```

### Carpetas destacadas

- `backend/database`: estructura y datos iniciales de instalación.
- `backend/src/config`: configuración de conexiones y autenticación.
- `backend/src/exports`: generación de reportes.
- `backend/src/services`: reglas del negocio.
- `backend/src/repositories`: acceso a datos.
- `frontend/public`: recursos públicos.
- `frontend/src/api`: cliente HTTP y recursos compartidos.
- `frontend/src/app`: rutas y configuración de la aplicación.
- `frontend/src/components`: elementos reutilizables.
- `frontend/src/context`: estado compartido.
- `frontend/src/hooks`: lógica reutilizable de React.
- `frontend/src/layouts`: estructura común de las pantallas.
- `frontend/src/modules`: funcionalidades del sistema.
- `frontend/src/styles`: estilos visuales.
- `frontend/src/utils`: funciones auxiliares.

## 📋 Requisitos

- Node.js compatible con Vite 8:
  - Rama 20: versión 20.19 o superior.
  - Rama 22: versión 22.12 o superior.
  - O una versión posterior compatible.
- npm.
- MySQL 8.
- Navegador actualizado.
- Laptop o computadora de escritorio.

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/qoya-eliz/altoke-sistema-ventas.git
cd altoke-sistema-ventas
```

> Git creará la carpeta `altoke-sistema-ventas`.
> Si ya tienes el proyecto local en `altoke-pos`, trabaja desde esa
> carpeta; no necesitas clonarlo nuevamente.

### 2. Instalar las dependencias

Desde la carpeta principal del proyecto:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Configurar las variables del backend

Crea el archivo `backend/.env`:

```dotenv
# Servidor
PORT=5001
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=TU_USUARIO_MYSQL
DB_PASSWORD="TU_PASSWORD_MYSQL"
DB_NAME=minimarket_altoke_db

# Autenticación
JWT_SECRET="REEMPLAZAR_POR_UN_SECRETO_LARGO_Y_ALEATORIO"
JWT_EXPIRES_IN=8h
```

Reemplaza los valores de referencia por la configuración
de tu instalación.

Si la contraseña de MySQL contiene `#`, mantenla entre comillas.

> No publiques el archivo `.env` ni utilices los valores
> de referencia como credenciales reales.

### 4. Preparar MySQL

Comprueba que el servidor MySQL esté iniciado y que el usuario
configurado tenga los permisos necesarios para crear la base
y sus tablas.

Puedes preparar la base mediante uno de los siguientes métodos.

#### Opción A: inicializador del proyecto

Desde la carpeta principal:

```bash
npm run db:init
```

#### Opción B: MySQL Workbench

Sobre una instalación nueva:

1. Abre una conexión con tu servidor MySQL.
2. Ejecuta `backend/database/init.sql`.
3. Ejecuta `backend/database/seeds.sql`.

**Utiliza un solo método de inicialización.**

No vuelvas a cargar los datos iniciales para trasladar una base
que ya contiene nuevas operaciones. En ese caso, utiliza
una copia de seguridad actualizada.

## 💻 Ejecución local

Mantén disponibles MySQL, el backend y el frontend.

### Terminal 1: backend

Desde la carpeta principal:

```bash
npm run backend:dev
```

El servidor de la API utiliza el puerto `5001`.

### Terminal 2: frontend

Desde la carpeta principal:

```bash
npm run frontend:dev
```

El frontend utiliza el puerto `5174`.

### Direcciones locales

**Aplicación:**

```text
http://127.0.0.1:5174/login
```

**API:**

```text
http://127.0.0.1:5001/api
```

La configuración de Vite redirige las solicitudes `/api`
al backend local.

> La dirección `127.0.0.1` corresponde a la computadora
> desde la que se abre. No es un enlace público para otros equipos.

### Detener la ejecución

En cada terminal del servidor, utiliza:

```text
Ctrl + C
```

### Compilar el frontend

Desde la carpeta principal:

```bash
npm run build:frontend
```

La compilación genera `frontend/dist`.

Esta carpeta no es necesaria para ejecutar el proyecto
con `npm run frontend:dev` y puede regenerarse mediante
el comando de compilación.

## 🗄️ Base de datos

Nombre predeterminado:

```text
minimarket_altoke_db
```

### Tablas

**Catálogos**

- `roles`
- `tipos_documento`
- `metodos_pago`
- `tipos_comprobante`

**Registros principales**

- `categorias`
- `usuarios`
- `clientes`
- `productos`

**Operaciones**

- `ventas`
- `detalle_ventas`

### Archivos de instalación

- **`init.sql`:** crea la base de datos y sus tablas.
- **`seeds.sql`:** incorpora los datos iniciales definidos
  para la instalación.
- **`seed.js`:** ejecuta los SQL desde Node.js.

Si el inicializador detecta registros en las tablas principales,
conserva los datos y no repite la carga.

`CREATE TABLE IF NOT EXISTS` no actualiza automáticamente
una estructura antigua. El inicializador no reemplaza
una migración ni un respaldo de la base de datos.

### Cuentas de acceso

El inicio de sesión utiliza **usuario y contraseña**.

Las cuentas disponibles dependen de los datos cargados
en cada instalación. Las contraseñas no se publican
en este README.

Los archivos destinados al repositorio público deben utilizar
datos de ejemplo, sin DNI reales ni hashes asociados
a las contraseñas actuales del equipo.

## 🛍️ Flujo de venta

1. El Cajero inicia sesión con su cuenta.
2. Selecciona un cliente o utiliza PÚBLICO GENERAL.
3. Busca y agrega los productos a la orden.
4. Revisa cantidades, precios y total.
5. Selecciona el comprobante y el método de pago.
6. Si recibe efectivo, registra el monto y revisa el vuelto.
7. Pulsa COBRAR y comprueba el resumen.
8. Confirma la venta.
9. El servidor valida la operación, guarda sus detalles
   y descuenta las existencias.
10. El sistema muestra el comprobante y conserva la venta
    para su consulta.

> Agregar productos a la orden no descuenta stock.
> El descuento ocurre al registrar correctamente la venta.

## 🧾 Comprobantes y métodos de pago

### Comprobantes

- Boleta: serie `B001`.
- Factura: serie `F001`.
- La factura requiere un cliente con RUC.
- Los documentos incluyen productos, importes y datos de pago.
- El QR contiene un resumen del comprobante.
- El pie indica **“Sin validez tributaria”**.

No existe integración de facturación electrónica con SUNAT.

### Métodos de pago

- Efectivo.
- Yape.
- Plin.
- Tarjeta de Débito.
- Tarjeta de Crédito.

ALTOKE registra el método utilizado; no procesa cobros bancarios
ni comprueba automáticamente transferencias.

### Entrega del comprobante

- **Descargar PDF:** guarda el archivo en el equipo.
- **Imprimir:** abre el documento para su impresión.
- **Compartir PDF:** depende de las capacidades del navegador.
- **WhatsApp:** abre un mensaje de resumen; no adjunta
  automáticamente el PDF.

## 🌿 Control de versiones

Se utiliza Git para registrar cambios y GitHub para alojar
el repositorio.

Los mensajes identifican la parte modificada, por ejemplo:

```text
backend: autenticar usuarios con perfiles Administrador y Cajero
frontend: implementar login y gestión de sesión
sistema: implementar CRUD de productos con eliminación lógica
docs: explicar instalación y ejecución local
```

Cada commit debe describir los cambios que realmente contiene.

### Archivos excluidos

No deben incorporarse al repositorio:

```text
node_modules/
.env
dist/
*.log
```

También deben excluirse copias de seguridad, documentos privados
y archivos que contengan credenciales o información personal
ajena a los datos públicos de ejemplo.

## 📎 Consideraciones

- La interfaz está orientada a laptops y computadoras.
- Los permisos se verifican en frontend y backend.
- El cliente PÚBLICO GENERAL está protegido contra modificación
  e inactivación.
- El último Administrador activo no puede inactivarse
  ni convertirse en Cajero.
- Clientes, productos, categorías y usuarios utilizan
  eliminación lógica.
- Las pantallas administrativas no ofrecen borrado físico.
- Los indicadores consideran ventas completadas.
- Las ventas anuladas se conservan para consulta del Administrador.
- La interfaz no incorpora una acción para anular ventas.
- No existe consulta automática de identidad mediante RENIEC.
- El bloqueo por intentos fallidos se mantiene en memoria
  del backend y se reinicia al reiniciar ese proceso.
- Exportar un reporte no equivale a respaldar toda la base de datos.

---

**ALTOKE POS · Sistema de gestión de ventas del minimarket**