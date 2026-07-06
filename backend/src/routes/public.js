const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/meal-search', publicController.getMealSearch);
router.get('/random-meal', publicController.getRandomMeal);

module.exports = router;
