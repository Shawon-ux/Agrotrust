import React, { useEffect, useState } from "react";
import api from "../../api";

const StatCard = ({ title, value, icon, hint }) => (
  <div className="stat-card">
    <div className="stat-top">
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-meta">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
    {hint ? <p className="stat-hint">{hint}</p> : null}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    farmers: 0,
    buyers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
    try {
      setErr("");
      setLoading(true);

      // If you already have /api/dashboard/admin it will work.
      // Otherwise, just keep your old endpoint here.
      const res = await api.get("/dashboard/admin");
      setStats({
        totalUsers: res.data?.totalUsers ?? 0,
        farmers: res.data?.farmers ?? 0,
        buyers: res.data?.buyers ?? 0,
      });
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Admin Dashboard</h1>
            <p className="subhead">
              Overview of users and platform activity.
            </p>
          </div>

          <div className="hero-actions">
            <button className="btn" onClick={fetchStats}>
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => alert("Add admin actions here (Users, Complaints, Crops...)")}
            >
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={loading ? "…" : stats.totalUsers}
          icon="👥"
          hint="All registered accounts"
        />
        <StatCard
          title="Farmers"
          value={loading ? "…" : stats.farmers}
          icon="🌾"
          hint="Registered farmer accounts"
        />
        <StatCard
          title="Buyers"
          value={loading ? "…" : stats.buyers}
          icon="🛒"
          hint="Registered buyer accounts"
        />
      </div>

      <div className="dash-grid">
        <div className="card dash-card">
          <div className="card-title">
            <h3>Admin Shortcuts</h3>
            <span className="mini">Common tasks</span>
          </div>

          <div className="actions-grid">
            <button className="action-tile" onClick={() => (window.location.href = "/complaints")}>
              <div className="action-emoji">🧾</div>
              <div>
                <div className="action-title">Manage Complaints</div>
                <div className="action-sub">Review & update status</div>
              </div>
            </button>

            <button className="action-tile" onClick={() => (window.location.href = "/crops")}>
              <div className="action-emoji">🥕</div>
              <div>
                <div className="action-title">View Crops</div>
                <div className="action-sub">Browse crop listings</div>
              </div>
            </button>

            <button className="action-tile" onClick={() => alert("Build user list page next")}>
              <div className="action-emoji">🧑‍💼</div>
              <div>
                <div className="action-title">Users</div>
                <div className="action-sub">Search user accounts</div>
              </div>
            </button>

            <button className="action-tile" onClick={() => alert("Build analytics page next")}>
              <div className="action-emoji">📊</div>
              <div>
                <div className="action-title">Analytics</div>
                <div className="action-sub">Basic platform insights</div>
              </div>
            </button>
          </div>
        </div>

        <div className="card dash-card">
          <div className="card-title">
            <h3>Recent Activity (UI)</h3>
            <span className="mini">Sample section</span>
          </div>

          <div className="timeline">
            <div className="tl-item">
              <span className="tl-dot" />
              <div>
                <div className="tl-title">New user registered</div>
                <div className="tl-sub">A farmer created an account</div>
              </div>
              <div className="tl-time">Today</div>
            </div>

            <div className="tl-item">
              <span className="tl-dot" />
              <div>
                <div className="tl-title">Complaint submitted</div>
                <div className="tl-sub">Pending review</div>
              </div>
              <div className="tl-time">Yesterday</div>
            </div>

            <div className="tl-item">
              <span className="tl-dot" />
              <div>
                <div className="tl-title">New crop added</div>
                <div className="tl-sub">A listing was published</div>
              </div>
              <div className="tl-time">2 days</div>
            </div>
          </div>

          <button className="btn" style={{ marginTop: 12 }} onClick={() => alert("Connect this with real backend later")}>
            View all
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
