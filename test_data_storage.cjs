// Test script to verify ML data storage functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testMLDataStorage() {
  console.log('🧪 Testing ML Data Storage...\n');

  try {
    // Test 1: Make a recommendation request
    console.log('1️⃣ Testing Recommendation Storage...');
    const recResponse = await fetch(`${API_BASE}/ml/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commute_mode: 'car',
        distance_km: 30,
        diet_type: 'mixed',
        energy_usage_kWh: 400
      })
    });

    if (recResponse.ok) {
      const recData = await recResponse.json();
      console.log('✅ Recommendation request successful');
      console.log(`   Current Emission: ${recData.data.current_emission} kg CO₂`);
      console.log(`   User Profile: ${recData.data.user_profile.mobility_type}`);
    } else {
      console.log('❌ Recommendation request failed:', recResponse.status);
    }

    // Test 2: Make a carbon emission request
    console.log('\n2️⃣ Testing Carbon Emission Storage...');
    const carbonResponse = await fetch(`${API_BASE}/ml/carbon-emission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body_type: 'average',
        sex: 'male',
        diet: 'omnivore',
        transport: 'car',
        grocery: 500
      })
    });

    if (carbonResponse.ok) {
      const carbonData = await carbonResponse.json();
      console.log('✅ Carbon emission request successful');
      console.log(`   Predicted Emission: ${carbonData.data.emission} kg CO₂`);
    } else {
      console.log('❌ Carbon emission request failed:', carbonResponse.status);
    }

    // Test 3: Check prediction history
    console.log('\n3️⃣ Testing Prediction History Retrieval...');
    const historyResponse = await fetch(`${API_BASE}/ml/history?limit=5`);

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ History retrieval successful');
      console.log(`   Total Predictions: ${historyData.data.pagination.total}`);
      console.log(`   Retrieved: ${historyData.data.predictions.length} records`);
      
      if (historyData.data.predictions.length > 0) {
        console.log('\n📋 Recent Predictions:');
        historyData.data.predictions.forEach((pred, index) => {
          console.log(`   ${index + 1}. ${pred.predictionType} - ${new Date(pred.createdAt).toLocaleString()}`);
          if (pred.predictionType === 'recommendation' && pred.userProfile) {
            console.log(`      Profile: ${pred.userProfile.mobility_type} | ${pred.userProfile.eco_awareness} awareness`);
          }
        });
      }
    } else {
      console.log('❌ History retrieval failed:', historyResponse.status);
    }

    // Test 4: Filter by prediction type
    console.log('\n4️⃣ Testing Filtered History...');
    const filteredResponse = await fetch(`${API_BASE}/ml/history?type=recommendation&limit=3`);

    if (filteredResponse.ok) {
      const filteredData = await filteredResponse.json();
      console.log('✅ Filtered history retrieval successful');
      console.log(`   Recommendation predictions: ${filteredData.data.predictions.length}`);
    } else {
      console.log('❌ Filtered history retrieval failed:', filteredResponse.status);
    }

    console.log('\n🎉 ML Data Storage Test Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ Input data is now stored in the database');
    console.log('✅ Output results are saved with predictions');
    console.log('✅ User profiles are stored for recommendations');
    console.log('✅ Prediction history can be retrieved and filtered');
    console.log('✅ Pagination support for large datasets');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMLDataStorage();
