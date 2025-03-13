const express = require('express');
const { router, users, events, resetData } = require('./routes');

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(router);

module.exports = { app, users, events, resetData };
