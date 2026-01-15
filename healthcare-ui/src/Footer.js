export default function Footer() {
  return (
    <div style={styles.footer}>
      <h2 style={styles.title}>About MedAssist AI</h2>

      <p style={styles.text}>
        MedAssist AI is an AI-powered healthcare assistant designed to help
        individuals understand their health conditions at an early stage.
        By analyzing user-provided symptoms and age, the system uses machine
        learning models to predict possible diseases with confidence levels.
      </p>

      <p style={styles.text}>
        The platform offers intelligent risk assessment, doctor
        recommendations, and personalized guidance to help users take timely
        action. It is built with modern web technologies such as React and Flask,
        and integrates a trained machine learning model at its core.
      </p>

      <p style={styles.text}>
        MedAssist AI is developed as an educational healthcare platform with
        the goal of promoting awareness, early diagnosis, and responsible
        health decisions. It does not replace a doctor, but acts as a smart
        companion that supports users in understanding their symptoms better.
      </p>

      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 20 }}>
        © 2026 MedAssist AI – Educational Project
      </p>
    </div>
  );
}

const styles = {
  footer: {
    padding: "60px 80px",
    background: "#f0fdfa",
    color: "#0f766e",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 900,
    margin: "0 auto 16px",
    color: "#134e4a",
  },
};
