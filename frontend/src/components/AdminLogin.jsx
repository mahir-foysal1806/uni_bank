import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      localStorage.setItem("uniqbank_admin_token", data.data.token);
      navigate("/admin/moderation");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ maxWidth: "360px", margin: "3rem auto", padding: "0 1rem" }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-password">Password</label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "0.4rem 0 1rem" }}
        />

        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.6rem 1.2rem",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
