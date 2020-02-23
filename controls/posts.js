const express = require('express')
const mongoose = require('mongoose')

const PostModel = mongoose.model('Posts')
const router = express.Router()

router.get('/posts/:offSet/:limit', (req, res) => {
  try {
    const offSet = Number(req.params.offSet)
    const limit = Number(req.params.limit)
    if (!offSet || !limit) return res.status(403).send({ message: 'needed offset and limit' })
    PostModel.find().skip(offSet).limit(limit).sort({ createdAt: -1 }).exec((err, docs) => {
      if (err) throw err
      res.status(200).send(docs)
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error ' })
  }
})

router.post('/posts', (req, res) => {
  if (!req.body.body || !req.body.userHandle) return
  try {
    var post = new PostModel()
    post.body = req.body.body
    post.userHandle = req.body.userHandle
    post.createdAt = new Date().toISOString()
    post.save((err, docs) => {
      if (err) throw err
      res.status(201).send(docs)
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error ' })
  }
})

router.put('/posts', (req, res) => {
  try {
    PostModel.updateOne({ _id: req.body._id }, req.body, function (err) {
      if (err) throw err
      res.status(204).send({ message: 'successful', status: 'OK' })
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error ' })
  }
})

router.delete('/posts', (req, res) => {
  try {
    PostModel.deleteOne({ _id: req.body._id }, function (err) {
      if (err) throw err
      res.status(204).send({ message: 'successful', status: 'OK' })
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error ' })
  }
})

module.exports = router
