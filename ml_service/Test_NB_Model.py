import os
import sys
from typing import List
import pandas as pd
import joblib

# Resolve paths relative to script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'breast_cancer_nb_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

EXPECTED_FEATURE_COUNT = 30


def predict_from_csv(path_to_csv: str) -> List[str]:
    """
    Reads CSV at path_to_csv, drops id/diagnosis columns,
    scales features using fitted StandardScaler, and returns ['benign', 'malignant', ...]
    """
    df = pd.read_csv(path_to_csv)

    # Drop non-feature metadata columns if present
    df = df.drop(columns=['id', 'diagnosis', 'Unnamed: 32'], errors='ignore')

    # Enforce exactly 30 features
    if df.shape[1] != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"CSV file must have exactly {EXPECTED_FEATURE_COUNT} diagnostic features, found {df.shape[1]}."
        )

    # Reorder columns to match scaler if feature names match
    if hasattr(scaler, "feature_names_in_"):
        expected_cols = list(scaler.feature_names_in_)
        if all(c in df.columns for c in expected_cols):
            df = df[expected_cols]

    # Scale and predict
    X_scaled = scaler.transform(df)
    preds = model.predict(X_scaled)

    # Map target integers to clinical classifications
    label_map = {0: 'benign', 1: 'malignant'}
    return [label_map[int(p)] for p in preds]


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python Test_NB_Model.py path/to/file.csv")
        sys.exit(1)

    csv_path = sys.argv[1]
    try:
        results = predict_from_csv(csv_path)
        for idx, r in enumerate(results, 1):
            print(f"Patient {idx}: {r}")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(2)
