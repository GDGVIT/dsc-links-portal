const express = require('express');
const compression = require('compression');
const dotEnv = require('dotenv');
const morgan = require('./logging/morgan');
const routes = require('./routes');

dotEnv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(compression());

// Logging
app.use(morgan);

// Mount routes
app.use('/', routes);

module.exports = app;
