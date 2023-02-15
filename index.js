require('dotenv').config();

const express = require('express');
const cors = require("cors")
const mongoose = require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const mongoString = process.env.DATABASE_URL;
const routes = require('./routes/routes');

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(cors())
app.use(express.json());
app.use('/api', routes)

app.listen(3001, () => {
    console.log(`Server Started at ${3001}`)
})