module.exports = {
  async up(db) {
    // This migration documents the enum expansions.
    // Mongoose enums are validated at the application layer, not at the database level.
    // Existing documents with 'mešano' or 'sirovo' are already valid in MongoDB.
    // The model schema was updated to include these values.
    console.log('Enum values mešano (meat) and sirovo (cookingMethod) added to Recipe model schema.');
  },

  async down(db) {
    // Schema-only change - no data rollback needed.
    // Documents with 'mešano' or 'sirovo' remain in DB but would be rejected by pre-migration model.
    console.log('Enum expansion reverted in schema. Existing docs with these values remain unchanged.');
  },
};
