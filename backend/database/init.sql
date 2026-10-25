-- =================================================================
-- SISTEMA POS ALTOKE MINIMARKET S.A.C.
-- Script de Inicialización de Base de Datos
-- Motor: InnoDB | Cotejamiento: utf8mb4_unicode_ci
-- =================================================================

CREATE DATABASE IF NOT EXISTS minimarket_altoke_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE minimarket_altoke_db;

-- =================================================================
-- 1. TABLAS CATÁLOGO / PARAMÉTRICAS
-- =================================================================

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipos_documento (
  id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
  abreviatura VARCHAR(10) NOT NULL UNIQUE,
  descripcion VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS metodos_pago (
  id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipos_comprobante (
  id_tipo_comprobante INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Corrección aprobada: se incluye la columna 'estado' requerida por la interfaz
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- =================================================================
-- 2. TABLAS PRINCIPALES (ENTIDADES)
-- =================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_rol INT NOT NULL,
  id_tipo_documento INT NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  nom_usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
  CONSTRAINT fk_usuario_tipo_doc FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_documento INT NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombre_razon_social VARCHAR(150) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_tipo_doc FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo_documento)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  cod_producto VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255) NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT chk_producto_precio CHECK (precio_venta >= 0),
  CONSTRAINT chk_producto_stock CHECK (stock >= 0),
  CONSTRAINT chk_producto_stock_min CHECK (stock_minimo >= 0)
) ENGINE=InnoDB;

-- =================================================================
-- 3. TABLAS DE TRANSACCIONES (VENTAS)
-- =================================================================

CREATE TABLE IF NOT EXISTS ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_cliente INT NOT NULL,
  id_metodo_pago INT NOT NULL,
  id_tipo_comprobante INT NOT NULL,
  serie_comprobante VARCHAR(10) NOT NULL,
  numero_comprobante VARCHAR(20) NOT NULL,
  clave_operacion CHAR(64) NULL UNIQUE,
  hash_operacion CHAR(64) NULL,
  snapshot_comprobante JSON NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  monto_igv DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  monto_recibido DECIMAL(10, 2) NOT NULL,
  vuelto DECIMAL(10, 2) NOT NULL,
  tiempo_atencion_seg INT NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA',
  fecha_hora_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_hora_fin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_venta_metodo_pago FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago),
  CONSTRAINT fk_venta_tipo_comprobante FOREIGN KEY (id_tipo_comprobante) REFERENCES tipos_comprobante(id_tipo_comprobante),
  CONSTRAINT uq_serie_numero UNIQUE (serie_comprobante, numero_comprobante)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0)
) ENGINE=InnoDB;

