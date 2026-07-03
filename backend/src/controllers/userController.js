const User = require('../models/User');
const Recipe = require('../models/Recipe');

// GET /api/users
const getAll = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:username
const getByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronadjen' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:username/recipes - nested route: recipes by user
const getRecipesByUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronadjen' });
    }
    const recipes = await Recipe.find({ creator: req.params.username });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getByUsername, getRecipesByUser };
