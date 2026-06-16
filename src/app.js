const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const apiRouter = require('./routes');
app.use('/api', apiRouter);

module.exports = app;
