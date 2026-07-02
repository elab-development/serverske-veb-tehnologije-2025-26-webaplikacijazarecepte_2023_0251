const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://root:rootpassword@cloud-recepti-mongodb:27017/cloud-recepti?authSource=admin';

  try {
    await mongoose.connect(uri);
    console.log('Uspešna konekcija na MongoDB');
  } catch (err) {
    console.error('Greška pri konekciji na MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
