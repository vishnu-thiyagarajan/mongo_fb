require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const uuid = require('uuid/v1')
const formidable = require('formidable')
const fs = require('fs')

const authenticateToken = require('./auth')
const UserModel = mongoose.model('Users')
const router = express.Router()

router.post('/users', async (req, res) => {
  try {
    const hassedPswd = await bcrypt.hash(req.body.password, 10)
    const user = new UserModel()
    user.emailid = req.body.emailid
    user.userName = req.body.userName
    user.password = hassedPswd
    user.createdAt = new Date().toISOString()
    UserModel.findOne({ emailid: req.body.emailid }, async (err, docs) => {
      if (err) throw (err)
      if (docs) return res.status(403).send({ message: 'User already exists' })
      user.save((err, docs) => {
        if (err) throw err
        res.status(201).send({ message: 'signed up new user' })
      })
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error' })
  }
})

router.post('/login', (req, res) => {
  if (!req.body.emailid) res.status(403).send({ message: 'Emailid needed' })
  const user = { emailid: req.body.emailid }
  UserModel.findOne(user, async function (err, docs) {
    if (err) throw (err)
    if (!docs) return res.status(404).send({ message: 'cannot find user' })
    try {
      if (await bcrypt.compare(req.body.password, docs.password)) {
        const accessToken = jwt.sign({ emailid: req.body.emailid, user: docs.userName }, process.env.ACCESS_TOKEN_SECRET)
        return res.status(200).send({ accessToken: accessToken, loggedEmail: docs.emailid, loggedUser: docs.userName })
      }
      return res.status(403).send({ message: 'wrong password' })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: 'server side error' })
    }
  })
})

router.get('/users/:email', authenticateToken, (req, res) => {
  try {
    UserModel.findOne({ emailid: req.params.email }, (err, docs) => {
      if (err) throw (err)
      if (docs) res.status(200).send({ userName: docs.userName, dp: docs.dp })
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'server side error' })
  }
})

router.put('/users/dp', authenticateToken, (req, res) => {
  const form = new formidable.IncomingForm()
  const imgHash = uuid()
  const fields = {}
  form.parse(req)
  form.on('field', (name, field) => {
    fields[name] = field
  })
  form.on('fileBegin', function (name, file) {
    fields.fileName = imgHash + '.' + file.name.split('.').pop()
    file.path = path.join(__dirname, '/uploads/dp/', fields.fileName)
  })
  form.on('error', (err) => {
    res.status(500).send({ message: 'server side error' })
    throw err
  })
  form.on('end', async () => {
    if (!fields.emailid && !fields.fileName) return res.status(403).send({ message: 'insufficient data' })
    try {
      await UserModel.findOne({ emailid: fields.emailid }, (err, docs) => {
        if (err) throw (err)
        if (!docs) return res.status(404).send({ message: 'cannot find user' })
        if (docs.dp) {
          const filePath = path.join(__dirname, '/uploads/dp/', docs.dp)
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) throw err
            })
          }
        }
      })
      await UserModel.updateOne({ emailid: fields.emailid }, { dp: fields.fileName }, (err) => {
        if (err) throw err
        res.status(201).send({ fileName: fields.fileName, status: 'OK' })
      })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: 'server side error ' })
    }
  })
})

module.exports = router
