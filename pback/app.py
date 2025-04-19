from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow CORS requests

# Load trained components
model = joblib.load('body_type_predictor.joblib')
scaler = joblib.load('scaler.joblib')
label_encoder = joblib.load('body_type_label_encoder.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get incoming data
        data = request.get_json()

        # Extract features
        age = data['age']
        gender = data['gender']  # 1 = Male, 0 = Female
        height = data['height']
        weight = data['weight']
        activity_level = data['activity_level']  # 0 = Low, 1 = Medium, 2 = High
        goal = data['goal']  # 0 = Weight Loss, 1 = Maintain, 2 = Muscle Gain

        # Format input
        features = np.array([[age, gender, height, weight, activity_level, goal]])

        # Scale input
        scaled_features = scaler.transform(features)

        # Predict
        prediction = model.predict(scaled_features)[0]

        # Decode label
        label = label_encoder.inverse_transform([prediction])[0]

        return jsonify({'body_type': label})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
