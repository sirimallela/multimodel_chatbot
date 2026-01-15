import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Signup successful. Please login.");
        navigate("/login");
      }
    } catch {
      alert("Server not reachable");
    }
  };

  return (
    <motion.div
      style={styles.page}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join MedAssist AI</p>

        <input
          style={styles.input}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          style={styles.input}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleSignup}>
          Sign Up
        </button>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </motion.div>
  );
}

const styles = {
  page: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e0fdfa, #e0f2fe)",
  },
  card: {
    width: 440,
    padding: 40,
    borderRadius: 20,
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    color: "#0f766e",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#0369a1",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 14,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 15,
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
  },
  footer: {
    marginTop: 16,
    fontSize: 14,
  },
};
