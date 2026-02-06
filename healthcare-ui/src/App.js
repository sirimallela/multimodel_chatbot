import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";


export default function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetch(`http://127.0.0.1:5000/history/${user.id}`)
        .then((r) => r.json())
        .then((d) => setHistory(d));
    }
  }, [user]);


  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };


  const [name, setName] = useState("");
  const [symptom, setSymptom] = useState("");
  const [freeText, setFreeText] = useState("");
  const [days, setDays] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState([]);


  const addSymptom = () => {
    if (symptom.trim() && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setSymptom("");
    }
  };

  const removeSymptom = (s) => {
    setSymptoms(symptoms.filter((x) => x !== s));
  };

  const analyze = async () => {
    if (symptoms.length === 0 && freeText.trim() === "") {
      alert("Please add symptoms or describe them in text");
      return;
    }


    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms,
          text: freeText,
          days: days || 1,
          age: age || 0,
        })


      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      alert("Backend not reachable. Is Flask running?");
    }

    setLoading(false);
  };

  return (
    <motion.div
      style={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div style={styles.workspace}>
        {/* LEFT PANEL – Inputs */}
        <motion.div
          style={styles.leftPanel}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >

          <h2 style={styles.panelTitle}>Patient Details</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Patient Name</label>
            <input
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Age</label>
            <input
              type="number"
              style={styles.input}
              placeholder="Enter age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Describe Symptoms (NLP)</label>
            <textarea
              style={styles.textarea}
              placeholder="Example: I have high fever and chest pain"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
            />
          </div>


          <div style={styles.section}>
            <label style={styles.label}>Symptoms</label>

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <div style={{ flex: 1 }}>
                <input
                  style={styles.input}
                  placeholder="Type a symptom (e.g., fever)"
                  value={symptom}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSymptom(val);

                    if (val.length >= 2) {
                      try {
                        const res = await fetch(
                          `http://127.0.0.1:5000/suggest-symptoms?q=${val}`
                        );
                        const data = await res.json();
                        setSuggestions(data);
                      } catch {
                        setSuggestions([]);
                      }
                    } else {
                      setSuggestions([]);
                    }
                  }}

                  onKeyDown={(e) => e.key === "Enter" && addSymptom()}
                />
              </div>
              <button style={styles.addBtn} onClick={addSymptom}>
                Add
              </button>
            </div>

            {suggestions.length > 0 && (
              <div style={styles.suggestBox}>
                {suggestions.map((s) => (
                  <div
                    key={s}
                    style={styles.suggestItem}
                    onClick={() => {
                      setSymptoms([...symptoms, s]);
                      setSymptom("");
                      setSuggestions([]);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}



            <div style={styles.tags}>
              {symptoms.map((s) => (
                <span key={s} style={styles.tag} onClick={() => removeSymptom(s)}>
                  {s} ✕
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Duration (Days)</label>
            <input
              type="number"
              style={styles.input}
              placeholder="How many days?"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <button style={styles.mainButton} onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </button>


        </motion.div>


        {/* RIGHT PANEL – Results */}
        <motion.div
          style={styles.rightPanel}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >

          <h2 style={styles.panelTitle}>Diagnosis Results</h2>

          {!result && (
            <div style={styles.placeholder}>
              Enter details on the left and click “Analyze” to see results.
            </div>
          )}

          {result && (
            <div>
              <h3 style={{ color: result.condition === "consult" ? "red" : "green" }}>
                {result.condition === "consult"
                  ? "Consult a Doctor"
                  : "Mild – Take Precautions"}
              </h3>

              <p style={{ marginBottom: 10 }}>
                Recommended Doctor: <strong>{result.doctor}</strong>
              </p>

              {result.diseases.map((d) => (
                <div key={d.disease} style={styles.diseaseBox}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{d.disease}</strong>
                    <span>{d.confidence}%</span>
                  </div>
                  <p>{d.description}</p>
                  <ul>
                    {d.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <div style={{ display: "flex", gap: "12px", marginTop: 14 }}>
                <button
                  style={{ ...styles.mainButton, flex: 1 }}
                  onClick={async () => {
                    const top = result.diseases[0];

                    await fetch("http://127.0.0.1:5000/save-history", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        user_id: user.id,
                        age: age,
                        symptoms: symptoms,
                        condition: result.condition,
                        doctor: result.doctor,
                        top: top,
                      }),
                    });

                    alert("Saved to history");

                    const r = await fetch(`http://127.0.0.1:5000/history/${user.id}`);
                    const d = await r.json();
                    setHistory(d);
                  }}
                >
                  Save to History
                </button>

                <button
                  style={{ ...styles.mainButton, flex: 1, background: "#059669" }}
                  onClick={async () => {
                    const res = await fetch("http://127.0.0.1:5000/generate-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: user.name,
                        age: age,
                        symptoms: symptoms,
                        condition: result.condition,
                        doctor: result.doctor,
                        diseases: result.diseases,
                      }),
                    });

                    const data = await res.json();
                    window.open(`http://127.0.0.1:5000${data.file}`);
                  }}
                >
                  Download Report
                </button>
              </div>

            </div>
          )}
        </motion.div>
      </div>
      {/* History Tab */}
      <div
        style={styles.historyTab}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "Close" : "History"}
      </div>
      {/* Sliding History Panel */}
      <div
        style={{
          ...styles.historyPanel,
          right: showHistory ? "20px" : "-560px",
        }}
      >
        <div style={styles.historyHeader}>
          <h3 style={{ margin: 0 }}>Patient History</h3>
          <small style={{ opacity: 0.8 }}>Your past diagnoses</small>
        </div>

        <div style={styles.historyBody}>
          {history.length === 0 && (
            <p style={{ fontSize: 14, color: "#64748b" }}>
              No history yet. Save a diagnosis to see it here.
            </p>
          )}

          {history.map((h, i) => (
            <div key={i} style={styles.historyCard}>
              <div style={styles.historyDate}>{h.date}</div>

              <div style={styles.historyMain}>
                <div style={styles.historyLine}>
                  <span style={styles.symptoms}>{h.symptoms}</span>
                  <span style={styles.arrow}>→</span>
                  <span style={styles.disease}>{h.disease}</span>
                </div>

                <div style={styles.historyMeta}>
                  {h.confidence}% • {h.condition} • {h.doctor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
      
  ); 
}

const styles = {
  page: {
    minHeight: "80vh",
    background: "linear-gradient(135deg, #e0fdfa, #e0f2fe)",
    padding: 20,
  },
  workspace: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: 20,
  },
  leftPanel: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  rightPanel: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  panelTitle: {
    marginBottom: 16,
    color: "#0f766e",
  },
  placeholder: {
    color: "#94a3b8",
    fontStyle: "italic",
    padding: 20,
    border: "1px dashed #cbd5e1",
    borderRadius: 10,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    width: "100%",
    fontSize: 14,
    boxSizing: "border-box",   // ← ADD THIS
  },

  addBtn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0ea5a4",
    color: "white",
    cursor: "pointer",
  },
  mainButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#0284c7",
    color: "white",
    cursor: "pointer",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    background: "#e0f2fe",
    padding: "5px 10px",
    borderRadius: "20px",
    cursor: "pointer",
  },
  diseaseBox: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    background: "#f0fdfa",
    borderRadius: 10,
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f766e",
    marginBottom: 6,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    width: "100%",
    fontSize: 14,
  },
  addBtn: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    background: "#0ea5a4",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  mainButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: 8,
  },
  tag: {
    background: "#e0f2fe",
    padding: "6px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    width: "100%",
    fontSize: 14,
    boxSizing: "border-box",
  },
  leftPanel: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
    overflow: "hidden",   // safety
  },
  historyTab: {
    position: "fixed",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
    padding: "10px 14px",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    zIndex: 1000,
  },

  historyPanel: {
    position: "fixed",
    top: "15%",
    width: 380,
    maxHeight: "70vh",
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    transition: "right 0.4s ease",
    overflowY: "auto",
    zIndex: 999,
  },

  historyItem: {
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 0",
  },
  historyPanel: {
    position: "fixed",
    top: "10%",
    width: 520,                     // ⬅ wider panel
    maxHeight: "80vh",
    background: "white",
    borderRadius: 20,
    boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
    transition: "right 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
    zIndex: 999,
  },
  historyHeader: {
    padding: "22px 26px",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
  },

  historyBody: {
    padding: 22,
    overflowY: "auto",
    maxHeight: "calc(80vh - 90px)",
  },

  historyCard: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: 16,                    // ⬅ more inner space
    marginBottom: 16,
    boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
  },


  historyDate: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 6,
  },

  historyMain: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  historyLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,                   // ⬅ bigger text
  },

  historyMeta: {
    fontSize: 13,
    color: "#475569",
  },


  symptoms: {
    color: "#0f766e",
    fontWeight: "bold",
  },

  arrow: {
    color: "#94a3b8",
  },

  disease: {
    color: "#1e40af",
    fontWeight: "bold",
  },

  historyMeta: {
    fontSize: 12,
    color: "#475569",
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box",
  },
  suggestBox: {
      background: "white",
      border: "1px solid #dbeafe",
      borderRadius: 10,
      marginTop: 6,
      maxHeight: 150,
      overflowY: "auto",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      zIndex: 5
    },

    suggestItem: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #eef2f7",
      fontSize: 14
    }




};

