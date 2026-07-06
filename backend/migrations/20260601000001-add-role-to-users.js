module.exports = {
  
  async up(db) {
    await db.collection('users').updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    // Mark the original admin user
    await db.collection('users').updateOne(
      { username: 'marko123' },
      { $set: { role: 'admin' } }
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { role: '' } }
    );
  },
};
