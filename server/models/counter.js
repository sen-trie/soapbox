const mongoose = require('mongoose');

const Counter = mongoose.model('Counter', {
    anime: Number,
    fitness: Number,
    gaming: Number,
    nature: Number,
    science: Number,
    technology: Number,
  }, 'counter');
  
module.exports = Counter