import re
import pandas as pd
import numpy as np
import csv
import warnings
warnings.filterwarnings("ignore")

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)

# =========================
# LOAD DATA
# =========================
training = pd.read_csv("Data/Training.csv")

cols = training.columns[:-1]
training = training.drop_duplicates(subset=cols)

X = training[cols].copy()
y = training["prognosis"]

noise = np.random.binomial(1, 0.08, X.shape)
X = X ^ noise

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.25, random_state=0, stratify=y_encoded
)

clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=0)
clf.fit(X_train, y_train)

# =========================
# LOAD AUX DATA
# =========================
severityDictionary = {}
description_dict = {}
precautionDictionary = {}

# -------- FIXED SEVERITY LOADING (INT ONLY) --------
with open("MasterData/symptom_severity.csv") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 2:
            severityDictionary[row[0]] = int(row[1])

# -------- SAFE LOADERS FOR OTHERS --------
def load_csv(file, min_len, target, multi=False):
    with open(file) as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= min_len:
                target[row[0]] = row[1:] if multi else row[1]

load_csv("MasterData/symptom_Description.csv", 2, description_dict)
load_csv("MasterData/symptom_precaution.csv", 5, precautionDictionary, True)

symptoms_dict = {s: i for i, s in enumerate(cols)}
# =========================
# LOGIC FUNCTIONS
# =========================

def match_symptom(user_input):
    user_input = user_input.replace(" ", "_")
    matches = [s for s in symptoms_dict if user_input in s]
    return matches

def calc_condition(symptoms, days):
    severity_sum = 0
    for s in symptoms:
        val = severityDictionary.get(s, 0)
        severity_sum += int(val)   # 🔒 force int

    score = (severity_sum * int(days)) / (len(symptoms) + 1)
    return "consult" if score > 13 else "mild"


def predict_disease(symptoms):
    vec = np.zeros(len(cols))
    for s in symptoms:
        vec[symptoms_dict[s]] = 1

    probs = clf.predict_proba([vec])[0]
    idx = np.argsort(probs)[-3:][::-1]

    return list(zip(le.inverse_transform(idx), probs[idx]))

def rule_based_override(symptoms):
    if "mild_fever" in symptoms and "headache" in symptoms:
        return "Viral Fever"
    return None

def get_result(symptoms, days):
    condition = calc_condition(symptoms, days)
    override = rule_based_override(symptoms)

    results = predict_disease(symptoms)
    if override:
        results = [(override, 0.8)] + results

    final = []
    for d, c in results:
        if c > 0.05:
            final.append({
                "disease": d,
                "confidence": round(c * 100, 2),
                "description": description_dict.get(d, "Not available"),
                "precautions": precautionDictionary.get(d, [])
            })

    return condition, final
