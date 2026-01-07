import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const VerificationAdmin = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("PENDING"); // PENDING, APPROVED, REJECTED

  const fetchVerifications = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/verification");
      setVerifications(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/verification/${id}`, { status });
      fetchVerifications();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = verifications.filter(v => 
    filter === "ALL" || v.verificationStatus === filter
  );

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">User Verification</h1>
            <p className="subhead">
              Verify users face-to-face and update their verification status
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={fetchVerifications}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="toolbar">
        <div className="chips">
          <button className={`chip ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
            All
          </button>
          <button className={`chip ${filter === "PENDING" ? "active" : ""}`} onClick={() => setFilter("PENDING")}>
            Pending ({verifications.filter(v => v.verificationStatus === "PENDING").length})
          </button>
          <button className={`chip ${filter === "APPROVED" ? "active" : ""}`} onClick={() => setFilter("APPROVED")}>
            Approved ({verifications.filter(v => v.verificationStatus === "APPROVED").length})
          </button>
          <button className={`chip ${filter === "REJECTED" ? "active" : ""}`} onClick={() => setFilter("REJECTED")}>
            Rejected ({verifications.filter(v => v.verificationStatus === "REJECTED").length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading verification requests...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No verification requests found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            {filter === "PENDING" 
              ? "No pending verification requests."
              : `No ${filter.toLowerCase()} verifications.`}
          </p>
        </div>
      ) : (
        <div className="verification-grid">
          {filtered.map((v) => (
            <div className="card" key={v._id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ marginTop: 0 }}>{v.user?.name || "Unknown User"}</h3>
                  <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                    <div>
                      <p className="mini" style={{ margin: 0 }}>Email</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{v.user?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="mini" style={{ margin: 0 }}>Role</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{v.user?.role || "-"}</p>
                    </div>
                    <div>
                      <p className="mini" style={{ margin: 0 }}>Document Type</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{v.documentType}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 12 }}>
                    <p className="mini" style={{ margin: 0 }}>Submitted on</p>
                    <p style={{ margin: 0 }}>
                      {new Date(v.createdAt).toLocaleDateString()} at{" "}
                      {new Date(v.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className={`badge ${
                    v.verificationStatus === "APPROVED" ? "published" : 
                    v.verificationStatus === "REJECTED" ? "soldout" : "draft"
                  }`}>
                    {v.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Face-to-Face Verification Actions */}
              {v.verificationStatus === "PENDING" && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <h4 style={{ marginTop: 0 }}>Face-to-Face Verification</h4>
                  <p style={{ color: "var(--muted)", marginBottom: 12 }}>
                    After meeting the user in person and verifying their identity:
                  </p>
                  
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-success"
                      onClick={() => updateStatus(v._id, "APPROVED")}
                      style={{ backgroundColor: "#22c55e", color: "white" }}
                    >
                      ✅ Approve (Identity Verified)
                    </button>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => updateStatus(v._id, "REJECTED")}
                      style={{ backgroundColor: "#ef4444", color: "white" }}
                    >
                      ❌ Reject (Identity Not Verified)
                    </button>
                    
                    <button
                      className="btn"
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) {
                          // You might want to store the rejection reason
                          updateStatus(v._id, "REJECTED");
                        }
                      }}
                    >
                      📝 Reject with Reason
                    </button>
                  </div>
                  
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
                    <p style={{ margin: 0 }}>
                      <strong>Verification Checklist:</strong>
                    </p>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>Check government-issued ID</li>
                      <li>Verify photo matches the person</li>
                      <li>Confirm contact details</li>
                      <li>Note any observations</li>
                    </ul>
                  </div>
                </div>
              )}

              {v.verificationStatus !== "PENDING" && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Status updated:</strong> {new Date(v.updatedAt || v.createdAt).toLocaleString()}
                  </p>
                  
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn"
                      onClick={() => updateStatus(v._id, "PENDING")}
                    >
                      Reset to Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationAdmin;