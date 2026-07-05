const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Javne rute
router.get('/', recipeController.getAll);
router.get('/search', recipeController.search);
router.get('/export', recipeController.exportCSV);
router.get('/ratings-report', recipeController.ratingsReport);
router.get('/stats', recipeController.getStats);
router.get('/:id', recipeController.getById);

// Zaštićene rute (samo ulogovani korisnici)
router.post('/', authenticate, recipeController.create);
router.put('/:id', authenticate, recipeController.update);
router.delete('/:id', authenticate, authorize('admin'), recipeController.remove);

// Ocenjivanje
router.post('/:id/rate', authenticate, recipeController.rate);

module.exports = router;
