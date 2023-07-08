
const router = express.Router();


const express = require('express');
const redis = require('redis');
const auth = require('./auth-token');

const schema = require('./schema');

const app = express();

const bodyParser = require("body-parser"); 
const db = require('./dbConnection');