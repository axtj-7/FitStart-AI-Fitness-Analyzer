import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

try:
    # Load CSV data
    data = pd.read_csv('synthetic_body_type_dataset.csv')

    # Add BMI to the dataset
    data['BMI'] = data['Weight'] / ((data['Height'] / 100) ** 2)

    # Convert Body Type to 3 classes based on BMI (reliable)
    def bmi_to_label(bmi):
        if bmi < 18.5:
            return 'Underweight'
        elif bmi < 25:
            return 'Fit'
        else:
            return 'Overweight'

    data['Body Type'] = data['BMI'].apply(bmi_to_label)

    # Encode categorical features
    le_gender = LabelEncoder()
    le_activity = LabelEncoder()
    le_goal = LabelEncoder()
    le_body = LabelEncoder()

    data['Gender'] = le_gender.fit_transform(data['Gender'])
    data['Activity Level'] = le_activity.fit_transform(data['Activity Level'])
    data['Goal'] = le_goal.fit_transform(data['Goal'])
    data['Body Type'] = le_body.fit_transform(data['Body Type'])  # final labels: 0,1,2

    # Save body type label encoder for decoding later
    joblib.dump(le_body, 'body_type_label_encoder.joblib')

    # Features and target
    X = data[['Age', 'Gender', 'Height', 'Weight', 'Activity Level', 'Goal']]
    y = data['Body Type']

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # Grid search for best model
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }

    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(rf, param_grid, cv=5, verbose=1)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_

    # Cross-validation check
    cv_scores = cross_val_score(best_model, X_scaled, y, cv=5)
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean() * 100:.2f}%")

    # Test set accuracy
    y_pred = best_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Test Set Accuracy: {acc * 100:.2f}%")

    # Save model and scaler
    joblib.dump(best_model, 'body_type_predictor.joblib')
    joblib.dump(scaler, 'scaler.joblib')
    print("Model and scaler saved successfully.")

except Exception as e:
    print(f"Error: {e}")
