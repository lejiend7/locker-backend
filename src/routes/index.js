const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'Locker API' });
});

module.exports = router;
