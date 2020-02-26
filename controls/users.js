require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
    user.save((err, docs) => {
      if (err) throw err
      const accessToken = jwt.sign({ emailid: user.emailid }, process.env.ACCESS_TOKEN_SECRET)
      const refreshToken = jwt.sign({ emailid: user.emailid }, process.env.REFRESH_TOKEN_SECRET)
      res.status(201).send({ accessToken: accessToken, refreshToken: refreshToken })
    })
  } catch (err) {
    res.status(500).send({ message: 'server side error' })
  }
})

let refreshTokens = []

router.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403)
    const accessToken = jwt.sign({ emailid: data.emailid }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
    res.json({ accessToken: accessToken })
  })
})

router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

router.post('/login', (req, res) => {
  if (!req.body.emailid) res.status(403).send({ message: 'Emailid needed' })
  const user = { emailid: req.body.emailid }
  UserModel.findOne({ emailid: req.body.emailid }, async function (err, docs) {
    if (err) throw (err)
    if (!docs) return res.status(403).send({ message: 'cannot find user' })
    try {
      if (await bcrypt.compare(req.body.password, docs.password)) {
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        res.status(200).send({ accessToken: accessToken, refreshToken: refreshToken })
      }
      return res.status(403).send({ message: 'wrong password' })
    } catch (err) {
      res.status(500).send({ message: 'server side error' })
    }
  })
})

module.exports = router
