const mongoose = require('mongoose');
require('dotenv').config();

const Card = require('../src/models/cardModel');

async function checkCards() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    const cards = await Card.find({}).select('title fullName privacy shortLink isActive');
    
    console.log('\n📊 All Cards in Database:');
    console.log(`Total cards: ${cards.length}`);
    
    cards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.title} (${card.privacy}) - ${card.shortLink} - Active: ${card.isActive}`);
    });

    const publicCards = await Card.find({ privacy: 'public', isActive: true });
    const privateCards = await Card.find({ privacy: 'private', isActive: true });
    
    console.log(`\n🔍 Summary:`);
    console.log(`- Public cards: ${publicCards.length}`);
    console.log(`- Private cards: ${privateCards.length}`);
    console.log(`- Total active cards: ${publicCards.length + privateCards.length}`);

  } catch (error) {
    console.error('Error checking cards:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkCards(); 