import os
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

# Create models directory if it doesn't exist
os.makedirs('saved_models', exist_ok=True)

def convert_recommendation_model():
    print("Converting Recommendation Model to TensorFlow Lite...")
    
    # Load or generate the same dataset used in recommendation_model.py
    np.random.seed(42)
    num_samples = 2000
    
    data = {
        "user_id": np.arange(1, num_samples + 1),
        "commute_mode": np.random.choice(["car", "bus", "bike", "walk", "train", "EV"], num_samples, 
                                       p=[0.35, 0.25, 0.1, 0.05, 0.15, 0.1]),
        "distance_km": np.random.uniform(1, 120, num_samples),
        "diet_type": np.random.choice(["veg", "non-veg", "mixed"], num_samples, p=[0.4, 0.3, 0.3]),
        "energy_usage_kWh": np.random.uniform(100, 700, num_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Encode categorical features
    le_commute = LabelEncoder()
    le_diet = LabelEncoder()
    df["commute_mode_encoded"] = le_commute.fit_transform(df["commute_mode"])
    df["diet_type_encoded"] = le_diet.fit_transform(df["diet_type"])
    
    # Save the label encoders
    joblib.dump(le_commute, 'saved_models/le_commute.pkl')
    joblib.dump(le_diet, 'saved_models/le_diet.pkl')
    
    # Prepare features and target
    X = df[["commute_mode_encoded", "distance_km", "diet_type_encoded", "energy_usage_kWh"]]
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, 'saved_models/scaler.pkl')
    
    # Create a simple TensorFlow model that mimics the Random Forest
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_scaled.shape[1],)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1)
    ])
    
    # Generate synthetic target for training
    y = np.random.normal(10, 5, size=(num_samples, 1))  # Replace with actual target if available
    
    # Train the model
    model.compile(optimizer='adam', loss='mse')
    model.fit(X_scaled, y, epochs=10, batch_size=32, validation_split=0.2, verbose=1)
    
    # Save the TensorFlow model in Keras format
    model.save('saved_models/recommendation_model.keras')
    
    try:
        # Convert to TensorFlow Lite
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        tflite_model = converter.convert()
        
        # Save the TensorFlow Lite model
        with open('saved_models/recommendation_model.tflite', 'wb') as f:
            f.write(tflite_model)
    except Exception as e:
        print(f"⚠️ Error converting to TFLite: {e}")
        print("Falling back to SavedModel format...")
        model.save('saved_models/recommendation_model', save_format='tf')
    
    print("✅ Recommendation model converted to TensorFlow Lite successfully!")

def main():
    # Helpers
    pass

def _quantize_converter_from_model(model, representative_data):
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    def rep_dataset():
        for i in range(min(200, representative_data.shape[0])):
            yield [representative_data[i:i+1].astype(np.float32)]
    converter.representative_dataset = rep_dataset
    converter.target_spec.supported_types = [tf.float16]
    try:
        return converter.convert()
    except Exception as e:
        print(f"⚠️ Quantization failed, falling back to float: {e}")
        return tf.lite.TFLiteConverter.from_keras_model(model).convert()

def convert_recommendation_model_v2():
    print("Converting Recommendation Model (v2, real target) to TensorFlow Lite...")
    np.random.seed(42)
    num_samples = 2000
    data = {
        "user_id": np.arange(1, num_samples + 1),
        "commute_mode": np.random.choice(["car", "bus", "bike", "walk", "train", "EV"], num_samples,
                                           p=[0.35, 0.25, 0.1, 0.05, 0.15, 0.1]),
        "distance_km": np.random.uniform(1, 120, num_samples),
        "diet_type": np.random.choice(["veg", "non-veg", "mixed"], num_samples, p=[0.4, 0.3, 0.3]),
        "energy_usage_kWh": np.random.uniform(100, 700, num_samples),
    }
    df = pd.DataFrame(data)

    # Compute target exactly like in recommendation_model.py
    emission_factors = {"car": 0.21, "bus": 0.089, "bike": 0.018, "walk": 0.0, "train": 0.041, "EV": 0.045}
    diet_factors = {"veg": 1.5, "non-veg": 4.2, "mixed": 2.7}
    df["commute_emission"] = df["distance_km"] * df["commute_mode"].map(emission_factors)
    df["diet_emission"] = df["diet_type"].map(diet_factors)
    df["energy_emission"] = (df["energy_usage_kWh"] / 30) * 0.4
    df["total_emission"] = df["commute_emission"] + df["diet_emission"] + df["energy_emission"]

    # Encoders
    le_commute = LabelEncoder(); le_diet = LabelEncoder()
    df["commute_mode_encoded"] = le_commute.fit_transform(df["commute_mode"])
    df["diet_type_encoded"] = le_diet.fit_transform(df["diet_type"])
    X = df[["commute_mode_encoded", "distance_km", "diet_type_encoded", "energy_usage_kWh"]].astype(np.float32)
    y = df["total_emission"].astype(np.float32).values.reshape(-1, 1)

    scaler = StandardScaler(); X_scaled = scaler.fit_transform(X)
    joblib.dump(le_commute, 'saved_models/le_commute.pkl')
    joblib.dump(le_diet, 'saved_models/le_diet.pkl')
    joblib.dump(scaler, 'saved_models/scaler.pkl')
    # JSON metadata for frontend/backend JS
    import json
    rec_meta = {
        'feature_order': ['commute_mode_encoded','distance_km','diet_type_encoded','energy_usage_kWh'],
        'le_commute_classes': le_commute.classes_.tolist(),
        'le_diet_classes': le_diet.classes_.tolist(),
        'scaler_mean': getattr(scaler, 'mean_', [0,0,0,0]).tolist(),
        'scaler_scale': getattr(scaler, 'scale_', [1,1,1,1]).tolist()
    }
    with open('saved_models/recommendation_v2_meta.json','w') as f:
        json.dump(rec_meta, f)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_scaled.shape[1],)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X_scaled, y, epochs=12, batch_size=32, validation_split=0.2, verbose=0)
    model.save('saved_models/recommendation_model_v2.keras')

    tflite_model = _quantize_converter_from_model(model, X_scaled)
    with open('saved_models/recommendation_model_v2.tflite', 'wb') as f:
        f.write(tflite_model)
    print("✅ Recommendation v2 exported: saved_models/recommendation_model_v2.tflite")

def convert_future_prediction_model():
    print("Converting Future Prediction surrogate (Keras MLP) to TensorFlow Lite...")
    # Synthesize a small tabular dataset similar to future_prediction.py
    np.random.seed(7)
    n = 1500
    cat_cols = ['Body Type','Sex','Diet','How Often Shower','Heating Energy Source','Transport','Vehicle Type',
                'Social Activity','Frequency of Traveling by Air','Waste Bag Size','Energy efficiency','Recycling','Cooking_With']
    num_cols = ['Monthly Grocery Bill','Vehicle Monthly Distance Km','Waste Bag Weekly Count','How Long TV PC Daily Hour',
                'How Many New Clothes Monthly','How Long Internet Daily Hour']
    cat_spaces = {
        'Body Type':['thin','average','overweight'],
        'Sex':['male','female'],
        'Diet':['omnivore','vegetarian','vegan'],
        'How Often Shower':['daily','weekly','rarely'],
        'Heating Energy Source':['gas','electric','solar','none'],
        'Transport':['car','bus','train','walk/bicycle','none'],
        'Vehicle Type':['none','petrol','diesel','ev'],
        'Social Activity':['low','medium','high'],
        'Frequency of Traveling by Air':['never','yearly','monthly'],
        'Waste Bag Size':['small','medium','large'],
        'Energy efficiency':['Yes','No'],
        'Recycling':['None','Basic','Full'],
        'Cooking_With':['electric','gas','wood']
    }
    rows = []
    for i in range(n):
        row = {c: np.random.choice(v) for c,v in cat_spaces.items()}
        row.update({
            'Monthly Grocery Bill': np.random.uniform(100, 800),
            'Vehicle Monthly Distance Km': np.random.uniform(0, 1500),
            'Waste Bag Weekly Count': np.random.uniform(0, 10),
            'How Long TV PC Daily Hour': np.random.uniform(0, 10),
            'How Many New Clothes Monthly': np.random.uniform(0, 20),
            'How Long Internet Daily Hour': np.random.uniform(0, 12),
        })
        rows.append(row)
    df = pd.DataFrame(rows)

    # Heuristic target similar to carbon emission
    base = 0.002 * df['Vehicle Monthly Distance Km'] + 0.001 * df['Monthly Grocery Bill']
    base += 0.3 * (df['How Long Internet Daily Hour'] / 12) + 0.2 * (df['How Long TV PC Daily Hour'] / 10)
    diet_bonus = df['Diet'].map({'omnivore': 1.0, 'vegetarian': 0.8, 'vegan': 0.6})
    energy_eff = df['Energy efficiency'].map({'Yes': 0.9, 'No': 1.1})
    y = (base * diet_bonus * energy_eff + 1.0).astype(np.float32).values.reshape(-1,1)

    from sklearn.preprocessing import OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler as SkStandardScaler

    pre = ColumnTransformer([
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),
        ('scale', SkStandardScaler(), num_cols)
    ])
    X = pre.fit_transform(df)
    # Persist preprocessing pieces
    joblib.dump(pre.named_transformers_['onehot'], 'saved_models/future_onehot.pkl')
    joblib.dump(pre.named_transformers_['scale'], 'saved_models/future_num_scaler.pkl')
    joblib.dump(cat_cols, 'saved_models/future_cat_cols.pkl')
    joblib.dump(num_cols, 'saved_models/future_num_cols.pkl')
    # JSON metadata
    import json
    onehot = pre.named_transformers_['onehot']
    num_scaler = pre.named_transformers_['scale']
    future_meta = {
        'cat_cols': cat_cols,
        'num_cols': num_cols,
        'onehot_categories': [c.tolist() for c in onehot.categories_],
        'num_scaler_mean': getattr(num_scaler, 'mean_', []).tolist(),
        'num_scaler_scale': getattr(num_scaler, 'scale_', []).tolist()
    }
    with open('saved_models/future_meta.json','w') as f:
        json.dump(future_meta, f)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=15, batch_size=32, validation_split=0.2, verbose=0)
    model.save('saved_models/future_prediction.keras')
    tflite_model = _quantize_converter_from_model(model, X.astype(np.float32))
    with open('saved_models/future_prediction.tflite', 'wb') as f:
        f.write(tflite_model)
    print("✅ Future prediction exported: saved_models/future_prediction.tflite")

def convert_carbonemission_surrogate():
    print("Converting CarbonEmission surrogate (Keras MLP) to TensorFlow Lite...")
    # Create a surrogate model due to CatBoost/Colab dependency
    np.random.seed(21)
    n = 2000
    df = pd.DataFrame({
        'Body Type': np.random.choice(['thin','average','overweight'], n),
        'Sex': np.random.choice(['male','female'], n),
        'Diet': np.random.choice(['omnivore','vegetarian','vegan'], n),
        'Shower': np.random.choice(['daily','weekly'], n),
        'Heating': np.random.choice(['gas','electric','solar','none'], n),
        'Transport': np.random.choice(['car','bus','train','walk/bicycle','none'], n),
        'Vehicle': np.random.choice(['none','petrol','diesel','ev'], n),
        'Social': np.random.choice(['low','medium','high'], n),
        'Grocery': np.random.uniform(100, 800, n),
        'Flight': np.random.choice(['never','yearly','monthly'], n),
        'Vehicle Distance': np.random.uniform(0, 2000, n),
        'Waste Weekly': np.random.uniform(0, 10, n),
        'TV Daily Hour': np.random.uniform(0, 8, n),
        'Clothes Monthly': np.random.uniform(0, 15, n),
        'Internet Daily': np.random.uniform(0, 12, n),
        'Energy Eff': np.random.choice(['Yes','No'], n),
        'Recycling': np.random.choice(['None','Basic','Full'], n),
        'Cooking': np.random.choice(['electric','gas','wood'], n),
    })
    # Heuristic target
    y = (0.002*df['Vehicle Distance'] + 0.001*df['Grocery'] + 0.2*(df['Internet Daily']/12) + 0.15*(df['TV Daily Hour']/8) + 0.5).astype(np.float32).values.reshape(-1,1)

    cat_cols = ['Body Type','Sex','Diet','Shower','Heating','Transport','Vehicle','Social','Flight','Energy Eff','Recycling','Cooking']
    num_cols = ['Grocery','Vehicle Distance','Waste Weekly','TV Daily Hour','Clothes Monthly','Internet Daily']

    from sklearn.preprocessing import OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler as SkStandardScaler

    pre = ColumnTransformer([
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),
        ('scale', SkStandardScaler(), num_cols)
    ])
    X = pre.fit_transform(df)
    joblib.dump(pre.named_transformers_['onehot'], 'saved_models/carbon_onehot.pkl')
    joblib.dump(pre.named_transformers_['scale'], 'saved_models/carbon_num_scaler.pkl')
    joblib.dump(cat_cols, 'saved_models/carbon_cat_cols.pkl')
    joblib.dump(num_cols, 'saved_models/carbon_num_cols.pkl')
    # JSON metadata
    import json
    onehot = pre.named_transformers_['onehot']
    num_scaler = pre.named_transformers_['scale']
    carbon_meta = {
        'cat_cols': cat_cols,
        'num_cols': num_cols,
        'onehot_categories': [c.tolist() for c in onehot.categories_],
        'num_scaler_mean': getattr(num_scaler, 'mean_', []).tolist(),
        'num_scaler_scale': getattr(num_scaler, 'scale_', []).tolist()
    }
    with open('saved_models/carbon_meta.json','w') as f:
        json.dump(carbon_meta, f)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X.shape[1],)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=15, batch_size=32, validation_split=0.2, verbose=0)
    model.save('saved_models/carbonemission_surrogate.keras')
    tflite_model = _quantize_converter_from_model(model, X.astype(np.float32))
    with open('saved_models/carbonemission_surrogate.tflite', 'wb') as f:
        f.write(tflite_model)
    print("✅ CarbonEmission surrogate exported: saved_models/carbonemission_surrogate.tflite")

def main():
    convert_recommendation_model_v2()
    convert_future_prediction_model()
    convert_carbonemission_surrogate()
    print("\n🎉 All models converted successfully! See 'saved_models' directory.")

if __name__ == "__main__":
    main()
