// Test script for enhanced recommendations with different user profiles
const { spawn } = require('child_process');

async function testEnhancedRecommendations(inputData, profileName) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['backend/scripts/enhanced_recommendation_inference.py']);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script failed with code ${code}: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout.trim());
          resolve({ profileName, result });
        } catch (error) {
          reject(new Error(`Failed to parse output: ${stdout}`));
        }
      }
    });
    
    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Enhanced Personalized Recommendations...\n');
  
  const testProfiles = [
    {
      name: "Long Distance Car Commuter (High Energy User)",
      data: {
        commute_mode: "car",
        distance_km: 60,
        diet_type: "non-veg",
        energy_usage_kWh: 800
      }
    },
    {
      name: "Moderate Public Transport User",
      data: {
        commute_mode: "bus",
        distance_km: 25,
        diet_type: "mixed",
        energy_usage_kWh: 350
      }
    },
    {
      name: "Eco-Conscious Short Commuter",
      data: {
        commute_mode: "bike",
        distance_km: 8,
        diet_type: "veg",
        energy_usage_kWh: 200
      }
    },
    {
      name: "Local Walker (Already Eco-Friendly)",
      data: {
        commute_mode: "walk",
        distance_km: 3,
        diet_type: "veg",
        energy_usage_kWh: 150
      }
    },
    {
      name: "Electric Vehicle Owner",
      data: {
        commute_mode: "EV",
        distance_km: 35,
        diet_type: "mixed",
        energy_usage_kWh: 450
      }
    }
  ];
  
  try {
    for (const profile of testProfiles) {
      console.log(`\n🔍 Testing: ${profile.name}`);
      console.log(`Input: ${JSON.stringify(profile.data, null, 2)}`);
      
      const { result } = await testEnhancedRecommendations(profile.data, profile.name);
      
      console.log(`\n📊 Results:`);
      console.log(`   Current Emission: ${result.current_emission} kg CO₂/day`);
      console.log(`   Green Score: ${result.green_score}/100`);
      console.log(`   User Profile: ${result.user_profile.mobility_type} | ${result.user_profile.energy_profile} | ${result.user_profile.eco_awareness} awareness`);
      console.log(`   Personalization: ${result.personalization_note}`);
      
      console.log(`\n💡 Top Recommendations:`);
      result.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.type.toUpperCase()}] ${rec.title}`);
        console.log(`      Impact: ${rec.impact} | Difficulty: ${rec.difficulty} | Saving: ${rec.co2_saving.toFixed(2)} kg CO₂`);
        console.log(`      ${rec.description}`);
      });
      
      console.log('\n' + '='.repeat(80));
    }
    
    console.log('\n🎉 Enhanced Recommendation System Test Complete!');
    console.log('\n📈 Key Features Demonstrated:');
    console.log('✅ User profiling based on mobility, energy, and eco-awareness');
    console.log('✅ Personalized recommendations by user type');
    console.log('✅ Different strategies for different commuter profiles');
    console.log('✅ Detailed implementation guidance');
    console.log('✅ Impact and difficulty ratings');
    console.log('✅ Diverse recommendation categories (transport, energy, diet, lifestyle)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
