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

    // Common useful pages for logged in users
    items.push({ to: "/notifications", label: "Notifications", icon: <NotificationsNoneIcon fontSize="small" /> });
    items.push({ to: "/chatbot", label: "Chatbot", icon: <SmartToyOutlinedIcon fontSize="small" /> });

    // FARMER pages
    if (user.role === "FARMER") {
      items.push({ to: "/subsidies", label: "Subsidies", icon: <PaymentsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/subsidies/apply", label: "Apply Subsidy", icon: <PaymentsOutlinedIcon fontSize="small" /> });
    }

    // ADMIN pages
    if (user.role === "ADMIN") {
      items.push({ to: "/admin", label: "Admin Panel", icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/analytics", label: "Analytics", icon: <InsightsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/verification", label: "Verification", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
      items.push({ to: "/ledger", label: "Blockchain Ledger", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> });
    }

    // GOV pages
    if (user.role === "GOV_OFFICIAL") {
      items.push({ to: "/subsidies", label: "Subsidy Programs", icon: <PaymentsOutlinedIcon fontSize="small" /> });
      items.push({ to: "/verification", label: "Verification", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
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
            <Link to="/" style={{ fontWeight: 800 }}>AgroTrust</Link>
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
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/education">
                  Education
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/complaints">
                  Complaints
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/search">
                  Search
                </NavLink>
              </>
            )}
          </div>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              {/* ✅ ICON ROW: show for ALL logged-in users */}
              <div className="icon-row">
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

                {/* ✅ 3 dots menu: show for ALL logged-in users */}
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

                        {/* small divider after first two common ones */}
                        {idx === 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </Menu>
              </div>

              <span className="pill">
                {user.name} ({user.role})
              </span>
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
