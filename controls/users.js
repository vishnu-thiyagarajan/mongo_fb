const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserModel = mongoose.model('Users')
const router = express.Router()

router.post('/users', async (req, res) => {
  try {
    const hassedPswd = await bcrypt.hash(req.body.password, 10)
    const user = new UserModel()
    user.emailid = req.body.emailid
    user.password = hassedPswd
    user.createdAt = new Date().toISOString()
    user.save((err, docs) => {
      if (err) throw err
      res.status(201).send({ message: 'successful', status: 'OK' })
    })
  } catch (err) {
    res.status(500).send({ message: 'server side error' })
  }
})

router.post('/login', (req, res) => {
  UserModel.findOne({ emailid: req.body.emailid }, async function (err, docs) {
    if (err) throw (err)
    if (!docs) return res.status(400).send({ message: 'cannot find user' })
    try {
      if (await bcrypt.compare(req.body.password, docs.password)) return res.send('logged in')
      return res.send({ message: 'wrong password' })
    } catch (err) {
      res.status(500).send({ message: 'server side error' })
    }
  })
})

module.exports = router
