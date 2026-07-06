module.exports = {
  async up(db) {
    const recipes = await db.collection('recipes').find({}).toArray();

    for (const recipe of recipes) {
      if (!recipe.ratings || recipe.ratings.length === 0) continue;

      const ratingDocs = recipe.ratings.map((r) => ({
        recipeId: recipe._id,
        username: r.username,
        rating: r.rating,
        comment: r.comment || '',
        dateRated: new Date(r.dateRated || Date.now()),
      }));

      if (ratingDocs.length > 0) {
        const result = await db.collection('ratings').insertMany(ratingDocs, { ordered: false });
        const insertedIds = Object.values(result.insertedIds);

        await db.collection('recipes').updateOne(
          { _id: recipe._id },
          { $set: { ratings: insertedIds } }
        );
      }
    }
  },

  async down(db) {
    // Re-embed ratings back into recipes
    const recipes = await db.collection('recipes').find({}).toArray();

    for (const recipe of recipes) {
      if (!recipe.ratings || recipe.ratings.length === 0) continue;

      const ratingDocs = await db
        .collection('ratings')
        .find({ _id: { $in: recipe.ratings } })
        .toArray();

      const embedded = ratingDocs.map((r) => ({
        username: r.username,
        rating: r.rating,
        comment: r.comment,
        dateRated: r.dateRated,
      }));

      await db.collection('recipes').updateOne(
        { _id: recipe._id },
        { $set: { ratings: embedded } }
      );
    }

    // Drop the ratings collection
    await db.collection('ratings').drop();
  },
};
