const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend-index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const apiRouter = require('./routes');
app.use('/api', apiRouter);

module.exports = app;
