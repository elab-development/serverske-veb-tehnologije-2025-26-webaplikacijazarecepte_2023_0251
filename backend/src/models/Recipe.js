const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  creator: {
    type: String,
    required: true,
    ref: 'User'
  },
  taste: {
    type: String,
    required: true,
    enum: ['slatko', 'slano', 'ljuto', 'kiselo']
  },
  meat: {
    type: String,
    enum: ['', 'piletina', 'curetina', 'svinjetina', 'govedina', 'jagnjetina', 'teletina', 'riba', 'morski-plodovi', 'mešano']
  },
  occasion: {
    type: String,
    required: true,
    enum: ['dorucak', 'rucak', 'vecera', 'uzina', 'desert']
  },
  cookingMethod: {
    type: String,
    required: true,
    enum: ['przeno', 'peceno', 'kuvano', 'grilovano', 'dimljeno', 'dinstano', 'marinado', 'bareno', 'sirovo']
  },
  timeToMake: {
    type: Number,
    required: true,
    min: 1,
    max: 1440
  },
  ingredientWeight: {
    type: Number,
    required: true,
    min: 0.1,
    max: 50
  },
  ingredients: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating',
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
