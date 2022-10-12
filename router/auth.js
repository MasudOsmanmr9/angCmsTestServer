const express = require('express')
const router = express.Router()
const { dbInit } = require('../db.connection');
const {authApis} = require('../controller/auth');


const  AuthApis = new authApis();


router.post('/signin', (req, res, next) => AuthApis.SignIn(req, res).catch(next))

module.exports = router