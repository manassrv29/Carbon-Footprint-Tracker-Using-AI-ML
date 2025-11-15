#!/usr/bin/env python3
import sys
import json
import numpy as np
import tensorflow as tf
import os
from pathlib import Path

# Get the directory of this script
script_dir = Path(__file__).parent
models_dir = script_dir.parent / 'src' / 'ml_models'

def load_metadata():
    """Load preprocessing metadata"""
    meta_path = models_dir / 'recommendation_v2_meta.json'
    with open(meta_path, 'r') as f:
        return json.load(f)

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

def generate_recommendations(current_emission, input_data, metadata):
    """Generate recommendations for reducing carbon footprint"""
    recommendations = []
    
    # Define emission factors for realistic calculations
    emission_factors = {
        "car": 0.21, "bus": 0.089, "bike": 0.018, 
        "walk": 0.0, "train": 0.041, "EV": 0.045
    }
    diet_factors = {"veg": 1.5, "non-veg": 4.2, "mixed": 2.7}
    
    commute_classes = metadata['le_commute_classes']
    diet_classes = metadata['le_diet_classes']
    distance = input_data['distance_km']
    
    # Generate alternative scenarios
    alternatives = []
    
    for alt_commute in commute_classes:
        for alt_diet in diet_classes:
            # Skip unrealistic combinations
            if distance > 40 and alt_commute in ["walk", "bike"]:
                continue
            if distance > 90 and alt_commute in ["bus"]:
                continue
            if distance < 2 and alt_commute in ["car", "train", "bus"]:
                continue
            
            # Calculate alternative emission
            commute_emission = distance * emission_factors.get(alt_commute, 0.1)
            diet_emission = diet_factors.get(alt_diet, 2.0)
            energy_emission = (input_data['energy_usage_kWh'] / 30) * 0.4
            alt_emission = commute_emission + diet_emission + energy_emission
            
            saving = current_emission - alt_emission
            
            if saving > 0:
                # Assign comfort level
                if alt_commute in ["walk", "bike"] and distance > 30:
                    comfort = "★☆☆ (Low)"
                elif alt_commute in ["bus", "train"]:
                    comfort = "★★★ (Medium)"
                elif alt_commute == "EV":
                    comfort = "★★★★ (High)"
                else:
                    comfort = "★★★★★ (Very High)"
                
                alternatives.append({
                    'commute_mode': alt_commute,
                    'diet_type': alt_diet,
                    'emission_saving': round(saving, 2),
                    'comfort_level': comfort
                })
    
    # Sort by emission saving and return top 3
    alternatives.sort(key=lambda x: x['emission_saving'], reverse=True)
    return alternatives[:3]

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
        
        # Generate recommendations
        recommendations = generate_recommendations(current_emission, input_data, metadata)
        
        # Prepare output
        result = {
            'current_emission': round(current_emission, 2),
            'green_score': green_score,
            'recommendations': recommendations
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'current_emission': 0,
            'green_score': 0,
            'recommendations': []
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
