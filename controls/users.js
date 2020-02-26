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

// let refreshTokens = []

// router.post('/token', (req, res) => {
//   const refreshToken = req.body.token
//   if (refreshToken == null) return res.sendStatus(401)
//   if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
//     if (err) return res.sendStatus(403)
//     const accessToken = jwt.sign({ emailid: data.emailid }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
//     res.json({ accessToken: accessToken })
//   })
// })

// router.delete('/logout', (req, res) => {
//   refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//   res.sendStatus(204)
// })

router.post('/login', (req, res) => {
  console.log('88888888888888888888888888888888')
  if (!req.body.emailid) res.status(403).send({ message: 'Emailid needed' })
  const user = { emailid: req.body.emailid }
  UserModel.findOne(user, async function (err, docs) {
    if (err) throw (err)
    if (!docs) return res.status(404).send({ message: 'cannot find user' })
    try {
      if (await bcrypt.compare(req.body.password, docs.password)) {
        const accessToken = jwt.sign({ emailid: req.body.emailid, user: docs.userName }, process.env.ACCESS_TOKEN_SECRET)
        console.log(docs)
        // res.cookie('SocializeAccessToken', accessToken)
        return res.status(200).send({ accessToken: accessToken, loggedUser: docs.emailid })
      }
      return res.status(403).send({ message: 'wrong password' })
    } catch (err) {
      res.status(500).send({ message: 'server side error' })
    }
  })
})

module.exports = router
