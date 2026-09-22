import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("uniqbank_admin_token") || "";
}

/**
 * Wraps fetch with the admin Bearer token and redirects to
 * /admin/login if the session is missing/expired.
 */
async function adminFetch(navigate, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("uniqbank_admin_token");
    navigate("/admin/login");
    throw new Error("Session expired.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export default function AdminModeration() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null); // report currently being acted on

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [reportsResult, statsResult] = await Promise.all([
        adminFetch(
          navigate,
          `${API_URL}/api/reports?status=${statusFilter}&limit=50`
        ),
        adminFetch(navigate, `${API_URL}/api/reports/stats`),
      ]);

      setReports(reportsResult.data.reports);
      setCounts(statsResult.data);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [navigate, statusFilter]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/admin/login");
      return;
    }

    loadData();
  }, [loadData, navigate]);

  const handleReview = async (reportId, status) => {
    setActionId(reportId);

    try {
      await adminFetch(navigate, `${API_URL}/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleHide = async (report, hidden) => {
    setActionId(report.id);

    try {
      await adminFetch(
        navigate,
        `${API_URL}/api/questions/${report.question_id}/hide`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hidden }),
        }
      );

      // Hiding the paper is also treated as resolving the report
      await adminFetch(navigate, `${API_URL}/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("uniqbank_admin_token");
    navigate("/admin/login");
  };

  return (
    <section style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Moderation</h2>

        <button type="button" onClick={handleLogout} style={secondaryBtnStyle}>
          Log out
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        {["pending", "resolved", "dismissed"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            style={{
              ...tabBtnStyle,
              ...(statusFilter === option ? tabBtnActiveStyle : {}),
            }}
          >
            {option[0].toUpperCase() + option.slice(1)} ({counts[option] || 0})
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No {statusFilter} reports.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {reports.map((report) => (
            <div key={report.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {report.course_code || "Unknown course"} —{" "}
                  {report.course_title || "Untitled"}
                </strong>

                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ margin: "0.4rem 0" }}>
                <strong>Reason:</strong> {report.reason}
                {report.is_hidden && (
                  <span style={{ marginLeft: "0.5rem", color: "#c0392b" }}>
                    (currently hidden)
                  </span>
                )}
              </p>

              {report.description && (
                <p style={{ fontStyle: "italic", color: "#334155" }}>
                  "{report.description}"
                </p>
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                <a
                  href={`${API_URL}/api/questions/${report.question_id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  style={linkBtnStyle}
                >
                  View Paper
                </a>

                {statusFilter === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={actionId === report.id}
                      onClick={() => handleReview(report.id, "dismissed")}
                      style={secondaryBtnStyle}
                    >
                      Dismiss
                    </button>

                    <button
                      type="button"
                      disabled={actionId === report.id}
                      onClick={() => handleReview(report.id, "resolved")}
                      style={primaryBtnStyle}
                    >
                      Resolve (keep paper)
                    </button>

                    <button
                      type="button"
                      disabled={actionId === report.id}
                      onClick={() => handleHide(report, true)}
                      style={dangerBtnStyle}
                    >
                      Hide Paper
                    </button>
                  </>
                )}

                {statusFilter !== "pending" && report.is_hidden && (
                  <button
                    type="button"
                    disabled={actionId === report.id}
                    onClick={() => handleHide(report, false)}
                    style={secondaryBtnStyle}
                  >
                    Restore Paper
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.9rem 1rem",
  background: "#fff",
};

const tabBtnStyle = {
  background: "#f1f5f9",
  color: "#334155",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
};

const tabBtnActiveStyle = {
  background: "#2563eb",
  color: "#fff",
};

const primaryBtnStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#f1f5f9",
  color: "#334155",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
};

const dangerBtnStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
};

const linkBtnStyle = {
  ...secondaryBtnStyle,
  textDecoration: "none",
  display: "inline-block",
};
