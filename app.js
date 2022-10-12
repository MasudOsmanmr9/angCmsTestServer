const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3000


const collection = require('./router/collectionroutes.js');
const users = require('./router/userrouters');
const auth = require('./router/auth');


var cors = require('cors')
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// routes
app.use('/collection', collection)
app.use('/users', users)
app.use('/auth', auth)

app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




