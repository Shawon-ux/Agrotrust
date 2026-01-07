// src/components/Navbar.js
import React, { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// MUI
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

// MUI Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const isActivePath = (path) => location.pathname === path;

  // ✅ Menu items by role (3-dots)
  const moreItems = useMemo(() => {
    if (!user) return [];

    const items = [];

    // Common items for all logged-in users
    items.push({ to: "/notifications", label: "Notifications", icon: <NotificationsNoneIcon fontSize="small" /> });
    items.push({ to: "/chatbot", label: "Chatbot", icon: <SmartToyOutlinedIcon fontSize="small" /> });
    items.push({ to: "/education", label: "Learning Platform", icon: <SchoolOutlinedIcon fontSize="small" /> });

    // Orders for BUYER, FARMER, ADMIN
    if (["BUYER", "FARMER", "ADMIN"].includes(user.role)) {
      items.push({ to: "/orders", label: "My Orders", icon: <ShoppingCartOutlinedIcon fontSize="small" /> });
    }

    // Get Verified for all users (except ADMIN/GOV who have admin verification panel)
    if (!["ADMIN", "GOV_OFFICIAL"].includes(user.role)) {
      items.push({ to: "/verification/me", label: "Get Verified", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
    }

    // FARMER-specific items
    if (user.role === "FARMER") {
      items.push({ to: "/subsidies", label: "Subsidies", icon: <PaymentsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/crops/request", label: "Request Crop", icon: <AddCircleOutlineOutlinedIcon fontSize="small" /> });
    }

    // ADMIN-specific items
    if (user.role === "ADMIN") {
      items.push({ to: "/admin", label: "Admin Panel", icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/analytics", label: "Analytics", icon: <InsightsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/verification", label: "Verification Panel", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
      items.push({ to: "/ledger", label: "Blockchain Ledger", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> });
      items.push({ to: "/crops/admin/add", label: "Add Crop", icon: <AddCircleOutlineOutlinedIcon fontSize="small" /> });
    }

    // GOV_OFFICIAL-specific items
    if (user.role === "GOV_OFFICIAL") {
      items.push({ to: "/subsidies", label: "Subsidy Programs", icon: <PaymentsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/verification", label: "Verification Panel", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
      items.push({ to: "/ledger", label: "Blockchain Ledger", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> });
      items.push({ to: "/analytics", label: "Analytics", icon: <InsightsOutlinedIcon fontSize="small" /> });
    }

    return items;
  }, [user]);

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <div className="brand">
            <div className="brand-badge" />
            <Link to="/" style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              AgroTrust
              {user?.verificationStatus === "VERIFIED" && (
                <span 
                  className="verified-badge" 
                  title="Verified User"
                  style={{
                    fontSize: "12px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </Link>
          </div>

          {/* Main links (shown for ALL logged in users) */}
          <div className="nav-links">
            {user && (
              <>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
                  Home
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/crops">
                  Crops
                </NavLink>

                {["BUYER", "FARMER", "ADMIN"].includes(user.role) && (
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/orders">
                    Orders
                  </NavLink>
                )}

                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/education">
                  Education
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/complaints">
                  Complaints
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/search">
                  Search
                </NavLink>
                
                {/* Add Verification link in main nav for ADMIN/GOV */}
                {["ADMIN", "GOV_OFFICIAL"].includes(user.role) && (
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/verification">
                    Verification
                  </NavLink>
                )}
              </>
            )}
          </div>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <div className="icon-row">
                {["BUYER", "FARMER", "ADMIN"].includes(user.role) && (
                  <Link
                    className={`icon-btn ${isActivePath("/orders") ? "active" : ""}`}
                    to="/orders"
                    title="My Orders"
                    aria-label="My Orders"
                  >
                    <ShoppingCartOutlinedIcon fontSize="small" />
                  </Link>
                )}

                <Link
                  className={`icon-btn ${isActivePath("/notifications") ? "active" : ""}`}
                  to="/notifications"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <NotificationsNoneIcon fontSize="small" />
                </Link>

                <Link
                  className={`icon-btn ${isActivePath("/chatbot") ? "active" : ""}`}
                  to="/chatbot"
                  title="Chatbot"
                  aria-label="Chatbot"
                >
                  <SmartToyOutlinedIcon fontSize="small" />
                </Link>

                <IconButton
                  onClick={openMenu}
                  className={`icon-btn ${open ? "active" : ""}`}
                  aria-label="More"
                  size="small"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={closeMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    sx: {
                      borderRadius: "14px",
                      border: "1px solid rgba(15, 23, 42, 0.10)",
                      boxShadow: "0 18px 45px rgba(2, 6, 23, 0.08)",
                      minWidth: 220,
                      overflow: "hidden",
                    },
                  }}
                >
                  {moreItems.length === 0 ? (
                    <MenuItem disabled>No actions</MenuItem>
                  ) : (
                    moreItems.map((it, idx) => (
                      <React.Fragment key={it.to}>
                        <MenuItem
                          onClick={closeMenu}
                          component={NavLink}
                          to={it.to}
                          style={{
                            gap: 10,
                            fontWeight: 650,
                          }}
                        >
                          {it.icon}
                          {it.label}
                        </MenuItem>

                        {/* Smart dividers based on user role and item type */}
                        {user.role === "FARMER" && idx === 4 && <Divider />}
                        {user.role === "ADMIN" && idx === 6 && <Divider />}
                        {user.role === "GOV_OFFICIAL" && idx === 6 && <Divider />}
                        {!["ADMIN", "FARMER", "GOV_OFFICIAL"].includes(user.role) && idx === 3 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </Menu>
              </div>

              <div className="user-info">
                <span className="pill">
                  {user.name} 
                  <span className="user-role">({user.role})</span>
                  {user.verificationStatus === "VERIFIED" && (
                    <span 
                      className="verified-indicator" 
                      title="Verified User"
                      style={{
                        marginLeft: 6,
                        color: "#22c55e",
                        fontSize: "14px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </span>
              </div>

              <button className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;