const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');

// GET /api/recipes - populate ratings from Rating collection
const getAll = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('ratings');
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
      Recipe.find(filter).skip(skip).limit(limitNum).populate('ratings'),
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
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/recipes/:id
const getById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id }).populate('ratings');
    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronadjen' });
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
      return res.status(404).json({ message: 'Recept nije pronadjen' });
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
      return res.status(404).json({ message: 'Recept nije pronadjen' });
    }
    // Also delete associated ratings
    await Rating.deleteMany({ recipeId: recipe._id });
    res.json({ message: 'Recept je uspesno obrisan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/recipes/:id/rate - now creates Rating documents
const rate = async (req, res) => {
  try {
    const { username, rating, comment } = req.body;
    const recipe = await Recipe.findOne({ id: parseInt(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: 'Recept nije pronadjen' });
    }

    // Check for existing rating from this user
    const existingRating = await Rating.findOne({
      recipeId: recipe._id,
      username,
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.dateRated = new Date();
      await existingRating.save();
    } else {
      const newRating = new Rating({
        recipeId: recipe._id,
        username,
        rating,
        comment,
        dateRated: new Date(),
      });
      await newRating.save();
      recipe.ratings.push(newRating._id);
    }

    // Recalculate denormalized fields
    const allRatings = await Rating.find({ recipeId: recipe._id });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    recipe.totalRatings = allRatings.length;
    recipe.averageRating = recipe.totalRatings > 0 ? totalRating / recipe.totalRatings : 0;
    await recipe.save();

    const populated = await Recipe.findOne({ id: parseInt(req.params.id) }).populate('ratings');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/recipes/stats
const getStats = async (req, res) => {
  try {
    const stats = await Recipe.aggregate([
      {
        $facet: {
          byTaste: [
            {
              $group: {
                _id: '$taste',
                count: { $sum: 1 },
                avgRating: { $avg: '$averageRating' },
                avgTime: { $avg: '$timeToMake' },
                totalRatings: { $sum: '$totalRatings' },
              },
            },
            { $sort: { count: -1 } },
          ],
          byOccasion: [
            {
              $group: {
                _id: '$occasion',
                count: { $sum: 1 },
                avgRating: { $avg: '$averageRating' },
                avgTime: { $avg: '$timeToMake' },
              },
            },
            { $sort: { count: -1 } },
          ],
          byMethod: [
            {
              $group: {
                _id: '$cookingMethod',
                count: { $sum: 1 },
                avgRating: { $avg: '$averageRating' },
                avgTime: { $avg: '$timeToMake' },
              },
            },
            { $sort: { count: -1 } },
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalRecipes: { $sum: 1 },
                avgOverallRating: { $avg: '$averageRating' },
                avgOverallTime: { $avg: '$timeToMake' },
                totalRatingsCount: { $sum: '$totalRatings' },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    res.json({
      summary: result.summary[0] || {
        totalRecipes: 0,
        avgOverallRating: 0,
        avgOverallTime: 0,
        totalRatingsCount: 0,
      },
      byTaste: result.byTaste,
      byOccasion: result.byOccasion,
      byMethod: result.byMethod,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/recipes/ratings-report - $lookup demo joining Recipe -> Rating
const ratingsReport = async (req, res) => {
  try {
    const report = await Recipe.aggregate([
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'recipeId',
          as: 'ratingDetails',
        },
      },
      { $unwind: { path: '$ratingDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          creator: { $first: '$creator' },
          totalRatings: { $first: '$totalRatings' },
          averageRating: { $first: '$averageRating' },
          latestRating: { $max: '$ratingDetails.dateRated' },
          ratingCount: { $sum: { $cond: [{ $ifNull: ['$ratingDetails._id', false] }, 1, 0] } },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, search, exportCSV, getById, getStats, ratingsReport, create, update, remove, rate };
