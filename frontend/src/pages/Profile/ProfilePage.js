// src/pages/Profile/ProfilePage.js
import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABEL = { FARMER: "Farmer", BUYER: "Buyer", ADMIN: "Admin", GOV_OFFICIAL: "Government Official" };

const errMsg = (e) => e.response?.data?.message || e.message || "Something went wrong";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [requests, setRequests] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      const u = res.data.user;
      setProfile(u);
      setName(u.name || "");
      setAddress(u.address || "");
    } catch (e) {
      setMsg({ type: "error", text: errMsg(e) });
    }
  }, []);

  const loadRequests = useCallback(async () => {
    if (user?.role !== "ADMIN") return;
    try {
      const res = await api.get("/users/phone-requests");
      setRequests(res.data.requests || []);
    } catch (e) { /* ignore */ }
  }, [user?.role]);

  useEffect(() => { load(); loadRequests(); }, [load, loadRequests]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setMsg({ type: "", text: "" });
      await api.put("/users/profile", { name, address });
      await refreshUser();
      await load();
      setMsg({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  const requestPhone = async (e) => {
    e.preventDefault();
    try {
      setMsg({ type: "", text: "" });
      await api.post("/users/phone-change", { newPhone });
      setNewPhone("");
      await load();
      setMsg({ type: "success", text: "Request sent. An admin must approve it before your phone changes." });
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  const review = async (id, action) => {
    try {
      await api.put(`/users/phone-requests/${id}`, { action });
      await loadRequests();
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  if (!profile) return <div className="profile-wrap">{msg.text ? <div className="error">{msg.text}</div> : "Loading..."}</div>;

  const pr = profile.phoneChangeRequest;
  const joined = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
  const vs = profile.verificationStatus || "UNVERIFIED";

  return (
    <div className="profile-wrap">
      <div className="profile-head">
        <div className="profile-avatar">{(profile.name || "?").charAt(0).toUpperCase()}</div>
        <div>
          <h1>{profile.name}</h1>
          <div className="profile-tags">
            <span className="profile-tag">{ROLE_LABEL[profile.role] || profile.role}</span>
            <span className="profile-tag">{vs === "VERIFIED" ? "✓ Verified" : vs.charAt(0) + vs.slice(1).toLowerCase()}</span>
            <span className="profile-tag">Member since {joined}</span>
          </div>
        </div>
      </div>

      {msg.text && <div className={msg.type === "error" ? "error" : "success"}>{msg.text}</div>}

      <div className="profile-grid">
        <form className="card" onSubmit={saveProfile}>
          <div className="card-title"><h3>👤 Personal information</h3></div>
          <div className="field"><label>Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="field"><label>Email</label><input className="input" value={profile.email} readOnly /></div>
          <div className="field"><label>Role</label><input className="input" value={ROLE_LABEL[profile.role] || profile.role} readOnly /></div>
          <div className="field"><label>Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village / city, district" /></div>
          <button className="btn btn-primary" type="submit">Save changes</button>
        </form>

        <div className="card">
          <div className="card-title"><h3>📞 Phone number</h3></div>
          <div className="field">
            <label>Current phone</label>
            <input className="input" value={profile.phone || "Not added"} disabled />
            <div className="lock-note">🔒 You can’t change this yourself. Send a request and an admin will approve it.</div>
          </div>

          {pr?.status === "PENDING" && (
            <div className="req-box">⏳ Pending admin approval: <b>{pr.newPhone}</b></div>
          )}
          {pr?.status === "REJECTED" && (
            <div className="req-box rejected">❌ Your last request (<b>{pr.newPhone}</b>) was rejected.</div>
          )}

          <form onSubmit={requestPhone} style={{ marginTop: 16 }}>
            <div className="field">
              <label>Request new phone number</label>
              <input className="input" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
            </div>
            <button className="btn" type="submit" disabled={pr?.status === "PENDING"}>Send change request</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title"><h3>🛡️ Account & verification</h3></div>
          <div className="field"><label>Verification status</label><input className="input" value={vs} readOnly /></div>
          <div className="field"><label>Member since</label><input className="input" value={joined} readOnly /></div>
          <div className="field"><label>Enrolled courses</label><input className="input" value={(profile.enrolledCourses || []).length} readOnly /></div>
        </div>

        {user?.role === "ADMIN" && (
          <div className="card">
            <div className="card-title"><h3>📋 Phone change requests</h3></div>
            {requests.length === 0 ? (
              <p className="mini">No pending requests.</p>
            ) : (
              requests.map((r) => (
                <div className="req-row" key={r._id}>
                  <div>
                    <b>{r.name}</b> <span className="mini">({r.role})</span>
                    <div className="mini">{r.phone || "—"} → <b>{r.phoneChangeRequest.newPhone}</b></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => review(r._id, "approve")}>Approve</button>
                    <button className="btn btn-danger" onClick={() => review(r._id, "reject")}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
