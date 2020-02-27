const express = require('express')
const mongoose = require('mongoose')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v1')

const authenticateToken = require('./auth')
const PostModel = mongoose.model('Posts')
const router = express.Router()

router.get('/posts/:offSet/:limit', authenticateToken, (req, res) => {
  try {
    var offSet = Number(req.params.offSet)
    var limit = Number(req.params.limit)
    PostModel.find().skip(offSet).limit(limit).sort({ createdAt: -1 }).exec((err, docs) => {
      if (err) throw err
      res.status(200).send(docs)
    })
  } catch (err) {
    if (isNaN(offSet) || isNaN(limit)) return res.status(403).send({ message: 'offset and limit is needed' })
    console.log(err)
    res.status(500).send({ message: 'server side error' })
  }
})

router.post('/posts', authenticateToken, (req, res) => {
  const form = new formidable.IncomingForm()
  const imgHash = uuid()
  const fields = {}
  form.parse(req)
  form.on('field', (name, field) => {
    fields[name] = field
  })
  form.on('fileBegin', function (name, file) {
    fields.fileName = imgHash + '.' + file.name.split('.').pop()
    file.path = path.join(__dirname, '/uploads/', fields.fileName)
  })
  form.on('error', (err) => {
    res.status(500).send({ message: 'server side error' })
    throw err
  })
  form.on('end', () => {
    if (!fields.userName && !fields.userHandle && !(fields.fileName || fields.body)) return res.status(403).send({ message: 'insufficient data' })
    try {
      var post = new PostModel()
      post.body = fields.body || ''
      post.userHandle = fields.userHandle
      post.userName = fields.userName
      post.fileName = fields.fileName || ''
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
})

router.put('/posts', authenticateToken, (req, res) => {
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

router.delete('/posts', authenticateToken, (req, res) => {
  try {
    PostModel.deleteOne({ _id: req.body._id }, function (err) {
      if (err) throw err
      if (req.body.fileName) {
        const filePath = path.join(__dirname, '/uploads/', req.body.fileName)
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) throw err
          })
        }
      }
      res.status(204).send({ message: 'successful', status: 'OK' })
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error ' })
  }
})

module.exports = router
