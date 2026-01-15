import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        <span style={styles.logo}>🩺</span>
        <span style={styles.title}>MedAssist AI</span>
      </div>

      <div style={styles.right}>
        {!user ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.primary}>Sign Up</Link>
          </>
        ) : (
          <>
            <span style={{ color: "#0f766e", marginRight: 10 }}>
              Hi, {user.name}
            </span>
            <button onClick={logout} style={styles.logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 30px",
    background: "linear-gradient(90deg, #0ea5a4, #0284c7)",
    color: "white",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    fontSize: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
  primary: {
    background: "white",
    color: "#0284c7",
    padding: "6px 14px",
    borderRadius: 20,
    textDecoration: "none",
    fontWeight: "bold",
  },
  logout: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
};
