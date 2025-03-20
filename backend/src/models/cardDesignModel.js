const mongoose = require('mongoose');

const cardDesignSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true, unique: true },
  designJson: { type: Object, required: true },
  cardImageUrl: { type: String }, // Cloudinary URL
});

module.exports = mongoose.model('CardDesign', cardDesignSchema);
