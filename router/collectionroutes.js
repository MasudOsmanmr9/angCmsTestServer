const express = require('express')
const router = express.Router()
const { dbInit } = require('../db.connection');
const {collectionApis} = require('../controller/collectionController');
const {authenticateToken} = require('../middleware/jwtverify')


  const CollectionApi = new collectionApis();



  router.post('/saveCollection', authenticateToken,(req, res, next) => CollectionApi.saveCollection(req, res).catch(next))
  router.get('/getCollections', authenticateToken,(req, res, next) => CollectionApi.getCollections(req, res).catch(next))
  router.post('/authenticatednavitems', (req, res, next) => CollectionApi.getAuthenticatedCollections(req, res).catch(next))



module.exports = router