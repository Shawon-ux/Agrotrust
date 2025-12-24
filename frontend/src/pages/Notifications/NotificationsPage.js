// src/pages/Notifications/NotificationsPage.js
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/notifications");
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadItems = items.filter(item => !item.isRead);
      for (const item of unreadItems) {
        await api.patch(`/notifications/${item._id}/read`);
      }
      load();
    } catch (e) {
      alert("Failed to mark all as read");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => { 
    load(); 
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatMessage = (message) => {
    return message.split('\n').map((line, index) => {
      if (line.includes('**') && line.includes('**')) {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} dangerouslySetInnerHTML={{ __html: boldText }} style={{ margin: '4px 0' }} />;
      }
      if (line.trim().startsWith('-')) {
        return <div key={index} style={{ marginLeft: '20px', margin: '2px 0' }}>• {line.substring(1).trim()}</div>;
      }
      return <p key={index} style={{ margin: '4px 0' }}>{line}</p>;
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "CROP_REQUEST":
        return "🌾";
      case "SUCCESS":
        return "✅";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "ORDER_UPDATE":
        return "📦";
      case "SUBSIDY_UPDATE":
        return "💰";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case "CROP_REQUEST":
        return { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" };
      case "SUCCESS":
        return { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" };
      case "WARNING":
        return { bg: "#fefce8", border: "#fde68a", text: "#854d0e" };
      case "ERROR":
        return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
      default:
        return { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Notifications</h1>
            <p className="subhead">Stay updated with your activity and requests.</p>
          </div>
          <div className="hero-actions">
            <button className="btn" onClick={load}>Refresh</button>
            {items.some(item => !item.isRead) && (
              <button className="btn btn-primary" onClick={markAllRead}>
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading notifications...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ marginTop: 0 }}>No notifications</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="grid" style={{ marginBottom: 16 }}>
            <div className="card span-4">
              <div className="card-title">
                <h3>Notification Stats</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Total:</span>
                <strong>{items.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Unread:</span>
                <strong>{items.filter(item => !item.isRead).length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Crop Requests:</span>
                <strong>{items.filter(item => item.type === "CROP_REQUEST").length}</strong>
              </div>
            </div>

            <div className="card span-8">
              <div className="card-title">
                <h3>Quick Actions</h3>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: 'wrap' }}>
                {user?.role === "ADMIN" && items.some(item => item.type === "CROP_REQUEST" && !item.isRead) && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => window.location.href = "/crops/requests"}
                  >
                    Review Crop Requests
                  </button>
                )}
                {user?.role === "FARMER" && items.some(item => item.type === "SUCCESS" && item.title.includes("Crop Approved")) && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => window.location.href = "/crops"}
                  >
                    View My Crops
                  </button>
                )}
                <button 
                  className="btn" 
                  onClick={() => {
                    const unread = items.filter(item => !item.isRead);
                    if (unread.length > 0) markAllRead();
                  }}
                >
                  Clear All Unread
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {items.map((n) => {
            const colors = getNotificationColor(n.type);
            const isExpanded = expandedId === n._id;
            const hasMetadata = n.metadata && Object.keys(n.metadata).length > 0;

            return (
              <div 
                className="card" 
                key={n._id} 
                style={{ 
                  marginBottom: 10,
                  borderLeft: `4px solid ${colors.border}`,
                  backgroundColor: colors.bg,
                  opacity: n.isRead ? 0.9 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ 
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        {getNotificationIcon(n.type)}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h3 style={{ 
                              margin: 0, 
                              color: colors.text,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              {n.title}
                              {!n.isRead && (
                                <span style={{
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: '#3b82f6',
                                  borderRadius: '50%',
                                  display: 'inline-block'
                                }} />
                              )}
                            </h3>
                            <div style={{ 
                              marginTop: 8, 
                              color: colors.text,
                              lineHeight: '1.5'
                            }}>
                              {formatMessage(n.message)}
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span className="mini" style={{ color: colors.text }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                            {!n.isRead && (
                              <button 
                                className="btn btn-sm" 
                                onClick={() => markRead(n._id)}
                                style={{ 
                                  padding: '4px 8px',
                                  fontSize: '12px'
                                }}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Metadata Section (Expandable) */}
                        {hasMetadata && (
                          <div style={{ marginTop: 12 }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => toggleExpand(n._id)}
                              style={{ 
                                padding: '4px 12px',
                                fontSize: '12px',
                                background: 'transparent',
                                border: `1px solid ${colors.border}`
                              }}
                            >
                              {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
                            </button>
                            
                            {isExpanded && (
                              <div style={{ 
                                marginTop: 12, 
                                padding: 12,
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: 8,
                                border: `1px solid ${colors.border}`
                              }}>
                                <h4 style={{ margin: '0 0 8px 0', color: colors.text }}>Detailed Information:</h4>
                                <div style={{ 
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                  gap: 8
                                }}>
                                  {Object.entries(n.metadata).map(([key, value]) => {
                                    if (key === 'timestamp' && value) {
                                      return (
                                        <div key={key} className="mini">
                                          <strong>{key}:</strong> {new Date(value).toLocaleString()}
                                        </div>
                                      );
                                    }
                                    if (typeof value === 'object') {
                                      return (
                                        <div key={key} className="mini">
                                          <strong>{key}:</strong> {JSON.stringify(value)}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={key} className="mini">
                                        <strong>{key}:</strong> {value || 'Not specified'}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                          {n.link && (
                            <button 
                              className="btn btn-sm btn-primary" 
                              onClick={() => window.location.href = n.link}
                              style={{ padding: '6px 12px' }}
                            >
                              View Details
                            </button>
                          )}
                          
                          {n.type === "CROP_REQUEST" && user?.role === "ADMIN" && (
                            <>
                              <button 
                                className="btn btn-sm" 
                                onClick={() => window.location.href = "/crops/requests"}
                                style={{ 
                                  padding: '6px 12px',
                                  background: '#10b981',
                                  color: 'white'
                                }}
                              >
                                Approve/Reject
                              </button>
                              {n.metadata?.farmerEmail && (
                                <a 
                                  href={`mailto:${n.metadata.farmerEmail}`}
                                  className="btn btn-sm"
                                  style={{ padding: '6px 12px' }}
                                >
                                  Contact Farmer
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;