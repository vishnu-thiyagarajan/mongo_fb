const mongoose = require('mongoose')
const usersSchema = new mongoose.Schema({
  emailid: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true }
})
mongoose.model('Users', usersSchema)
