from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from flask import send_file
from chat_bot import get_result, match_symptom, symptoms_dict, extract_symptoms_from_text
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
import os

app = Flask(__name__)
CORS(app)

DB_NAME = "users.db"

# ------------------ DATABASE SETUP ------------------

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            age INTEGER,
            symptoms TEXT,
            condition TEXT,
            doctor TEXT,
            top_disease TEXT,
            confidence REAL
        )
    """)

    conn.commit()
    conn.close()

init_db()

# ------------------ AUTH APIs ------------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Signup successful"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, name, password FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        return jsonify({
            "id": user[0],
            "name": user[1],
            "email": email
        })
    else:
        return jsonify({"error": "Invalid email or password"}), 401

from datetime import datetime

@app.route("/save-history", methods=["POST"])
def save_history():
    data = request.json

    user_id = data.get("user_id")
    age = data.get("age")
    symptoms = ", ".join(data.get("symptoms", []))
    condition = data.get("condition")
    doctor = data.get("doctor")
    top = data.get("top")

    date = datetime.now().strftime("%d %b %Y %H:%M")

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        INSERT INTO history (user_id, date, age, symptoms, condition, doctor, top_disease, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, date, age, symptoms, condition,
        doctor, top["disease"], top["confidence"]
    ))
    conn.commit()
    conn.close()

    return jsonify({"message": "Saved"})

@app.route("/history/<int:user_id>")
def get_history(user_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        SELECT date, symptoms, top_disease, confidence, condition, doctor
        FROM history
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()

    data = []
    for r in rows:
        data.append({
            "date": r[0],
            "symptoms": r[1],
            "disease": r[2],
            "confidence": r[3],
            "condition": r[4],
            "doctor": r[5],
        })

    return jsonify(data)

@app.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.json

    name = data.get("name")
    age = data.get("age")
    symptoms = ", ".join(data.get("symptoms", []))
    condition = data.get("condition")
    doctor = data.get("doctor")
    diseases = data.get("diseases", [])

    filename = f"report_{name.replace(' ', '_')}.pdf"
    filepath = os.path.join(os.getcwd(), filename)

    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>AI Healthcare Medical Report</b>", styles["Title"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Name:</b> {name}", styles["Normal"]))
    story.append(Paragraph(f"<b>Age:</b> {age}", styles["Normal"]))
    story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d %b %Y %H:%M')}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Symptoms:</b> {symptoms}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Condition:</b> {condition}", styles["Normal"]))
    story.append(Paragraph(f"<b>Recommended Doctor:</b> {doctor}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Predicted Diseases:</b>", styles["Heading2"]))

    items = []
    for d in diseases:
        items.append(ListItem(
            Paragraph(f"{d['disease']} – {d['confidence']}%", styles["Normal"])
        ))

    story.append(ListFlowable(items, bulletType="bullet"))
    story.append(Spacer(1, 12))

    if diseases:
        story.append(Paragraph("<b>Precautions:</b>", styles["Heading2"]))
        for p in diseases[0].get("precautions", []):
            story.append(Paragraph(f"- {p}", styles["Normal"]))

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    doc.build(story)

    return jsonify({"file": f"/download/{filename}"})


@app.route("/download/<filename>")
def download_file(filename):
    filepath = os.path.join(os.getcwd(), filename)
    return send_file(filepath, as_attachment=True)


# ------------------ AI PREDICTION API ------------------

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    user_symptoms = data.get("symptoms", [])
    text_input = data.get("text", "") or ""

    days = int(data.get("days", 1))
    age = int(data.get("age", 0))

    final_symptoms = []

    # -------- TAG SYMPTOMS --------
    for s in user_symptoms:
        s = s.lower().strip().replace(" ", "_")

        if s in symptoms_dict:
            final_symptoms.append(s)
        else:
            matches = match_symptom(s)
            final_symptoms.extend(matches)

    # -------- NLP SYMPTOMS --------
    if text_input:
        nlp_found = extract_symptoms_from_text(text_input)
        for s in nlp_found:
            if s not in final_symptoms:
                final_symptoms.append(s)

    # -------- DEBUG PRINT (IMPORTANT) --------
    print("FINAL SYMPTOMS USED:", final_symptoms)

    if not final_symptoms:
        return jsonify({"error": "No valid symptoms found"})

    # -------- MODEL --------
    condition, results = get_result(final_symptoms, days)

    doctor = "Home Care"

    if condition == "consult":
        doctor = "General Physician"

    if age >= 60:
        risk_note = "Risk is higher for elderly patients."
    else:
        risk_note = "Normal age-related risk."

    return jsonify({
        "condition": condition,
        "risk_note": risk_note,
        "doctor": doctor,
        "diseases": results
    })

@app.route("/suggest-symptoms")
def suggest_symptoms():
    q = request.args.get("q", "").lower().replace(" ", "_")

    matches = match_symptom(q)

    return jsonify(matches[:5])  # top 5 suggestions



@app.route("/")
def home():
    return "AI Healthcare API is running"


if __name__ == "__main__":
    app.run(debug=True)
