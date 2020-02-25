const mongoose = require('mongoose')
const postsSchema = new mongoose.Schema({
  body: { type: String, required: false },
  userHandle: { type: String, required: true },
  likedUsers: { type: Array, required: false },
  fileName: { type: String, required: false },
  comments: { type: Array, required: false },
  createdAt: { type: String, required: true }
})
mongoose.model('Posts', postsSchema)
