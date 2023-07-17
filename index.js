const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes/index.routes')
const connectDb = require('./config/connectDb')
const cors = require('cors')
const path = require('path')
require('dotenv').config()


const PORT = process.env.PORT || 7070
const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: '*',
  }));

routes(app)


connectDb()


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))



