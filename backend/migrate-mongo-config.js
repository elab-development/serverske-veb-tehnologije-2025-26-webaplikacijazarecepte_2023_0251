const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://root:rootpassword@mongodb:27017/steh-recepti?authSource=admin',
    databaseName: 'steh-recepti',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
