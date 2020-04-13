const express = require('express')
const expressSanitizer = require('express-sanitizer')
const compression = require('compression')

const morgan = require('./logging/morgan')
const routes = require('./routes')

const app = express()

// Middlewares
app.use(express.json())
app.use(expressSanitizer())
app.use(compression())

// Logging
app.use(morgan)

// Mount routes
app.use('/', routes)

module.exports = app
