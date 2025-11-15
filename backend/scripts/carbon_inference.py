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
    meta_path = models_dir / 'carbon_meta.json'
    with open(meta_path, 'r') as f:
        return json.load(f)

def preprocess_input(data, metadata):
    """Preprocess input data for the model"""
    cat_cols = metadata['cat_cols']
    num_cols = metadata['num_cols']
    onehot_categories = metadata['onehot_categories']
    num_scaler_mean = np.array(metadata['num_scaler_mean'])
    num_scaler_scale = np.array(metadata['num_scaler_scale'])
    
    # Map input data to expected format
    input_mapping = {
        'Body Type': data.get('body_type', 'average'),
        'Sex': data.get('sex', 'male'),
        'Diet': data.get('diet', 'omnivore'),
        'Shower': data.get('shower', 'daily'),
        'Heating': data.get('heating', 'gas'),
        'Transport': data.get('transport', 'car'),
        'Vehicle': data.get('vehicle', 'petrol'),
        'Social': data.get('social', 'medium'),
        'Flight': data.get('flight', 'never'),
        'Energy Eff': data.get('energy_eff', 'No'),
        'Recycling': data.get('recycling', 'None'),
        'Cooking': data.get('cooking', 'gas')
    }
    
    # One-hot encode categorical features
    onehot_features = []
    for i, col in enumerate(cat_cols):
        categories = onehot_categories[i]
        value = input_mapping.get(col, categories[0])  # Default to first category
        
        # Create one-hot vector
        onehot_vector = [0.0] * len(categories)
        if value in categories:
            onehot_vector[categories.index(value)] = 1.0
        else:
            onehot_vector[0] = 1.0  # Default to first category
        
        onehot_features.extend(onehot_vector)
    
    # Scale numerical features
    numerical_values = [
        data.get('grocery', 400.0),
        data.get('vehicle_distance', 500.0),
        data.get('waste_weekly', 3.0),
        data.get('tv_daily_hour', 2.0),
        data.get('clothes_monthly', 5.0),
        data.get('internet_daily', 4.0)
    ]
    
    numerical_scaled = (np.array(numerical_values) - num_scaler_mean) / num_scaler_scale
    
    # Combine features
    all_features = np.concatenate([onehot_features, numerical_scaled])
    return all_features.reshape(1, -1).astype(np.float32)

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Load metadata
        metadata = load_metadata()
        
        # Load TFLite model
        model_path = models_dir / 'carbonemission_surrogate.tflite'
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
        emission = float(prediction[0][0])
        
        # Prepare output
        result = {
            'emission': round(max(0, emission), 2)  # Ensure non-negative
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'emission': 0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
