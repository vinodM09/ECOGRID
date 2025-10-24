const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config({ path: __dirname + '/.env' })
const weatherRouter = require('./routes/weatherRouter')

// middlewares
app.use(
  cors({
    origin: process.env.ORIGIN_LOCALHOST,
    credentials: true
  })
)
app.use(express.json())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static('uploads'))
app.use(cookieParser())

app.use('/api/v1', weatherRouter)

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the ECOTECH web API!'
  })
})

// 404 handler
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  err.status = 404
  next(err)
});

// global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'Error',
    message: err.message || 'Internal Server Error'
  })
})

module.exports = app