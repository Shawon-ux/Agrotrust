// src/pages/Orders/ReceiptPage.js — digital receipt (FR-23)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import { useLang } from "../../context/LanguageContext";

const ReceiptPage = () => {
  const { id } = useParams();
  const { t } = useLang();
  const [o, setO] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setO(r.data.order)).catch((e) => setError(e.response?.data?.message || "Failed to load receipt"));
  }, [id]);

  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!o) return <div className="container">{t("loading")}</div>;

  return (
    <div className="container narrow">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Link className="btn" to={`/orders/${id}`}>← Back</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ {t("print")}</button>
      </div>
      <div className="card receipt">
        <div className="receipt-head"><h2>🌱 AgroTrust</h2><span>{t("receipt")} #{o._id.slice(-8).toUpperCase()}</span></div>
        <p className="mini">{new Date(o.createdAt).toLocaleString()}</p>
        <table className="receipt-table">
          <tbody>
            <tr><td>Buyer</td><td>{o.buyer?.name}</td></tr>
            <tr><td>Farmer</td><td>{o.farmer?.name}</td></tr>
            <tr><td>Crop</td><td>{o.cropName}</td></tr>
            <tr><td>Quantity</td><td>{o.quantity} {o.unit}</td></tr>
            <tr><td>Price per {o.unit}</td><td>৳{o.pricePerUnit}</td></tr>
            <tr><td>Payment</td><td>{o.paymentMethod?.replace(/_/g, " ")} — {o.paymentStatus}</td></tr>
            <tr><td>Delivery address</td><td>{o.shippingAddress}</td></tr>
            <tr><td>Status</td><td>{o.status}</td></tr>
            <tr className="receipt-total"><td>Total</td><td>৳{o.totalPrice}</td></tr>
          </tbody>
        </table>
        <p className="mini" style={{ textAlign: "center", marginTop: 18 }}>Thank you for trading on AgroTrust.</p>
      </div>
    </div>
  );
};

export default ReceiptPage;
