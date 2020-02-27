require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
      res.status(500).send({ message: 'server side error' })
    }
  })
})

router.get('/users', authenticateToken, (req, res) => {
  try {
    UserModel.findOne({ emailid: req.body.emailid }, async (err, docs) => {
      if (err) throw (err)
      return res.status(200).send({ userName: docs.userName })
    })
  } catch (err) {
    res.status(500).send({ message: 'server side error' })
  }
})
module.exports = router
