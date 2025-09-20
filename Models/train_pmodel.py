import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

print("--- Starting Corrected Model Training ---")

# Define the folder where the final artifacts should be saved
output_dir = 'pback'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    # 1. Load the Dataset
    # Make sure this path is correct. Let's assume the script is in the root folder.
    data = pd.read_csv('Models/synthetic_body_type_dataset.csv')
    print("✅ Dataset loaded successfully.")

    # 2. Feature Engineering: Create the BMI column
    data['BMI'] = data['Weight'] / ((data['Height'] / 100) ** 2)
    print("✅ BMI feature created.")

    # 3. Preprocessing (The Correct Way)
    # We will use the ORIGINAL 'Body Type' as our target. DO NOT overwrite it.
    
    # Encode all categorical features and the target variable
    encoders = {}
    for col in ['Gender', 'Activity Level', 'Goal', 'Body Type']:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col])
        encoders[col] = le # Store the fitted encoder

    print("✅ Data encoding complete.")

    # Save the label encoder for the target variable ('Body Type') for later use in Flask
    joblib.dump(encoders['Body Type'], os.path.join(output_dir, 'body_type_label_encoder.joblib'))
    
    # 4. Define Features (X) and Target (y)
    # *** THIS IS THE KEY CHANGE ***
    # We use BMI as a feature and remove the redundant Height and Weight.
    X = data[['Age', 'Gender', 'Activity Level', 'Goal', 'BMI']]
    y = data['Body Type']
    print("✅ Features and target defined correctly.")

    # 5. Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print("✅ Features scaled.")

    # 6. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # 7. Grid search for the best model (Your excellent code)
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5]
    }
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(rf, param_grid, cv=5, verbose=1, n_jobs=-1)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    print(f"🏆 Best Model Parameters: {grid_search.best_params_}")

    # 8. Final Evaluation
    y_pred = best_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    # Note: Accuracy might be slightly lower than before, but it's now REALISTIC and meaningful.
    print(f"📈 Test Set Accuracy of the new model: {acc * 100:.2f}%")

    # 9. Save the final, corrected model and scaler to the pback folder
    joblib.dump(best_model, os.path.join(output_dir, 'body_type_predictor.joblib'))
    joblib.dump(scaler, os.path.join(output_dir, 'scaler.joblib'))
    print(f"✅ Model and scaler saved successfully to '{output_dir}' folder.")
    print("--- Script Finished ---")


except Exception as e:
    print(f"❌ An error occurred: {e}")