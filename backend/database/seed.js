const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

async function seed() {
  const databaseName =
    process.env.DB_NAME || 'minimarket_altoke_db';

  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error('DB_NAME inválido.');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const lockName =
    `altoke:install:${databaseName}`.slice(0, 64);

  let locked = false;

  try {
    const [[lock]] = await connection.query(
      'SELECT GET_LOCK(?, 15) AS acquired',
      [lockName],
    );

    if (Number(lock.acquired) !== 1) {
      throw new Error(
        'Otra instalación está en ejecución.',
      );
    }

    locked = true;

    const readSql = (fileName) => {
      const filePath = path.join(__dirname, fileName);

      return fs
        .readFileSync(filePath, 'utf8')
        .replaceAll(
          'minimarket_altoke_db',
          databaseName,
        );
    };

    // Crea las tablas que todavía no existan.
    // No reemplaza una migración de estructuras anteriores.
    await connection.query(readSql('init.sql'));

    // Público General no impide completar una instalación
    // básica con los datos privados.
    const [[existing]] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios) +
        (SELECT COUNT(*) FROM productos) +
        (
          SELECT COUNT(*)
          FROM clientes
          WHERE numero_documento <> '00000000'
        ) +
        (SELECT COUNT(*) FROM ventas) +
        (SELECT COUNT(*) FROM detalle_ventas)
        AS total
    `);

    if (Number(existing.total) > 0) {
      console.log(
        'La base ya contiene datos. ' +
        'Se conservaron los registros; ' +
        'no se repitió la carga.',
      );

      return;
    }

    // Carga los catálogos y Público General.
    await connection.query(readSql('seeds.sql'));

    const privateFileName = 'seeds-private.sql';
    const privateFilePath = path.join(
      __dirname,
      privateFileName,
    );

    if (fs.existsSync(privateFilePath)) {
      // Este archivo debe estar excluido de Git.
      await connection.query(
        readSql(privateFileName),
      );

      console.log(
        'Base preparada: catálogos y datos privados ' +
        'de instalación cargados.',
      );
    } else {
      console.log(
        'Catálogos y Público General preparados. ' +
        'No se cargaron usuarios, productos ni ventas.',
      );

      console.log(
        'No hay una cuenta inicial para ingresar. ' +
        'El responsable debe proporcionar ' +
        'seeds-private.sql o crear el primer ' +
        'Administrador mediante un procedimiento autorizado.',
      );
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try {
      if (locked) {
        await connection.query(
          'SELECT RELEASE_LOCK(?)',
          [lockName],
        );
      }
    } finally {
      await connection.end();
    }
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = seed;