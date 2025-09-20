from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Added this back
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # <-- And initialized it here

# --- Load the Machine Learning Artifacts ---
try:
    model = joblib.load('body_type_predictor.joblib')
    scaler = joblib.load('scaler.joblib')
    label_encoder = joblib.load('body_type_label_encoder.joblib')
    print("✅ ML models loaded successfully.")
except FileNotFoundError as e:
    print(f"❌ Error loading model files: {e}")
    model, scaler, label_encoder = None, None, None

# --- Define Mappings for Categorical Data ---
GENDER_MAP = {'Male': 1, 'Female': 0}
# NOTE: I've updated these maps to better match standard labels
ACTIVITY_MAP = {
    'Sedentary': 3, 
    'Lightly active': 1, 
    'Moderately active': 2, 
    'Very active': 4, 
    'Extra active': 0
}
GOAL_MAP = {'Weight Loss': 2, 'Muscle Gain': 1, 'General Fitness': 0}


@app.route('/predict', methods=['POST'])
def predict():
    if not all([model, scaler, label_encoder]):
        return jsonify({"error": "ML models are not loaded. Check server logs."}), 500

    try:
        data = request.get_json()
        print(f"Received data: {data}")

        # Calculate BMI
        height_m = data['height'] / 100
        bmi = data['weight'] / (height_m ** 2)

        # Map categorical features to their integer codes
        gender_code = GENDER_MAP.get(data['gender'])
        activity_code = ACTIVITY_MAP.get(data['activity'])
        goal_code = GOAL_MAP.get(data['goal'])
        
        # Create a pandas DataFrame with the correct feature order
        features = pd.DataFrame([[
            data['age'],
            gender_code,
            activity_code,
            goal_code,
            bmi
        ]], columns=['Age', 'Gender', 'Activity Level', 'Goal', 'BMI'])
        
        # Scale the features
        scaled_features = scaler.transform(features)

        # Make a prediction
        prediction_code = model.predict(scaled_features)
        
        # Decode the prediction
        prediction_label = label_encoder.inverse_transform(prediction_code)

        print(f"Prediction label: {prediction_label[0]}")
        
        return jsonify({'body_type': prediction_label[0]})

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({'error': 'Failed to make prediction', 'details': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)