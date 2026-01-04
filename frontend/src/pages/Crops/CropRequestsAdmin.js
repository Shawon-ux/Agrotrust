// src/pages/Crops/CropRequestsAdmin.js
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const CropRequestsAdmin = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/crops/requests");
      setRequests(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load crop requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (requestId, status) => {
    try {
      const notes = status === "REJECTED" ? adminNotes : undefined;
      
      await api.patch(`/crops/requests/${requestId}`, {
        status,
        adminNotes: notes
      });

      alert(`Crop request ${status.toLowerCase()} successfully`);
      setAdminNotes("");
      fetchRequests();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update request");
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="container">
        <div className="error">Admin access only</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Crop Requests</h1>
            <p className="subhead">Review and approve/reject crop requests from farmers</p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={fetchRequests}>Refresh</button>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="card">Loading crop requests...</div>
      ) : requests.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No pending requests</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            All crop requests have been processed.
          </p>
        </div>
      ) : (
        <div className="grid">
          {requests.map((request) => (
            <div className="card" key={request._id} style={{ marginBottom: 14 }}>
              <div className="card-title">
                <h3 style={{ margin: 0 }}>{request.cropName}</h3>
                <span className={`badge ${
                  request.status === "PENDING" ? "draft" :
                  request.status === "APPROVED" ? "published" :
                  "soldout"
                }`}>
                  {request.status}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <p className="mini" style={{ marginBottom: 4 }}>Farmer</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {request.farmer?.name || "Unknown"}
                    </p>
                    <p className="mini">{request.farmer?.email || ""}</p>
                  </div>
                  <div>
                    <p className="mini" style={{ marginBottom: 4 }}>Location</p>
                    <p style={{ margin: 0 }}>{request.location || "Not specified"}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <p className="mini" style={{ marginBottom: 4 }}>Price</p>
                    <p style={{ margin: 0 }}>৳{request.pricePerUnit}/{request.unit}</p>
                  </div>
                  <div>
                    <p className="mini" style={{ marginBottom: 4 }}>Quantity</p>
                    <p style={{ margin: 0 }}>{request.quantityAvailable} {request.unit}</p>
                  </div>
                  <div>
                    <p className="mini" style={{ marginBottom: 4 }}>Variety</p>
                    <p style={{ margin: 0 }}>{request.variety || "Not specified"}</p>
                  </div>
                </div>

                {request.description && (
                  <div style={{ marginBottom: 12 }}>
                    <p className="mini" style={{ marginBottom: 4 }}>Description</p>
                    <p style={{ margin: 0, color: "var(--muted)" }}>{request.description}</p>
                  </div>
                )}

                {request.imageUrl && (
                  <div style={{ marginBottom: 12 }}>
                    <p className="mini" style={{ marginBottom: 4 }}>Image</p>
                    <img 
                      src={request.imageUrl} 
                      alt={request.cropName}
                      style={{ 
                        width: 150, 
                        height: 150, 
                        objectFit: "cover", 
                        borderRadius: 8,
                        border: "1px solid var(--border)"
                      }}
                    />
                  </div>
                )}

                <div className="mini" style={{ color: "var(--muted)" }}>
                  Requested: {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>

              {request.status === "PENDING" && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label className="mini">Rejection Notes (if rejecting)</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Reason for rejection (optional)"
                    />
                  </div>
                  
                  <div style={{ display: "flex", gap: 10 }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleApproveReject(request._id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleApproveReject(request._id, "REJECTED")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {request.status !== "PENDING" && (
                <div style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  background: request.status === "APPROVED" ? "#f0f9ff" : "#fef2f2",
                  borderRadius: 8,
                  border: `1px solid ${request.status === "APPROVED" ? "#bae6fd" : "#fecaca"}`
                }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {request.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
                  </p>
                  {request.adminNotes && (
                    <p className="mini" style={{ marginTop: 4, marginBottom: 0 }}>
                      <strong>Notes:</strong> {request.adminNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropRequestsAdmin;