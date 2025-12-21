import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function SubsidyPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === "FARMER";
  const isAdminOrGov = ["ADMIN", "GOV_OFFICIAL"].includes(user?.role);

  // Common State
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Farmer State
  const [myApplications, setMyApplications] = useState([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [applyNote, setApplyNote] = useState("");

  // Admin State
  const [allApplications, setAllApplications] = useState([]);
  const [editSubsidy, setEditSubsidy] = useState(null);
  const [expandedSubsidyId, setExpandedSubsidyId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Subsidy Form State
  const [newSubsidy, setNewSubsidy] = useState({
    title: "", amount: "", description: "", deadline: "", category: "CASH",
  });

  // --- Data Loading ---
  const loadData = async () => {
    try {
      setLoading(true);
      setErr("");
      // Load all active subsidies (public)
      const s = await api.get("/subsidies");
      setSubsidies(s.data || []);

      if (isFarmer) {
        const m = await api.get("/subsidies/mine");
        setMyApplications(m.data || []);
      }

      if (isAdminOrGov) {
        const all = await api.get("/subsidies/applications");
        setAllApplications(all.data || []);
      }
    } catch (e) {
      console.error(e);
      setErr("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [user]);

  // --- Farmer Actions ---
  const openApplyModal = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setApplyNote("");
    setApplyModalOpen(true);
    setMsg("");
    setErr("");
  };

  const submitApplication = async () => {
    if (!selectedSubsidy) return;
    try {
      await api.post("/subsidies/apply", {
        subsidyId: selectedSubsidy._id,
        note: applyNote,
      });
      setMsg("Application submitted successfully!");
      setApplyModalOpen(false);
      loadData();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to apply.");
    }
  };

  // --- Admin/Gov Actions ---
  const handleCreateSubsidy = async (e) => {
    e.preventDefault();
    try {
      await api.post("/subsidies", newSubsidy);
      setMsg("Subsidy created successfully!");
      setNewSubsidy({ title: "", amount: "", description: "", deadline: "", category: "CASH" });
      setCreateModalOpen(false);
      loadData();
    } catch (e) {
      setErr("Failed to create subsidy.");
    }
  };

  const handleUpdateSubsidy = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editSubsidy.title,
        amount: editSubsidy.amount,
        description: editSubsidy.description,
        deadline: editSubsidy.deadline,
        category: editSubsidy.category,
      };
      await api.patch(`/subsidies/${editSubsidy._id}`, payload);
      setMsg("Subsidy updated successfully!");
      setEditSubsidy(null);
      loadData();
    } catch (e) {
      setErr("Failed to update subsidy.");
    }
  };

  const updateStatus = async (appId, status) => {
    if (!window.confirm(`Mark application as ${status}?`)) return;
    try {
      await api.patch(`/subsidies/applications/${appId}`, { status });
      loadData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const toggleExpand = (id) => {
    setExpandedSubsidyId(expandedSubsidyId === id ? null : id);
  };

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      {/* Hero Header */}
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Subsidies & Grants</h1>
            <p className="subhead">
              {isFarmer ? "Browse available subsidies and track your applications." : "Manage government subsidies and review applications."}
            </p>
          </div>
          {isAdminOrGov && (
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
                + Create Subsidy
              </button>
            </div>
          )}
        </div>
      </div>

      {err && <div className="error" style={{ marginBottom: 20 }}>{err}</div>}
      {msg && <div className="success" style={{ marginBottom: 20 }}>{msg}</div>}

      {/* --- AVAILABLE SUBSIDIES LIST --- */}
      <div className="grid">
        <div className={isAdminOrGov ? "span-12" : "span-8"}>
          <div className="card-title">
            <h3>{isAdminOrGov ? "Manage Programs" : "Available Opportunities"}</h3>
            <span className="mini">{subsidies.length} Active</span>
          </div>

          {loading ? <p style={{ color: 'var(--muted)' }}>Loading subsidies...</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {subsidies
                .filter(s => {
                  if (!isFarmer) return true; // Show all to admin/gov/others
                  // Check if farmer has already applied
                  const hasApplied = myApplications.some(app => app.subsidy?._id === s._id);
                  return !hasApplied;
                })
                .map(s => {
                  const appsForThisSubsidy = allApplications.filter(a => a.subsidy?._id === s._id);
                  const pendingCount = appsForThisSubsidy.filter(a => a.status === "PENDING").length;

                  return (
                    <div key={s._id} className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
                      {/* Card Header Section */}
                      <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                            <span className="badge" style={{ background: "rgba(15,118,110,0.1)", color: "var(--primary)" }}>{s.category}</span>
                            {s.deadline && (
                              <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#b91c1c", borderColor: "transparent" }}>
                                Deadline: {new Date(s.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: 800 }}>{s.title}</h3>
                          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.5 }}>{s.description}</p>
                          <div style={{ marginTop: 12, fontWeight: 900, fontSize: "1.1rem", color: "var(--primary-2)" }}>
                            ৳{Number(s.amount).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                          {isAdminOrGov ? (
                            <>
                              <button className="btn" onClick={() => setEditSubsidy(s)}>Edit Program</button>
                              <button
                                className={`btn ${expandedSubsidyId === s._id ? 'active' : ''}`}
                                style={{ justifyContent: "space-between" }}
                                onClick={() => toggleExpand(s._id)}
                              >
                                <span>Applications</span>
                                <span style={{
                                  background: pendingCount > 0 ? "var(--primary)" : "#e2e8f0",
                                  color: pendingCount > 0 ? "white" : "#64748b",
                                  borderRadius: 99, padding: "2px 8px", fontSize: "0.75rem"
                                }}>{appsForThisSubsidy.length}</span>
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-primary" onClick={() => openApplyModal(s)}>Apply Now</button>
                          )}
                        </div>
                      </div>

                      {/* EXPANDED APPLICATIONS VIEW (ADMIN) */}
                      {isAdminOrGov && expandedSubsidyId === s._id && (
                        <div style={{ background: "#f8fafc", borderTop: "1px solid var(--border)", padding: "0 20px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0" }}>
                            <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Received Applications</h4>
                          </div>

                          {appsForThisSubsidy.length === 0 ? <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>No applications found.</p> : (
                            <div style={{ display: "grid", gap: 10 }}>
                              {appsForThisSubsidy.map(app => (
                                <div key={app._id} style={{ background: "white", padding: 12, borderRadius: 12, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 15 }}>
                                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: "bold", color: "#64748b" }}>
                                    {app.farmer?.name?.charAt(0)}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700 }}>{app.farmer?.name}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{app.farmer?.email}</div>
                                    {app.note && <div style={{ marginTop: 6, fontSize: "0.9rem", background: "#f1f5f9", padding: "6px 10px", borderRadius: 6 }}>"{app.note}"</div>}
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                    <StatusBadge status={app.status} />
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{new Date(app.createdAt).toLocaleDateString()}</div>
                                    {app.status === "PENDING" && (
                                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                        <button onClick={() => updateStatus(app._id, "APPROVED")} className="btn-icon" title="Approve" style={{ color: "green", background: "#dcfce7" }}>✓</button>
                                        <button onClick={() => updateStatus(app._id, "REJECTED")} className="btn-icon" title="Reject" style={{ color: "red", background: "#fee2e2" }}>✕</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              {subsidies.length === 0 && <div className="card">No active subsidies found.</div>}
            </div>
          )}
        </div>

        {/* --- FARMER: SIDEBAR APPLICATIONS --- */}
        {isFarmer && (
          <div className="span-4">
            <div className="card" style={{ position: "sticky", top: 100 }}>
              <div className="card-title">
                <h3>My Applications</h3>
              </div>
              {myApplications.length === 0 ? <p style={{ color: "var(--muted)" }}>You haven't applied to anything yet.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myApplications.map(app => (
                    <div key={app._id} style={{ paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.2 }}>{app.subsidy?.title}</div>
                          {app.subsidy?.category && (
                            <span style={{
                              display: "inline-block", marginTop: 4,
                              background: "rgba(15,118,110,0.1)", color: "var(--primary)",
                              fontSize: "0.7rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4
                            }}>
                              {app.subsidy.category}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap", marginLeft: 8 }}>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <StatusBadge status={app.status} />
                        {app.adminReply && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>1 Reply</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. APPLY MODAL */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply: ${selectedSubsidy?.title}`}>
        <p style={{ color: "var(--muted)", margin: "0 0 15px" }}>Provide a brief reason for your application to help the review process.</p>
        <textarea
          className="input"
          placeholder="State your reason / eligibility..."
          value={applyNote}
          onChange={e => setApplyNote(e.target.value)}
          rows={5}
          style={{ resize: "none" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button className="btn" onClick={() => setApplyModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitApplication}>Confirm Application</button>
        </div>
      </Modal>

      {/* 2. CREATE SUBSIDY MODAL */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Subsidy">
        <form onSubmit={handleCreateSubsidy} className="form">
          <input
            className="input" placeholder="Program Title" required
            value={newSubsidy.title} onChange={e => setNewSubsidy({ ...newSubsidy, title: e.target.value })}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              className="input" type="number" placeholder="Amount (৳)" required
              value={newSubsidy.amount} onChange={e => setNewSubsidy({ ...newSubsidy, amount: e.target.value })}
            />
            <select
              className="input"
              value={newSubsidy.category} onChange={e => setNewSubsidy({ ...newSubsidy, category: e.target.value })}
            >
              <option value="CASH">Financial (Cash)</option>
              <option value="FERTILIZER">Fertilizer</option>
              <option value="MACHINERY">Machinery</option>
              <option value="SEEDS">Seeds</option>
              <option value="INSURANCE">Insurance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <textarea
            className="input" placeholder="Description & Eligibility Requirements" rows={4}
            value={newSubsidy.description} onChange={e => setNewSubsidy({ ...newSubsidy, description: e.target.value })}
          />
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Application Deadline</label>
            <input
              className="input" type="date"
              value={newSubsidy.deadline} onChange={e => setNewSubsidy({ ...newSubsidy, deadline: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button className="btn" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Publish Program</button>
          </div>
        </form>
      </Modal>

      {/* 3. EDIT SUBSIDY MODAL */}
      {editSubsidy && (
        <Modal open={true} onClose={() => setEditSubsidy(null)} title="Edit Subsidy">
          <form onSubmit={handleUpdateSubsidy} className="form">
            <input className="input" value={editSubsidy.title} onChange={e => setEditSubsidy({ ...editSubsidy, title: e.target.value })} placeholder="Title" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="input" type="number" value={editSubsidy.amount} onChange={e => setEditSubsidy({ ...editSubsidy, amount: e.target.value })} placeholder="Amount" />
              <select
                className="input"
                value={editSubsidy.category || "CASH"} onChange={e => setEditSubsidy({ ...editSubsidy, category: e.target.value })}
              >
                <option value="CASH">Financial (Cash)</option>
                <option value="FERTILIZER">Fertilizer</option>
                <option value="MACHINERY">Machinery</option>
                <option value="SEEDS">Seeds</option>
                <option value="INSURANCE">Insurance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <textarea className="input" rows={4} value={editSubsidy.description} onChange={e => setEditSubsidy({ ...editSubsidy, description: e.target.value })} placeholder="Description" />
            <input className="input" type="date" value={editSubsidy.deadline ? editSubsidy.deadline.split('T')[0] : ''} onChange={e => setEditSubsidy({ ...editSubsidy, deadline: e.target.value })} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15 }}>
              <button className="btn" type="button" onClick={() => setEditSubsidy(null)}>Cancel</button>
              <button className="btn btn-primary" type="submit">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Styles for new elements */}
      <style>{`
        .btn-icon {
          width: 28px; height: 28px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; display: grid; place-items: center;
        }
        .btn-icon:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}

// Reusable Modal Component
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", zIndex: 9999, padding: 20
    }} onClick={onClose}>
      <div style={{
        background: "white", width: "100%", maxWidth: 500,
        borderRadius: 24, padding: 24,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        animation: "slideUp 0.2s ease-out"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "1.5rem", color: "var(--muted)", cursor: "pointer" }}>&times;</button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: { bg: "#fff7ed", color: "#c2410c", border: "#ffedd5" },
    APPROVED: { bg: "#ecfdf5", color: "#15803d", border: "#d1fae5" },
    REJECTED: { bg: "#fef2f2", color: "#b91c1c", border: "#fee2e2" },
  };
  const s = styles[status] || styles.PENDING;

  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "2px 8px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700,
      letterSpacing: "0.025em", textTransform: "uppercase"
    }}>
      {status}
    </span>
  );
}
