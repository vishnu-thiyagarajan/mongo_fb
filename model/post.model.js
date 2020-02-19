const mongoose = require('mongoose')
const postsSchema = new mongoose.Schema({
  body: { type: String, required: true },
  userHandle: { type: String, required: true },
  createdAt: { type: String, required: true }
})
mongoose.model('Posts', postsSchema)
