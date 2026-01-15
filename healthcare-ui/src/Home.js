import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* HERO SECTION */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
            <h1 style={styles.title}>MedAssist AI</h1>
            <p style={styles.tagline}>Your Intelligent Health Companion</p>

            <div style={styles.quotes}>
            <p>“Early diagnosis saves lives.”</p>
            <p>“Technology that cares for you.”</p>
            </div>

            <button style={styles.button} onClick={() => navigate("/login")}>
            Get Started with MedAssist AI
            </button>

            <div style={styles.pills}>
            <span style={styles.pill}>AI Powered</span>
            <span style={styles.pill}>Instant Results</span>
            <span style={styles.pill}>Free & Educational</span>
            </div>
        </div>
       </div>


      {/* HOW IT WORKS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3>🩺 Enter Symptoms</h3>
            <p>Provide your age and symptoms in simple language.</p>
          </div>
          <div style={styles.card}>
            <h3>🤖 AI Analysis</h3>
            <p>Our machine learning model evaluates possible conditions.</p>
          </div>
          <div style={styles.card}>
            <h3>📊 Smart Guidance</h3>
            <p>Get precautions, doctor suggestions, and reports.</p>
          </div>
        </div>
      </div>

      {/* WHY MEDASSIST AI */}
      <div style={{ ...styles.section, background: "#f0fdfa" }}>
        <h2 style={styles.sectionTitle}>Why MedAssist AI?</h2>
        <div style={styles.cardGrid}>
          <div style={styles.featureCard}>⚡ Instant Results</div>
          <div style={styles.featureCard}>🧠 AI Powered</div>
          <div style={styles.featureCard}>📄 Medical Reports</div>
          <div style={styles.featureCard}>🕒 History Tracking</div>
        </div>
      </div>
      {/* ABOUT SECTION */}
        <div style={{ ...styles.section, background: "#ffffff" }}>
        <h2 style={styles.sectionTitle}>About MedAssist AI</h2>

        <p style={styles.longText}>
            MedAssist AI is an AI-powered healthcare assistant designed to help
            individuals understand their health conditions at an early stage.
            By analyzing user-provided symptoms and age, the system uses machine
            learning models to predict possible diseases with confidence levels.
        </p>

        <p style={styles.longText}>
            The platform offers intelligent risk assessment, doctor recommendations,
            and personalized guidance to help users take timely action. It is built
            with modern web technologies such as React and Flask, and integrates a
            trained machine learning model at its core.
        </p>

        <p style={styles.longText}>
            MedAssist AI is developed as an educational healthcare platform with
            the goal of promoting awareness, early diagnosis, and responsible
            health decisions. It does not replace a doctor, but acts as a smart
            companion that supports users in understanding their symptoms better.
        </p>
        </div>

    </motion.div>
  );
}

const styles = {
  hero: {
    minHeight: "85vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    background: "linear-gradient(135deg, #dff9f6, #e0f2fe)",
    padding: 40,
  },
  heroInner: {
    maxWidth: 900,
  },
  title: {
    fontSize: 72,                 // ⬆ bigger
    color: "#0f766e",
    marginBottom: 14,
    letterSpacing: 1,
    textShadow: "0 6px 18px rgba(0,0,0,0.12)",
    },

    tagline: {
    fontSize: 26,                 // ⬆ bigger
    color: "#0369a1",
    marginBottom: 24,
    },

    quotes: {
    fontStyle: "italic",
    color: "#334155",
    marginBottom: 34,
    fontSize: 18,
    lineHeight: 1.6,
    },

    button: {
    padding: "18px 44px",
    borderRadius: 40,
    border: "none",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
    fontSize: 18,
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 12px 30px rgba(2,132,199,0.35)",
    },
  section: {
    padding: "60px 80px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 32,
    color: "#0f766e",
    marginBottom: 30,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    color: "#0f766e",
  },
  featureCard: {
    background: "white",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    fontWeight: "bold",
    color: "#0369a1",
  },
  longText: {
    maxWidth: 900,
    margin: "0 auto 16px",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#134e4a",
    },
    pills: {
  marginTop: 26,
  display: "flex",
  justifyContent: "center",
  gap: 14,
  flexWrap: "wrap",
},

pill: {
  background: "white",
  padding: "8px 16px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: "bold",
  color: "#0f766e",
  boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
},

};
