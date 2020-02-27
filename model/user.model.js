const mongoose = require('mongoose')
const usersSchema = new mongoose.Schema({
  emailid: { type: String, required: true },
  dp: { type: String, required: false },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true }
})
mongoose.model('Users', usersSchema)
