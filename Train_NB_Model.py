import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading Breast Cancer Wisconsin dataset...")
try:
    import kagglehub
    path = kagglehub.dataset_download("uciml/breast-cancer-wisconsin-data")
    df = pd.read_csv(os.path.join(path, "data.csv"))
    df = df.drop(['Unnamed: 32', 'id'], axis=1, errors='ignore')
    df['diagnosis'] = df['diagnosis'].map({'M': 1, 'B': 0})
    X = df.drop('diagnosis', axis=1)
    y = df['diagnosis']
    print(f"Loaded {len(df)} samples from KaggleHub.")
except Exception as e:
    print(f"KaggleHub unavailable ({e}); utilizing Scikit-Learn Wisconsin dataset...")
    from sklearn.datasets import load_breast_cancer
    raw = load_breast_cancer()
    cols = [
        'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
        'compactness_mean', 'concavity_mean', 'concave points_mean', 'symmetry_mean', 'fractal_dimension_mean',
        'radius_se', 'texture_se', 'perimeter_se', 'area_se', 'smoothness_se',
        'compactness_se', 'concavity_se', 'concave points_se', 'symmetry_se', 'fractal_dimension_se',
        'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst', 'smoothness_worst',
        'compactness_worst', 'concavity_worst', 'concave points_worst', 'symmetry_worst', 'fractal_dimension_worst'
    ]
    X = pd.DataFrame(raw.data, columns=cols)
    # Scikit-Learn convention has 0: Malignant, 1: Benign. Map to Kaggle convention: 1: Malignant, 0: Benign
    y = pd.Series([1 if t == 0 else 0 for t in raw.target])
    print(f"Loaded {len(X)} samples from Scikit-Learn dataset.")

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Gaussian Naive Bayes Model
model = GaussianNB()
model.fit(X_train_scaled, y_train)

# Evaluation
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
print("\nModel Evaluation Results:")
print(f"Accuracy: {acc * 100:.2f}%")
print("Classification Report:\n", classification_report(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Save artifacts
model_path = os.path.join(BASE_DIR, 'breast_cancer_nb_model.pkl')
scaler_path = os.path.join(BASE_DIR, 'scaler.pkl')
joblib.dump(model, model_path)
joblib.dump(scaler, scaler_path)
print(f"\nTraining complete. Model saved to {model_path} and scaler to {scaler_path}.")
