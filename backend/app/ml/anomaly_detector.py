import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

class MLDetector:
    def __init__(self, model_path="model.pkl"):
        self.model_path = model_path
        self.model = IsolationForest(contamination=0.03, random_state=42, n_estimators=100)
        self.is_trained = False
        self.features = ['event_type_encoded', 'severity_encoded', 'hour_of_day', 'source_encoded', 'event_rate_rolling']
        
        # Simple encodings for demo purposes
        self.source_map = {"AUTH": 1, "PROCESS": 2, "FILE": 3, "PRIVILEGE": 4, "NETWORK": 5}
        self.severity_map = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        
        self.load_model()

    def extract_features(self, events):
        """Converts raw event dicts to a pandas DataFrame for ML"""
        df = pd.DataFrame(events)
        if df.empty:
            return df
            
        df['source_encoded'] = df['source'].map(self.source_map).fillna(0)
        df['severity_encoded'] = df['severity'].map(self.severity_map).fillna(1)
        df['event_type_encoded'] = df['event_type'].apply(lambda x: hash(str(x)) % 100 if x else 0)
        
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour_of_day'] = df['timestamp'].dt.hour
            # DDOS Simulation: Calculate connection rates over a rolling time window
            df_sorted = df.sort_values('timestamp')
            df_sorted['event_rate_rolling'] = df_sorted.rolling('10s', on='timestamp')['id'].count()
            # Sort back to original index to maintain order matching
            df = df_sorted.sort_index()
        else:
            df['hour_of_day'] = 12
            df['event_rate_rolling'] = 1.0
            
        return df[self.features]

    def train_baseline(self, baseline_events):
        X = self.extract_features(baseline_events)
        if X.empty or len(X) < 10:
            return False, "Not enough data to train"
            
        self.model.fit(X)
        self.is_trained = True
        self.save_model()
        return True, "Model trained successfully"

    def predict_anomalies(self, events):
        if not self.is_trained:
            # Fallback deterministic check if ML isn't trained
            scores = []
            for e in events:
                if e.get("severity") in ["high", "critical"]:
                    scores.append(0.8)
                else:
                    scores.append(0.1)
            return scores

        X = self.extract_features(events)
        if X.empty:
            return []
            
        preds = self.model.decision_function(X)
        
        scores = []
        for i, e in enumerate(events):
            pred = preds[i]
            # Base score from ML (-0.5 to 0.5 typically. Outliers are negative)
            # Invert so outliers are higher: -0.2 -> 0.7, 0.2 -> 0.3
            base = (0.5 - pred) / 1.0
            
            # Boost score based on known severity to ensure harmful attacks are flagged
            sev = e.get("severity", "low")
            if sev == "critical":
                base += 0.4
            elif sev == "high":
                base += 0.3
                
            scores.append(float(np.clip(base, 0.0, 0.99)))
            
        return scores

    def save_model(self):
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
        except Exception as e:
            print(f"Could not save model: {e}")

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                    self.is_trained = True
            except:
                self.is_trained = False
