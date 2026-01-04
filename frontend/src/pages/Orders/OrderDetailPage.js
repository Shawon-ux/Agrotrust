import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Fetch order error:", err);
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrder();
      alert(`Order status updated to ${status}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={() => navigate("/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error">Order not found</div>
        <button className="btn" onClick={() => navigate("/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

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

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Order Details</h1>
            <p className="subhead">Order #{order._id.slice(-8)}</p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={() => navigate("/orders")}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        {/* Order Information */}
        <div className="card span-8">
          <div className="card-title">
            <h3>Order Information</h3>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="mini">Order ID</label>
              <p style={{ marginTop: 4 }}>#{order._id.slice(-8)}</p>
            </div>
            
            <div>
              <label className="mini">Order Date</label>
              <p style={{ marginTop: 4 }}>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div>
              <label className="mini">Order Status</label>
              <p style={{ marginTop: 4 }}>
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </p>
            </div>
            
            <div>
              <label className="mini">Payment Status</label>
              <p style={{ marginTop: 4 }}>
                <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <label className="mini">Crop Details</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              {order.crop?.imageUrl && (
                <img 
                  src={order.crop.imageUrl} 
                  alt={order.cropName}
                  style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                />
              )}
              <div>
                <strong>{order.cropName}</strong>
                <div className="mini">
                  {order.crop?.variety && `${order.crop.variety} • `}
                  {order.crop?.location || "Bangladesh"}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <label className="mini">Quantity & Price</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
              <div>
                <div className="mini">Quantity</div>
                <strong>{order.quantity} {order.unit}</strong>
              </div>
              <div>
                <div className="mini">Price per unit</div>
                <strong>৳{order.pricePerUnit}/{order.unit}</strong>
              </div>
              <div>
                <div className="mini">Total Price</div>
                <strong style={{ fontSize: '1.2em' }}>৳{order.totalPrice}</strong>
              </div>
              <div>
                <div className="mini">Payment Method</div>
                <strong>{order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Farmer Information */}
        <div className="card span-4">
          <div className="card-title">
            <h3>Customer & Farmer</h3>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label className="mini">Buyer Information</label>
            <div style={{ marginTop: 8 }}>
              <strong>{order.buyer?.name || "N/A"}</strong>
              <div className="mini">{order.buyer?.email || ""}</div>
              <div className="mini">{order.buyer?.phone || ""}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label className="mini">Farmer Information</label>
            <div style={{ marginTop: 8 }}>
              <strong>{order.farmer?.name || "N/A"}</strong>
              <div className="mini">{order.farmer?.email || ""}</div>
              <div className="mini">{order.farmer?.phone || ""}</div>
            </div>
          </div>
          
          <div>
            <label className="mini">Shipping Address</label>
            <p style={{ marginTop: 8 }}>{order.shippingAddress || "Not provided"}</p>
          </div>
          
          {order.contactNumber && (
            <div style={{ marginTop: 12 }}>
              <label className="mini">Contact Number</label>
              <p style={{ marginTop: 4 }}>{order.contactNumber}</p>
            </div>
          )}
          
          {order.notes && (
            <div style={{ marginTop: 12 }}>
              <label className="mini">Notes</label>
              <p style={{ marginTop: 4 }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* Order Actions */}
        <div className="card span-12">
          <div className="card-title">
            <h3>Order Actions</h3>
          </div>
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "PENDING" && (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={() => updateOrderStatus("CONFIRMED")}
                >
                  Confirm Order
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => updateOrderStatus("CANCELLED")}
                >
                  Cancel Order
                </button>
              </>
            )}
            
            {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "CONFIRMED" && (
              <button 
                className="btn btn-primary" 
                onClick={() => updateOrderStatus("SHIPPED")}
              >
                Mark as Shipped
              </button>
            )}
            
            {(user.role === "FARMER" || user.role === "ADMIN" || user.role === "GOV_OFFICIAL") && order.status === "SHIPPED" && (
              <button 
                className="btn btn-primary" 
                onClick={() => updateOrderStatus("DELIVERED")}
              >
                Mark as Delivered
              </button>
            )}
            
            {user.role === "BUYER" && order.status === "PENDING" && (
              <button 
                className="btn btn-danger" 
                onClick={() => updateOrderStatus("CANCELLED")}
              >
                Cancel Order
              </button>
            )}
            
            <button className="btn" onClick={() => navigate("/orders")}>
              Back to Orders List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;