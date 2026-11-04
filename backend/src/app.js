const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const routes = require('./routes/index.js');
const errorHandler = require('./middlewares/error.middleware.js');

const app = express();

// Configuración de Middlewares globales
app.use(
  cors({
    origin: '*', // Permitir frontend local
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas de la API REST
app.use('/api', routes);

// Middleware centralizado de errores
app.use(errorHandler);

app.use(require('./middlewares/notFound.middleware'));

module.exports = app;
