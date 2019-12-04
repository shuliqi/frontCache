var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.setHeader('Cache-Control', 'max-age=3600000000');
  return res.json({ name: 'shuliqi' });
});

module.exports = router;
