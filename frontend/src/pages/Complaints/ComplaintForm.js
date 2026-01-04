import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const ComplaintForm = () => {
  const { user } = useAuth();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form fields
  const [againstUser, setAgainstUser] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchComplaints = async () => {
    try {
      setErr("");
      const res = await api.get("/complaints");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      setSuccess("");
      await api.post("/complaints", {
        againstUser: againstUser.trim() || undefined,
        complaintType,
        description,
      });
      setAgainstUser("");
      setComplaintType("");
      setDescription("");
      setSuccess("Complaint submitted successfully!");
      fetchComplaints();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "Failed to submit complaint");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setErr("");
      await api.patch(`/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "Failed to update status");
    }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Complaints</h1>
            <p className="subhead">
              {isAdmin
                ? "Admin view: manage all submitted complaints."
                : "Your complaints: track status and submit new issues."}
            </p>
          </div>

          <div className="hero-actions">
            <button className="btn" onClick={fetchComplaints}>Refresh</button>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}
      {success && (
        <div className="card" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
          ✅ {success}
        </div>
      )}

      {/* LIST */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">
          <h3>{isAdmin ? "All Complaints" : "My Complaints"}</h3>
          <span className="mini">{rows.length} total</span>
        </div>

        {loading ? (
          <div className="mini">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="mini">No complaints found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Type</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Status</th>
                  {isAdmin && (
                    <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>From</th>
                  )}
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Against</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Created</th>
                  {isAdmin && (
                    <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c._id}>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <strong>{c.complaintType}</strong>
                      <div className="mini" style={{ marginTop: 4 }}>{c.description}</div>
                    </td>

                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className={`badge ${c.status === "REJECTED" ? "soldout" : ""}`}>
                        {c.status}
                      </span>
                    </td>

                    {isAdmin && (
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 700 }}>{c.createdBy?.name || "-"}</div>
                        <div className="mini">{c.createdBy?.email || ""}</div>
                      </td>
                    )}

                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {c.againstUser ? (
                        <>
                          <div style={{ fontWeight: 700 }}>{c.againstUser.name}</div>
                          <div className="mini">{c.againstUser.email}</div>
                        </>
                      ) : (
                        <span className="mini">—</span>
                      )}
                    </td>

                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className="mini">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </td>

                    {isAdmin && (
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        <select
                          className="input"
                          value={c.status}
                          onChange={(e) => updateStatus(c._id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_REVIEW">IN_REVIEW</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUBMIT FORM */}
      <div className="card">
        <div className="card-title">
          <h3>Submit Complaint</h3>
          <span className="mini">Create a new complaint</span>
        </div>

        <form className="form" onSubmit={submitComplaint}>
          <div>
            <label className="mini">Against User Email (Optional)</label>
            <input
              className="input"
              value={againstUser}
              onChange={(e) => setAgainstUser(e.target.value)}
              placeholder="Enter email address of the user..."
            />
          </div>

          <div>
            <label className="mini">Complaint Type</label>
            <input
              className="input"
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              placeholder="e.g. Fraud, Late delivery, Bad quality..."
              required
            />
          </div>

          <div>
            <label className="mini">Description</label>
            <textarea
              className="input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write full details..."
              required
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
