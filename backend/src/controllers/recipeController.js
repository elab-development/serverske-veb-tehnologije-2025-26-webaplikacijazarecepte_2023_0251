const Recipe = require('../models/Recipe');

// GET /api/recipes
const getAll = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/recipes/search
const search = async (req, res) => {
  try {
    const { q, taste, meat, method, maxTime, maxWeight, origin, page, limit } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { creator: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } }
      ];
    }
    if (taste) filter.taste = taste;
    if (meat) filter.meat = meat;
    if (method) filter.cookingMethod = method;
    if (origin) filter.occasion = origin;
    if (maxTime) filter.timeToMake = { $lte: parseInt(maxTime) };
    if (maxWeight) filter.ingredientWeight = { $lte: parseFloat(maxWeight) };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter).skip(skip).limit(limitNum),
      Recipe.countDocuments(filter)
    ]);

    res.json({
      recipes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/recipes/export
const exportCSV = async (req, res) => {
  try {
    const recipes = await Recipe.find().lean();

    const header = 'id,name,creator,taste,meat,occasion,cookingMethod,timeToMake,ingredientWeight,averageRating,totalRatings\n';
    const rows = recipes.map(r =>
      `${r.id},"${r.name}","${r.creator}",${r.taste},${r.meat || ''},${r.occasion},${r.cookingMethod},${r.timeToMake},${r.ingredientWeight},${r.averageRating},${r.totalRatings}`
    ).join('\n');

    const csv = header + rows;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=recipes.csv');
    res.send('\uFEFF' + csv); // BOM za Excel podršku
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/recipes/:id
const getById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronađen' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/recipes
const create = async (req, res) => {
  try {
    const maxId = await Recipe.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;

    const newRecipe = new Recipe({
      ...req.body,
      id: newId,
      ratings: [],
      averageRating: 0,
      totalRatings: 0
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/recipes/:id
const update = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronađen' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/recipes/:id
const remove = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ id: req.params.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronađen' });
    }
    res.json({ message: 'Recept je uspešno obrisan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/recipes/:id/rate
const rate = async (req, res) => {
  try {
    const { username, rating, comment } = req.body;
    const recipe = await Recipe.findOne({ id: parseInt(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronađen' });
    }

    const existingRatingIndex = recipe.ratings.findIndex(r => r.username === username);

    if (existingRatingIndex !== -1) {
      recipe.ratings[existingRatingIndex].rating = rating;
      recipe.ratings[existingRatingIndex].comment = comment;
      recipe.ratings[existingRatingIndex].dateRated = new Date();
    } else {
      recipe.ratings.push({ username, rating, comment, dateRated: new Date() });
    }

    const totalRating = recipe.ratings.reduce((sum, item) => sum + item.rating, 0);
    recipe.totalRatings = recipe.ratings.length;
    recipe.averageRating = recipe.totalRatings > 0 ? totalRating / recipe.totalRatings : 0;

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAll, search, exportCSV, getById, create, update, remove, rate };
