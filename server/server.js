const mongoose = require('mongoose')
require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION, SHUTTING DOWN...')
  console.log(err.name, err.message)
  process.exit(1)
})

// main app
const app = require('./app')

// connect to mongoDB
mongoose
  .connect(process.env.DB_URL, {
    ssl: true
  })
  .then(() => console.log('DB connection successful'))
  .catch((err) => {
    console.error('DB connection failed:', err.message)
    process.exit(1)
  })

// start the server
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

// handle asynchronous errors
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION, SHUTTING DOWN')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})