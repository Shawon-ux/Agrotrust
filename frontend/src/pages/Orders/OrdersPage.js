// src/pages/Orders/OrdersPage.js
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      let endpoint = "";
      
      if (user.role === "BUYER" || user.role === "ADMIN") {
        endpoint = "/orders/my-orders";
      } else if (user.role === "FARMER") {
        endpoint = "/orders/farmer-orders";
      } else {
        setError("Not authorized to view orders");
        return;
      }

      const res = await api.get(endpoint);
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
      alert(`Order status updated to ${status}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case "DELIVERED":
      case "COMPLETED":
        return "published";
      case "CANCELLED":
      case "FAILED":
        return "soldout";
      default:
        return "draft";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Orders</h1>
            <p className="subhead">
              {user.role === "BUYER" 
                ? "Track your purchases" 
                : user.role === "FARMER"
                ? "Manage your sales"
                : user.role === "ADMIN"
                ? "View all orders"
                : "Orders"}
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={fetchOrders}>Refresh</button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No orders found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            {user.role === "BUYER" 
              ? "You haven't placed any orders yet. Browse crops to get started."
              : user.role === "FARMER"
              ? "No one has ordered your crops yet."
              : user.role === "ADMIN"
              ? "No orders in the system."
              : "No orders found."}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">
            <h3>Order History</h3>
            <span className="mini">{orders.length} orders</span>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Order ID</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Crop</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Quantity</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Total</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Status</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Payment</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Date</th>
                  {(user.role === "FARMER" || user.role === "ADMIN") && (
                    <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className="mini">#{order._id.slice(-6)}</span>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <strong>{order.cropName || order.crop?.cropName || "Crop"}</strong>
                      {order.crop?.location && (
                        <div className="mini">{order.crop.location}</div>
                      )}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {order.quantity} {order.unit}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <strong>৳{order.totalPrice}</strong>
                      <div className="mini">৳{order.pricePerUnit}/{order.unit}</div>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="mini" style={{ marginTop: 4 }}>
                        {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online"}
                      </div>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className="mini">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    {(user.role === "FARMER" || user.role === "ADMIN") && (
                      <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                        {order.status === "PENDING" && (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => updateOrderStatus(order._id, "CONFIRMED")}
                            >
                              Confirm
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => updateOrderStatus(order._id, "CANCELLED")}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {order.status === "CONFIRMED" && (
                          <button 
                            className="btn btn-sm" 
                            onClick={() => updateOrderStatus(order._id, "SHIPPED")}
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === "SHIPPED" && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => updateOrderStatus(order._id, "DELIVERED")}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === "DELIVERED" && order.paymentMethod === "CASH_ON_DELIVERY" && order.paymentStatus !== "COMPLETED" && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => updateOrderStatus(order._id, "DELIVERED")}
                            disabled
                          >
                            Payment Complete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order summary stats */}
      {orders.length > 0 && (
        <div className="grid" style={{ marginTop: 14 }}>
          <div className="card span-6">
            <div className="card-title">
              <h3>Order Summary</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Total Orders:</span>
              <strong>{orders.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Total Amount:</span>
              <strong>৳{orders.reduce((sum, order) => sum + order.totalPrice, 0)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pending Orders:</span>
              <strong>{orders.filter(o => o.status === "PENDING").length}</strong>
            </div>
          </div>

          <div className="card span-6">
            <div className="card-title">
              <h3>Payment Summary</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Cash on Delivery:</span>
              <strong>{orders.filter(o => o.paymentMethod === "CASH_ON_DELIVERY").length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Completed Payments:</span>
              <strong>{orders.filter(o => o.paymentStatus === "COMPLETED").length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pending Payments:</span>
              <strong>{orders.filter(o => o.paymentStatus === "PENDING").length}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;