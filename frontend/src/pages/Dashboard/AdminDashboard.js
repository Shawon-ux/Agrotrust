// src/pages/Dashboard/AdminDashboard.js
import React, { useEffect, useState } from "react";
import api from "../../api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/admin");
        setData(res.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load admin dashboard");
      }
    };
    fetchData();
  }, []);

  if (err) return <div>{err}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Total Users: {data.totalUsers}</p>
      <p>Farmers: {data.totalFarmers}</p>
      <p>Buyers: {data.totalBuyers}</p>
    </div>
  );
};

export default AdminDashboard;
