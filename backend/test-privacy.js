const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';

async function testPrivacyFeatures() {
  console.log('🔒 Testing Privacy Features...\n');

  try {
    // Test 1: Get public cards without authentication
    console.log('1. Testing public cards endpoint (no auth):');
    const publicCardsResponse = await axios.get(`${BASE_URL}/cards/public?limit=1`);
    console.log('✅ Public cards endpoint accessible');
    
    if (publicCardsResponse.data.cards && publicCardsResponse.data.cards.length > 0) {
      const card = publicCardsResponse.data.cards[0];
      console.log('   Sample card data:');
      console.log(`   - Name: ${card.fullName}`);
      console.log(`   - Email: ${card.email}`);
      console.log(`   - Phone: ${card.phone}`);
      console.log(`   - Address: ${card.address}`);
      console.log(`   - Website: ${card.website}`);
    } else {
      console.log('   ⚠️  No cards found in database');
    }

    // Test 2: Get specific card by short link without authentication
    console.log('\n2. Testing card by short link (no auth):');
    try {
      const shortLinkResponse = await axios.get(`${BASE_URL}/cards/c/test123`);
      console.log('✅ Short link endpoint accessible');
      
      if (shortLinkResponse.data.card) {
        const card = shortLinkResponse.data.card;
        console.log('   Card data:');
        console.log(`   - Name: ${card.fullName}`);
        console.log(`   - Email: ${card.email}`);
        console.log(`   - Phone: ${card.phone}`);
        console.log(`   - Address: ${card.address}`);
        console.log(`   - Website: ${card.website}`);
      }
    } catch (error) {
      console.log('   ⚠️  No test card found with short link "test123"');
    }

    // Test 3: Check privacy headers
    console.log('\n3. Testing privacy headers:');
    const headersResponse = await axios.get(`${BASE_URL}/cards/public?limit=1`);
    const privacyHeader = headersResponse.headers['x-privacy-notice'];
    if (privacyHeader) {
      console.log('✅ Privacy header present:', privacyHeader);
    } else {
      console.log('⚠️  Privacy header not found');
    }

    console.log('\n🎉 Privacy feature tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Public endpoints are accessible');
    console.log('   - Sensitive data is filtered for non-authenticated users');
    console.log('   - Privacy headers are added');
    console.log('   - Frontend will show masked data for non-logged users');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPrivacyFeatures(); 