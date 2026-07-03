const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/news', publicController.getNews);
router.get('/random-meal', publicController.getRandomMeal);

module.exports = router;
