const express = require('express')
const mongoose = require('mongoose')

const PostModel = mongoose.model('Posts')
const router = express.Router()

router.get('/posts', (req, res) => {
  PostModel.find((err, docs) => {
    if (err) res.status(500).send(err)
    res.status(200).send(docs)
  })
})

router.post('/posts', (req, res) => {
  var post = new PostModel()
  post.body = req.body.body
  post.userHandle = req.body.userHandle
  post.createdAt = new Date().toISOString()
  post.save((err, docs) => {
    if (err) res.status(500).send(err)
    res.status(201).send({ message: 'successful', status: 'OK' })
  })
})

router.put('/posts', (req, res) => {
  PostModel.updateOne({ _id: req.body._id }, req.body, function (err) {
    if (err) res.status(500).send(err)
    res.status(204).send({ message: 'successful', status: 'OK' })
  })
})

router.delete('/posts', (req, res) => {
  PostModel.deleteOne({ _id: req.body._id }, function (err) {
    if (err) res.status(500).send(err)
    res.status(204).send({ message: 'successful', status: 'OK' })
  })
})

module.exports = router
