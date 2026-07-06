module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { liked: { $exists: false } },
      { $set: { liked: [] } }
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { liked: '' } }
    );
  },
};
