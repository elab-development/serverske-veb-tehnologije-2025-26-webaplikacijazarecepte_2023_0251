module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { resetToken: { $exists: false } },
      { $set: { resetToken: null, resetTokenExpires: null } }
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { resetToken: '', resetTokenExpires: '' } }
    );
  },
};
