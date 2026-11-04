-- ALTOKE POS: catálogos básicos y cliente genérico. Archivo público.
-- Ejecutar sobre una instalación nueva, después de init.sql.

USE minimarket_altoke_db;
SET NAMES utf8mb4;
START TRANSACTION;

INSERT IGNORE INTO `roles` (`id_rol`,`nombre`) VALUES
(1,'Administrador'),
(2,'Cajero');

INSERT IGNORE INTO `tipos_documento` (`id_tipo_documento`,`abreviatura`,`descripcion`) VALUES
(1,'DNI','Documento Nacional de Identidad'),
(2,'RUC','Registro Único de Contribuyentes'),
(3,'CE','Carné de Extranjería');

INSERT IGNORE INTO `metodos_pago` (`id_metodo_pago`,`nombre`) VALUES
(1,'Efectivo'),
(3,'Plin'),
(5,'Tarjeta de Crédito'),
(4,'Tarjeta de Débito'),
(2,'Yape');

INSERT IGNORE INTO `tipos_comprobante` (`id_tipo_comprobante`,`nombre`) VALUES
(1,'Boleta'),
(2,'Factura');

INSERT IGNORE INTO `categorias` (`id_categoria`,`nombre`,`descripcion`,`estado`) VALUES
(1,'Gaseosas','Bebidas carbonatadas de diversas marcas y sabores',1),
(2,'Cervezas','Cervezas nacionales e importadas en botella y lata',1),
(3,'Aguas y Refrescos','Agua mineral, agua de mesa y jugos envasados',1),
(4,'Energizantes','Bebidas energizantes y rehidratantes',1),
(5,'Licores y Vinos','Vinos, piscos, ron y otros licores',1);

INSERT IGNORE INTO `clientes` (`id_cliente`,`id_tipo_documento`,`numero_documento`,`nombre_razon_social`,`estado`,`created_at`) VALUES
(1,1,'00000000','PUBLICO GENERAL',1,'2026-10-24 11:30:48');

COMMIT;
