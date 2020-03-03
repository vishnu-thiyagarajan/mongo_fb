const connection = require('./model')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.WS_PORT
require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.SERVER_PORT
connection()

const cors = require('cors')
// const corsUrls = process.env.ALLOWED_URL.split(',')
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log('req from origin :' + origin)
//     if (corsUrls.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   methods: ['POST', 'GET', 'PUT', 'DELETE'],
//   credentials: false,
//   preflightContinue: false
// }
// app.use(cors(corsOptions))

app.use(cors())

app.use(express.json())
app.use('/api', express.static(path.join(__dirname, 'controls', 'uploads')))
app.use('/api', require('./controls/posts'))
app.use('/api', require('./controls/users'))
app.use((req, res, next) => {
  res.status(404).send('<h1>404 Not Found</h1>')
})
const server = http.createServer(app)
const io = socketIo(server)
io.on('connection', (socket) => {
  socket.on('new message', data => {
    console.log(data.room)
    socket.broadcast.emit('receive message', data)
  })
})

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
