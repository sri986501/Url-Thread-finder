import os
import sys
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import joblib

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)
from xgboost import XGBClassifier

from app.services.feature_service import FeatureService
from ml.dataset import generate_benchmark_dataset, validate_dataset

def run_training_pipeline():
    print("=" * 60)
    print("PHISHGUARD AI: Machine Learning Training & Evaluation Pipeline")
    print("=" * 60)

    # 1. Dataset Generation & Validation
    print("[1/6] Loading and validating ground-truth dataset...")
    raw_df = generate_benchmark_dataset()
    df = validate_dataset(raw_df)
    print(f"      Total validated records: {len(df)}")
    print(f"      Legitimate URLs (0): {len(df[df['label'] == 0])}")
    print(f"      Phishing URLs (1): {len(df[df['label'] == 1])}")

    # 2. Feature Extraction
    print("[2/6] Extracting 26 lexical, host, and behavioral features...")
    feature_names = FeatureService.get_feature_names()
    X_list = []
    y_list = []

    for _, row in df.iterrows():
        url = row["url"]
        label = row["label"]
        features = FeatureService.extract_features(url)
        vector = FeatureService.get_feature_vector(features)
        X_list.append(vector)
        y_list.append(label)

    X = np.array(X_list)
    y = np.array(y_list)

    # 3. Train/Test Split & Preprocessing
    print("[3/6] Performing stratified train/test split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. Model Training & Comparison
    print("[4/6] Training Candidate Models...")
    models = {
        "Logistic Regression": {
            "model": LogisticRegression(max_iter=1000, random_state=42),
            "use_scaled": True
        },
        "Random Forest": {
            "model": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
            "use_scaled": False
        },
        "XGBoost": {
            "model": XGBClassifier(n_estimators=120, max_depth=5, learning_rate=0.08, eval_metric="logloss", random_state=42),
            "use_scaled": False
        }
    }

    eval_results = {}
    best_model_name = None
    best_f1 = -1.0

    for name, config in models.items():
        print(f"      Training {name}...")
        clf = config["model"]
        x_tr = X_train_scaled if config["use_scaled"] else X_train
        x_te = X_test_scaled if config["use_scaled"] else X_test

        clf.fit(x_tr, y_train)

        y_pred = clf.predict(x_te)
        y_prob = clf.predict_proba(x_te)[:, 1] if hasattr(clf, "predict_proba") else y_pred

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))

        eval_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4)
        }

        print(f"        -> {name} F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f} | Accuracy: {acc:.4f}")

        # Prefer XGBoost if scores are tied for non-linear explainability
        if f1 > best_f1 or (f1 == best_f1 and name == "XGBoost"):
            best_f1 = f1
            best_model_name = name

    print(f"\n[5/6] Champion Model Selected: {best_model_name} (F1 Score: {best_f1:.4f})")
    champion_config = models[best_model_name]
    champion_model = champion_config["model"]

    # Calculate Feature Importances for Champion Model
    feature_importances = {}
    if hasattr(champion_model, "feature_importances_"):
        importances = champion_model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        for idx in sorted_indices:
            feature_importances[feature_names[idx]] = round(float(importances[idx]), 4)
    elif hasattr(champion_model, "coef_"):
        coefs = np.abs(champion_model.coef_[0])
        sorted_indices = np.argsort(coefs)[::-1]
        for idx in sorted_indices:
            feature_importances[feature_names[idx]] = round(float(coefs[idx]), 4)

    # 6. Serialization
    print("[6/6] Serializing artifacts to disk...")
    artifacts_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    model_payload = {
        "model_name": best_model_name,
        "model_version": "2.0.0",
        "model": champion_model,
        "scaler": scaler,
        "use_scaled": champion_config["use_scaled"],
        "feature_names": feature_names,
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    model_path = os.path.join(artifacts_dir, "model.joblib")
    joblib.dump(model_payload, model_path)
    print(f"      Model artifact saved to: {model_path}")

    metrics_payload = {
        "champion_model": best_model_name,
        "model_version": "2.0.0",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "models_comparison": eval_results,
        "champion_metrics": eval_results[best_model_name],
        "feature_importances": feature_importances,
        "feature_names": feature_names
    }

    metrics_path = os.path.join(artifacts_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"      Evaluation metrics saved to: {metrics_path}")

    print("\nTraining Pipeline Completed Successfully.")
    return metrics_payload

if __name__ == "__main__":
    run_training_pipeline()
