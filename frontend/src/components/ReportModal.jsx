import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const REPORT_REASONS = [
  "Wrong information",
  "Duplicate question paper",
  "Wrong file",
  "Unreadable file",
  "Copyright concern",
  "Inappropriate content",
  "Other",
];

/**
 * ReportModal
 *
 * props:
 * - questionId: id of the question paper being reported
 * - onClose: called to dismiss the modal
 */
export default function ReportModal({ questionId, onClose }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason) {
      setErrorMessage("Please select a reason.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, reason, description }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit report.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="report-modal-overlay"
      onClick={onClose}
      style={overlayStyle}
    >
      <div
        className="report-modal"
        onClick={(event) => event.stopPropagation()}
        style={modalStyle}
      >
        <div style={headerStyle}>
          <strong>Report Question Paper</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={closeButtonStyle}
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <div style={{ padding: "1rem 0" }}>
            <p>
              ✓ Thanks — your report has been submitted for
              review.
            </p>
            <button type="button" onClick={onClose} style={primaryBtnStyle}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ marginTop: 0 }}>Why are you reporting this?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {REPORT_REASONS.map((option) => (
                <label
                  key={option}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option}
                    checked={reason === option}
                    onChange={(event) => setReason(event.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <label style={{ display: "block", marginTop: "1rem" }}>
              Additional information (optional)
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell us what is wrong..."
              maxLength={1000}
              rows={4}
              style={{ width: "100%", marginTop: "0.4rem" }}
            />

            {errorMessage && (
              <p style={{ color: "#c0392b" }}>{errorMessage}</p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.6rem",
                marginTop: "1rem",
              }}
            >
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>
                Cancel
              </button>

              <button
                type="submit"
                disabled={status === "submitting"}
                style={primaryBtnStyle}
              >
                {status === "submitting" ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  borderRadius: "10px",
  padding: "1.25rem",
  width: "90%",
  maxWidth: "420px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "1.4rem",
  cursor: "pointer",
  lineHeight: 1,
};

const primaryBtnStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#f1f5f9",
  color: "#334155",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
};
