'use strict'

const mongoose = require('mongoose')
require('dotenv').config()
require('./post.model.js')

const dbPATH = `${process.env.DB_DOMAIN}:${process.env.DB_PORT}/${process.env.DB_NAME}`
const dbURL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${dbPATH}`

module.exports = function () {
  mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })

  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection is open to ', dbPATH)
  })

  mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection has occured ' + err + ' error')
  })

  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection is disconnected')
  })

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection is disconnected due to application termination')
      process.exit(0)
    })
  })
}
