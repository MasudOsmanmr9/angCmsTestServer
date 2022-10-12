const express = require('express')
const router = express.Router()
const { dbInit } = require('../db.connection');
const {usersApis} = require('../controller/userController');


const  UsersApis = new usersApis();


router.post('/createUsers', (req, res, next) => UsersApis.createUser(req, res).catch(next))
router.get('/getUsers',(req, res, next) => UsersApis.getUsers(req, res).catch(next))

module.exports = router