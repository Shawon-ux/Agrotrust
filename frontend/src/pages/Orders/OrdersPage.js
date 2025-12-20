import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      let endpoint = "";
      
      if (user.role === "BUYER") {
        endpoint = "/orders/my-orders";
      } else if (user.role === "FARMER") {
        endpoint = "/orders/farmer-orders";
      } else if (user.role === "ADMIN" || user.role === "GOV_OFFICIAL") {
        endpoint = "/orders/all";
      } else {
        setError("Not authorized to view orders");
        return;
      }

      const res = await api.get(endpoint);
      setOrders(res.data.orders || []);
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
      case "PENDING":
        return "pending";
      default:
        return "draft";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === "ALL") return true;
    return order.status === statusFilter;
  });

  const getRoleSpecificTitle = () => {
    switch(user.role) {
      case "BUYER":
        return "My Purchases";
      case "FARMER":
        return "Sales Orders";
      case "ADMIN":
        return "All Orders (Admin View)";
      case "GOV_OFFICIAL":
        return "All Orders (Government View)";
      default:
        return "Orders";
    }
  };

  const getRoleSpecificSubtitle = () => {
    switch(user.role) {
      case "BUYER":
        return "Track your purchases and order status";
      case "FARMER":
        return "Manage orders for your crops";
      case "ADMIN":
        return "Monitor and manage all orders in the system";
      case "GOV_OFFICIAL":
        return "View all orders for monitoring purposes";
      default:
        return "View and manage orders";
    }
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
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
            <h1 className="h1">{getRoleSpecificTitle()}</h1>
            <p className="subhead">{getRoleSpecificSubtitle()}</p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={fetchOrders}>Refresh</button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="toolbar">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini">Filter by status:</span>
            <div className="chips">
              <button className={`chip ${statusFilter === "ALL" ? "active" : ""}`} onClick={() => setStatusFilter("ALL")}>
                All ({orders.length})
              </button>
              <button className={`chip ${statusFilter === "PENDING" ? "active" : ""}`} onClick={() => setStatusFilter("PENDING")}>
                Pending ({orders.filter(o => o.status === "PENDING").length})
              </button>
              <button className={`chip ${statusFilter === "CONFIRMED" ? "active" : ""}`} onClick={() => setStatusFilter("CONFIRMED")}>
                Confirmed ({orders.filter(o => o.status === "CONFIRMED").length})
              </button>
              <button className={`chip ${statusFilter === "SHIPPED" ? "active" : ""}`} onClick={() => setStatusFilter("SHIPPED")}>
                Shipped ({orders.filter(o => o.status === "SHIPPED").length})
              </button>
              <button className={`chip ${statusFilter === "DELIVERED" ? "active" : ""}`} onClick={() => setStatusFilter("DELIVERED")}>
                Delivered ({orders.filter(o => o.status === "DELIVERED").length})
              </button>
              <button className={`chip ${statusFilter === "CANCELLED" ? "active" : ""}`} onClick={() => setStatusFilter("CANCELLED")}>
                Cancelled ({orders.filter(o => o.status === "CANCELLED").length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No orders found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            {statusFilter !== "ALL" 
              ? `No orders with status: ${statusFilter}`
              : user.role === "BUYER" 
                ? "You haven't placed any orders yet. Browse crops to get started."
                : user.role === "FARMER"
                ? "No one has ordered your crops yet."
                : "No orders in the system."}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">
            <h3>Order List</h3>
            <span className="mini">{filteredOrders.length} orders</span>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Order ID</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Crop</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Buyer/Farmer</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Quantity</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Total</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Status</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Payment</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Date</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <span className="mini" style={{ fontFamily: 'monospace' }}>#{order._id.slice(-8)}</span>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <strong>{order.cropName || order.crop?.cropName || "Crop"}</strong>
                      {order.crop?.location && (
                        <div className="mini">{order.crop.location}</div>
                      )}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {user.role === "FARMER" ? (
                        <>
                          <strong>Buyer: {order.buyer?.name || "N/A"}</strong>
                          <div className="mini">{order.buyer?.email || ""}</div>
                        </>
                      ) : user.role === "BUYER" ? (
                        <>
                          <strong>Farmer: {order.farmer?.name || "N/A"}</strong>
                          <div className="mini">{order.farmer?.email || ""}</div>
                        </>
                      ) : (
                        <>
                          <strong>Buyer: {order.buyer?.name || "N/A"}</strong>
                          <div className="mini">Farmer: {order.farmer?.name || "N/A"}</div>
                        </>
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
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button 
                          className="btn btn-sm" 
                          onClick={() => viewOrderDetails(order._id)}
                          style={{ width: "100%" }}
                        >
                          View
                        </button>
                        
                        {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "PENDING" && (
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
                        
                        {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "CONFIRMED" && (
                          <button 
                            className="btn btn-sm" 
                            onClick={() => updateOrderStatus(order._id, "SHIPPED")}
                            style={{ width: "100%" }}
                          >
                            Mark Shipped
                          </button>
                        )}
                        
                        {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "SHIPPED" && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => updateOrderStatus(order._id, "DELIVERED")}
                            style={{ width: "100%" }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        
                        {user.role === "BUYER" && order.status === "PENDING" && (
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => updateOrderStatus(order._id, "CANCELLED")}
                            style={{ width: "100%" }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </td>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Pending Orders:</span>
              <strong>{orders.filter(o => o.status === "PENDING").length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Completed Orders:</span>
              <strong>{orders.filter(o => o.status === "DELIVERED").length}</strong>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Pending Payments:</span>
              <strong>{orders.filter(o => o.paymentStatus === "PENDING").length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Failed Payments:</span>
              <strong>{orders.filter(o => o.paymentStatus === "FAILED").length}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;