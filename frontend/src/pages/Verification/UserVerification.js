import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const UserVerification = () => {
  const { user } = useAuth();
  const [myVerifications, setMyVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  
  const [documentType, setDocumentType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMyVerifications = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/verification/mine");
      setMyVerifications(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load your verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVerifications();
  }, []);

  const submitVerification = async (e) => {
    e.preventDefault();
    if (!documentType.trim()) {
      setErr("Please select a document type");
      return;
    }

    try {
      setSubmitting(true);
      setErr("");
      setSuccess("");
      
      await api.post("/verification", { documentType });
      
      setSuccess("Verification request submitted successfully! Admin will review it soon.");
      setDocumentType("");
      fetchMyVerifications();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return { bg: "#dcfce7", text: "#166534" };
      case "REJECTED": return { bg: "#fee2e2", text: "#991b1b" };
      case "PENDING": return { bg: "#fef3c7", text: "#92400e" };
      default: return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Get Verified</h1>
            <p className="subhead">
              Submit verification request to build trust with other users
            </p>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}
      {success && (
        <div className="success" style={{ marginBottom: 16 }}>
          {success}
        </div>
      )}

      <div className="grid">
        {/* Submit Verification Form */}
        <div className="card span-8">
          <div className="card-title">
            <h3>Submit Verification Request</h3>
            <span className="mini">Admin will verify you face-to-face</span>
          </div>

          <form onSubmit={submitVerification} className="form" style={{ display: "grid", gap: 12 }}>
            <div>
              <label className="mini">Select Document Type</label>
              <select
                className="input"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Choose document type</option>
                <option value="NATIONAL_ID">National ID Card</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="PASSPORT">Passport</option>
                <option value="GOV_EMPLOYEE_ID">Government Employee ID</option>
                <option value="OTHER">Other Official Document</option>
              </select>
            </div>

            <div>
              <label className="mini">Instructions</label>
              <div style={{ 
                backgroundColor: "#f8fafc", 
                padding: 12, 
                borderRadius: 8,
                fontSize: 14,
                color: "#475569"
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Face-to-Face Verification Process:</strong>
                </p>
                <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                  <li>Submit this request</li>
                  <li>Admin will contact you for face-to-face meeting</li>
                  <li>Bring your original document for verification</li>
                  <li>Admin will update your verification status after meeting</li>
                  <li>Verified users get a badge and higher trust score</li>
                </ul>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Verification Request"}
            </button>
          </form>
        </div>

        {/* Benefits of Verification */}
        <div className="card span-4">
          <div className="card-title">
            <h3>Benefits of Verification</h3>
            <span className="mini">Why get verified?</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ 
                backgroundColor: "#e0f2fe", 
                padding: "6px 10px", 
                borderRadius: 6,
                fontSize: 20
              }}>
                ✅
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Trust Badge</p>
                <p className="mini">Get verified badge on your profile</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ 
                backgroundColor: "#f0f9ff", 
                padding: "6px 10px", 
                borderRadius: 6,
                fontSize: 20
              }}>
                🤝
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Higher Priority</p>
                <p className="mini">Verified users get preference in transactions</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ 
                backgroundColor: "#f0f9ff", 
                padding: "6px 10px", 
                borderRadius: 6,
                fontSize: 20
              }}>
                🔒
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Security</p>
                <p className="mini">Reduces fraud and builds community trust</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Verification History */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">
          <h3>My Verification History</h3>
          <span className="mini">{myVerifications.length} request(s)</span>
        </div>

        {loading ? (
          <div className="mini">Loading your verification history...</div>
        ) : myVerifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              No verification requests submitted yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Document Type</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Status</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Submitted</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {myVerifications.map((v) => {
                  const statusColor = getStatusColor(v.verificationStatus);
                  return (
                    <tr key={v._id}>
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <strong>{v.documentType}</strong>
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <span
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {v.verificationStatus}
                        </span>
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <span className="mini">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <span className="mini">
                          {new Date(v.updatedAt || v.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVerification;