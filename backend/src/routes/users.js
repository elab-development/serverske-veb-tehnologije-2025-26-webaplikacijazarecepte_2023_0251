const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAll);
router.get('/:username/recipes', userController.getRecipesByUser);
router.get('/:username', userController.getByUsername);

module.exports = router;
