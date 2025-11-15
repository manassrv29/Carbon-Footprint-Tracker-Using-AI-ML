#!/usr/bin/env python3
import sys
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

# Get the directory of this script
script_dir = Path(__file__).parent
models_dir = script_dir.parent / 'src' / 'ml_models'

def load_metadata():
    """Load preprocessing metadata"""
    meta_path = models_dir / 'recommendation_v2_meta.json'
    with open(meta_path, 'r') as f:
        return json.load(f)

def determine_user_profile(input_data):
    """Determine user profile based on input characteristics"""
    distance = input_data['distance_km']
    energy = input_data['energy_usage_kWh']
    commute = input_data['commute_mode']
    diet = input_data['diet_type']
    
    # Determine user type
    if distance > 50:
        mobility_type = "long_distance_commuter"
    elif distance > 20:
        mobility_type = "moderate_commuter"
    elif distance > 5:
        mobility_type = "short_commuter"
    else:
        mobility_type = "local_traveler"
    
    # Energy consumption profile
    if energy > 600:
        energy_profile = "high_consumer"
    elif energy > 300:
        energy_profile = "average_consumer"
    else:
        energy_profile = "low_consumer"
    
    # Environmental awareness level
    eco_score = 0
    if commute in ["bike", "walk", "EV"]:
        eco_score += 2
    elif commute in ["train", "bus"]:
        eco_score += 1
    
    if diet == "veg":
        eco_score += 2
    elif diet == "mixed":
        eco_score += 1
    
    if energy < 300:
        eco_score += 1
    
    if eco_score >= 4:
        eco_awareness = "high"
    elif eco_score >= 2:
        eco_awareness = "moderate"
    else:
        eco_awareness = "low"
    
    return {
        "mobility_type": mobility_type,
        "energy_profile": energy_profile,
        "eco_awareness": eco_awareness,
        "eco_score": eco_score
    }

def get_personalized_recommendations(current_emission, input_data, metadata, user_profile):
    """Generate personalized recommendations based on user profile"""
    recommendations = []
    
    # Enhanced emission factors with seasonal variations
    emission_factors = {
        "car": 0.21, "bus": 0.089, "bike": 0.018, 
        "walk": 0.0, "train": 0.041, "EV": 0.045
    }
    diet_factors = {"veg": 1.5, "non-veg": 4.2, "mixed": 2.7}
    
    distance = input_data['distance_km']
    current_commute = input_data['commute_mode']
    current_diet = input_data['diet_type']
    current_energy = input_data['energy_usage_kWh']
    
    # Profile-specific recommendation strategies
    if user_profile["mobility_type"] == "long_distance_commuter":
        # Focus on efficient transport modes and energy savings
        priority_recommendations = [
            {
                "type": "transport",
                "title": "Consider Carpooling or Ride-sharing",
                "description": f"For your {distance}km daily commute, carpooling can reduce emissions by 50-75%",
                "impact": "High",
                "difficulty": "Easy",
                "co2_saving": current_emission * 0.5,
                "implementation": "Use apps like BlaBlaCar or organize with colleagues"
            },
            {
                "type": "transport", 
                "title": "Hybrid Work Schedule",
                "description": "Work from home 2-3 days per week to reduce commute frequency",
                "impact": "Very High",
                "difficulty": "Medium",
                "co2_saving": current_emission * 0.4,
                "implementation": "Discuss flexible work arrangements with your employer"
            }
        ]
    
    elif user_profile["mobility_type"] == "moderate_commuter":
        priority_recommendations = [
            {
                "type": "transport",
                "title": "Switch to Public Transportation",
                "description": f"Replace car trips with train/bus for your {distance}km commute",
                "impact": "High",
                "difficulty": "Medium",
                "co2_saving": distance * (emission_factors["car"] - emission_factors["train"]),
                "implementation": "Check local transit schedules and monthly pass options"
            },
            {
                "type": "transport",
                "title": "Electric Vehicle Transition",
                "description": "Consider switching to an electric vehicle for daily commuting",
                "impact": "Very High",
                "difficulty": "High",
                "co2_saving": distance * (emission_factors["car"] - emission_factors["EV"]),
                "implementation": "Research EV models, charging infrastructure, and incentives"
            }
        ]
    
    elif user_profile["mobility_type"] == "short_commuter":
        priority_recommendations = [
            {
                "type": "transport",
                "title": "Cycling Infrastructure",
                "description": f"Bike to work for your {distance}km commute - great exercise too!",
                "impact": "High",
                "difficulty": "Medium",
                "co2_saving": distance * emission_factors["car"],
                "implementation": "Invest in a good bike, helmet, and check cycling routes"
            },
            {
                "type": "transport",
                "title": "Walking + Public Transport Combo",
                "description": "Walk to nearest transit stop and use public transport",
                "impact": "Medium",
                "difficulty": "Easy",
                "co2_saving": distance * (emission_factors["car"] - emission_factors["bus"]) * 0.8,
                "implementation": "Plan multi-modal routes using transit apps"
            }
        ]
    
    else:  # local_traveler
        priority_recommendations = [
            {
                "type": "transport",
                "title": "Active Transportation",
                "description": "Walk or bike for most of your local trips",
                "impact": "Medium",
                "difficulty": "Easy", 
                "co2_saving": distance * emission_factors.get(current_commute, 0.1),
                "implementation": "Plan walking/cycling routes, invest in comfortable shoes/bike"
            }
        ]
    
    # Energy-specific recommendations based on consumption profile
    if user_profile["energy_profile"] == "high_consumer":
        energy_recommendations = [
            {
                "type": "energy",
                "title": "Smart Home Energy Audit",
                "description": f"Your {current_energy}kWh usage is high - identify energy waste",
                "impact": "Very High",
                "difficulty": "Medium",
                "co2_saving": (current_energy * 0.3 / 30) * 0.4,
                "implementation": "Use smart plugs, LED bulbs, and energy-efficient appliances"
            },
            {
                "type": "energy",
                "title": "Solar Panel Installation",
                "description": "Generate renewable energy to offset high consumption",
                "impact": "Very High",
                "difficulty": "High",
                "co2_saving": (current_energy * 0.8 / 30) * 0.4,
                "implementation": "Get solar quotes, check local incentives and net metering"
            }
        ]
    elif user_profile["energy_profile"] == "average_consumer":
        energy_recommendations = [
            {
                "type": "energy",
                "title": "Energy Efficiency Upgrades",
                "description": "Small changes can reduce your energy usage by 15-20%",
                "impact": "Medium",
                "difficulty": "Easy",
                "co2_saving": (current_energy * 0.2 / 30) * 0.4,
                "implementation": "Programmable thermostat, LED lighting, unplug devices"
            }
        ]
    else:
        energy_recommendations = [
            {
                "type": "energy",
                "title": "Maintain Efficient Habits",
                "description": "You're already doing great! Consider renewable energy",
                "impact": "Low",
                "difficulty": "Easy",
                "co2_saving": (current_energy * 0.1 / 30) * 0.4,
                "implementation": "Switch to renewable energy provider if available"
            }
        ]
    
    # Diet-specific recommendations
    if current_diet == "non-veg":
        diet_recommendations = [
            {
                "type": "diet",
                "title": "Meatless Monday Challenge",
                "description": "Start with one plant-based day per week",
                "impact": "Medium",
                "difficulty": "Easy",
                "co2_saving": (diet_factors["non-veg"] - diet_factors["mixed"]) * 0.3,
                "implementation": "Try new vegetarian recipes, explore plant-based proteins"
            },
            {
                "type": "diet",
                "title": "Reduce Red Meat Consumption",
                "description": "Replace beef with chicken, fish, or plant proteins",
                "impact": "High",
                "difficulty": "Medium",
                "co2_saving": (diet_factors["non-veg"] - diet_factors["mixed"]) * 0.6,
                "implementation": "Plan meals with less carbon-intensive proteins"
            }
        ]
    elif current_diet == "mixed":
        diet_recommendations = [
            {
                "type": "diet",
                "title": "Increase Plant-Based Meals",
                "description": "Aim for 4-5 vegetarian days per week",
                "impact": "Medium",
                "difficulty": "Medium",
                "co2_saving": (diet_factors["mixed"] - diet_factors["veg"]) * 0.7,
                "implementation": "Discover new vegetarian cuisines and recipes"
            }
        ]
    else:
        diet_recommendations = [
            {
                "type": "diet",
                "title": "Local & Seasonal Eating",
                "description": "You're plant-based! Focus on local, seasonal produce",
                "impact": "Low",
                "difficulty": "Easy",
                "co2_saving": 0.2,
                "implementation": "Shop at farmers markets, grow herbs at home"
            }
        ]
    
    # Combine all recommendations
    all_recommendations = priority_recommendations + energy_recommendations + diet_recommendations
    
    # Add lifestyle recommendations based on eco-awareness
    if user_profile["eco_awareness"] == "low":
        lifestyle_recommendations = [
            {
                "type": "lifestyle",
                "title": "Carbon Tracking App",
                "description": "Start monitoring your daily carbon footprint",
                "impact": "Medium",
                "difficulty": "Easy",
                "co2_saving": current_emission * 0.1,
                "implementation": "Use apps to track and gamify carbon reduction"
            }
        ]
    elif user_profile["eco_awareness"] == "moderate":
        lifestyle_recommendations = [
            {
                "type": "lifestyle",
                "title": "Eco-Friendly Shopping",
                "description": "Choose products with lower environmental impact",
                "impact": "Medium",
                "difficulty": "Easy",
                "co2_saving": current_emission * 0.05,
                "implementation": "Buy local, reduce packaging, choose sustainable brands"
            }
        ]
    else:
        lifestyle_recommendations = [
            {
                "type": "lifestyle",
                "title": "Community Leadership",
                "description": "Share your eco-knowledge and inspire others",
                "impact": "Very High",
                "difficulty": "Medium",
                "co2_saving": current_emission * 0.2,  # Multiplier effect
                "implementation": "Organize community events, mentor others in sustainability"
            }
        ]
    
    all_recommendations.extend(lifestyle_recommendations)
    
    # Sort by impact and feasibility
    def recommendation_score(rec):
        impact_scores = {"Very High": 4, "High": 3, "Medium": 2, "Low": 1}
        difficulty_scores = {"Easy": 3, "Medium": 2, "High": 1}
        return impact_scores.get(rec["impact"], 1) * difficulty_scores.get(rec["difficulty"], 1)
    
    all_recommendations.sort(key=recommendation_score, reverse=True)
    
    return all_recommendations[:6]  # Return top 6 recommendations

def preprocess_input(data, metadata):
    """Preprocess input data for the model"""
    # Map commute mode to encoded value
    commute_classes = metadata['le_commute_classes']
    diet_classes = metadata['le_diet_classes']
    
    try:
        commute_encoded = commute_classes.index(data['commute_mode'])
    except ValueError:
        commute_encoded = 0  # Default to first class if not found
    
    try:
        diet_encoded = diet_classes.index(data['diet_type'])
    except ValueError:
        diet_encoded = 0  # Default to first class if not found
    
    # Create feature vector
    features = np.array([[
        commute_encoded,
        data['distance_km'],
        diet_encoded,
        data['energy_usage_kWh']
    ]], dtype=np.float32)
    
    # Apply scaling
    scaler_mean = np.array(metadata['scaler_mean'], dtype=np.float32)
    scaler_scale = np.array(metadata['scaler_scale'], dtype=np.float32)
    features_scaled = (features - scaler_mean) / scaler_scale
    
    return features_scaled.astype(np.float32)

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Load metadata
        metadata = load_metadata()
        
        # Load TFLite model
        model_path = models_dir / 'recommendation_model_v2.tflite'
        interpreter = tf.lite.Interpreter(model_path=str(model_path))
        interpreter.allocate_tensors()
        
        # Get input and output tensors
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Preprocess input
        features = preprocess_input(input_data, metadata)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], features)
        interpreter.invoke()
        
        # Get prediction
        prediction = interpreter.get_tensor(output_details[0]['index'])
        current_emission = float(prediction[0][0])
        
        # Calculate green score
        green_score = max(0, 100 - (current_emission / 0.7))
        green_score = min(100, round(green_score, 2))
        
        # Determine user profile
        user_profile = determine_user_profile(input_data)
        
        # Generate personalized recommendations
        recommendations = get_personalized_recommendations(current_emission, input_data, metadata, user_profile)
        
        # Prepare output
        result = {
            'current_emission': round(current_emission, 2),
            'green_score': green_score,
            'user_profile': user_profile,
            'recommendations': recommendations,
            'personalization_note': f"Recommendations tailored for {user_profile['mobility_type']} with {user_profile['eco_awareness']} environmental awareness"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'current_emission': 0,
            'green_score': 0,
            'user_profile': {},
            'recommendations': []
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
